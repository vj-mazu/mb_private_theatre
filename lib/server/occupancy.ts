import 'server-only';
import type { PoolClient } from 'pg';
import { q } from './db';
import { MAX_EXTRA_HOURS, slotSpan } from '../booking-rules';

/** Gap kept after a booking that runs past its scheduled end (extra hours or shifted slot). */
export const GAP_MIN = 15;

export const minToTime = (m: number) => {
  const x = ((m % 1440) + 1440) % 1440;
  return `${String(Math.floor(x / 60)).padStart(2, '0')}:${String(x % 60).padStart(2, '0')}`;
};

export interface DaySlot {
  id: number;
  theatreId: number;
  /** Effective times in minutes from midnight of the booking date (may exceed 1440 after midnight). */
  start: number;
  end: number;
  status: 'open' | 'booked' | 'blocked' | 'unavailable';
  shifted: boolean;
  maxExtra: number;
  bookingId?: number;
}

interface Occ { start: number; end: number; bookingId?: number; kind: 'booking' | 'block' }

/**
 * Builds the day's schedule for one theatre.
 * - Slots follow the configured timetable (its own gaps).
 * - When a booking runs past its scheduled end (extra hours), the following free slots move later
 *   to start GAP_MIN after it, cascading. The last slot of the day never moves.
 * - A moved slot that no longer fits before the next booked/blocked slot (or the fixed last slot) is unavailable.
 * - A free slot can take extra hours only while it ends GAP_MIN before the next booked/blocked time.
 */
export function buildDay(slots: { id: number; start_time: string; end_time: string }[], bookings: Map<number, Occ>, blocks: { slotId: number | null }[], theatreId: number): DaySlot[] {
  const ordered = slots.map((s) => ({ ...s, span: slotSpan(s.start_time, s.end_time, 0) })).sort((a, b) => a.span.start - b.span.start);
  const wholeDay = blocks.some((b) => b.slotId === null);
  const blockedIds = new Set(blocks.filter((b) => b.slotId !== null).map((b) => b.slotId));

  // Fixed obstacles in time order: bookings (actual times incl. extra hours) and blocked slots.
  const fixed: Occ[] = [];
  for (const s of ordered) {
    const b = bookings.get(s.id);
    if (b) fixed.push(b);
    else if (blockedIds.has(s.id)) fixed.push({ ...s.span, kind: 'block' });
  }
  const nextFixedStart = (after: number) => Math.min(...fixed.filter((f) => f.start >= after).map((f) => f.start), Infinity);

  const out: DaySlot[] = [];
  let carry = -Infinity; // earliest start for the next free slot
  ordered.forEach((s, idx) => {
    const isLast = idx === ordered.length - 1;
    const duration = s.span.end - s.span.start;
    const booking = bookings.get(s.id);

    if (booking) {
      out.push({ id: s.id, theatreId, start: booking.start, end: booking.end, status: 'booked', shifted: booking.start !== s.span.start, maxExtra: 0, bookingId: booking.bookingId });
      carry = booking.end > s.span.end ? booking.end + GAP_MIN : -Infinity;
      return;
    }
    if (wholeDay || blockedIds.has(s.id)) {
      out.push({ id: s.id, theatreId, start: s.span.start, end: s.span.end, status: 'blocked', shifted: false, maxExtra: 0 });
      carry = -Infinity;
      return;
    }

    const start = Math.max(s.span.start, carry);
    const end = start + duration;
    const shifted = start > s.span.start;
    // Next thing this slot must finish before (+gap): next booked/blocked time, or the fixed last slot.
    const lastSlot = ordered[ordered.length - 1];
    let limit = nextFixedStart(s.span.start + 1);
    if (!isLast && !bookings.has(lastSlot.id) && !blockedIds.has(lastSlot.id)) limit = Math.min(limit, lastSlot.span.start);

    if ((isLast && shifted) || (shifted && end + GAP_MIN > limit)) {
      out.push({ id: s.id, theatreId, start, end, status: 'unavailable', shifted, maxExtra: 0 });
      return; // carry unchanged: the next slot still has to clear the earlier booking
    }

    // Extra hours: only blocked by real bookings/blocks (free slots after it simply move).
    const hardLimit = nextFixedStart(s.span.start + 1);
    let maxExtra = 0;
    for (let h = 1; h <= MAX_EXTRA_HOURS; h++) {
      if (end + h * 60 + GAP_MIN > hardLimit) break;
      maxExtra = h;
    }
    out.push({ id: s.id, theatreId, start, end, status: 'open', shifted, maxExtra });
    carry = shifted ? end + GAP_MIN : -Infinity;
  });
  return out;
}

/** Schedules for these theatres on a date (optionally ignoring one booking, e.g. while rescheduling it). */
export async function daySchedule(theatreIds: number[], date: string, excludeBookingId = 0, ex?: PoolClient): Promise<DaySlot[]> {
  if (!theatreIds.length) return [];
  const [slots, bookings, blocks] = await Promise.all([
    q<any>('SELECT id, theatre_id, start_time, end_time FROM slots WHERE theatre_id = ANY($1::int[]) AND is_active', [theatreIds], ex),
    q<any>(`SELECT bk.id, bk.theatre_id, bk.slot_id, bk.extra_hours, bk.slot_start, bk.slot_end, s.start_time, s.end_time
            FROM bookings bk JOIN slots s ON s.id = bk.slot_id
            WHERE bk.booking_date=$1 AND bk.theatre_id = ANY($2::int[]) AND bk.status <> 'cancelled' AND NOT bk.is_deleted AND bk.id <> $3`,
      [date, theatreIds, excludeBookingId], ex),
    q<any>('SELECT theatre_id, slot_id FROM slot_blocks WHERE block_date=$1 AND theatre_id = ANY($2::int[])', [date, theatreIds], ex),
  ]);
  return theatreIds.flatMap((tid) => {
    const occ = new Map<number, Occ>();
    for (const b of bookings.filter((x) => x.theatre_id === tid)) {
      const span = slotSpan(b.slot_start || b.start_time, b.slot_end || b.end_time, b.extra_hours);
      occ.set(b.slot_id, { ...span, bookingId: b.id, kind: 'booking' });
    }
    return buildDay(slots.filter((s) => s.theatre_id === tid), occ, blocks.filter((b) => b.theatre_id === tid).map((b) => ({ slotId: b.slot_id })), tid);
  });
}

/**
 * Locks the theatre-day, then confirms the slot is open at its current (possibly shifted) time and can take
 * the requested extra hours. Returns the actual HH:MM start/end to store, or an error message.
 */
export async function reserveTime(c: PoolClient, theatreId: number, date: string, slotId: number, extraHours: number, excludeBookingId = 0)
  : Promise<{ ok: true; start: string; end: string; startMin: number } | { ok: false; error: string }> {
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`booking:${theatreId}:${date}`]);
  const day = await daySchedule([theatreId], date, excludeBookingId, c);
  const slot = day.find((s) => s.id === slotId);
  if (!slot) return { ok: false, error: 'Selected time slot is not available' };
  if (slot.status === 'booked') return { ok: false, error: 'This slot was just booked. Please choose another slot.' };
  if (slot.status === 'blocked') return { ok: false, error: 'This slot is blocked by the venue. Please choose another slot.' };
  if (slot.status === 'unavailable') return { ok: false, error: 'This slot is no longer available because an earlier booking was extended. Please choose another slot.' };
  if (extraHours > slot.maxExtra) {
    return { ok: false, error: slot.maxExtra === 0
      ? 'Extra time is not possible for this slot — the next slot is already booked.'
      : `Only ${slot.maxExtra} extra hour${slot.maxExtra > 1 ? 's are' : ' is'} possible for this slot — the next slot is booked.` };
  }
  return { ok: true, start: minToTime(slot.start), end: minToTime(slot.end), startMin: slot.start };
}
