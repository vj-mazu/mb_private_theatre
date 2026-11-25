import 'server-only';
import type { PoolClient } from 'pg';
import { q } from './db';
import { slotSpan } from '../booking-rules';
import { buildDay, minToTime, type DaySlot, type Occ } from '../day-schedule';

export { GAP_MIN, minToTime } from '../day-schedule';
export type { DaySlot } from '../day-schedule';

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
  : Promise<{ ok: true; start: string; end: string; startMin: number; short: boolean } | { ok: false; error: string }> {
  await c.query('SELECT pg_advisory_xact_lock(hashtext($1))', [`booking:${theatreId}:${date}`]);
  const day = await daySchedule([theatreId], date, excludeBookingId, c);
  const slot = day.find((s) => s.id === slotId);
  if (!slot) return { ok: false, error: 'Selected time slot is not available' };
  if (slot.status === 'booked') return { ok: false, error: 'This slot was just booked. Please choose another slot.' };
  if (slot.status === 'blocked') return { ok: false, error: 'This slot is blocked by the venue. Please choose another slot.' };
  if (slot.status === 'unavailable') return { ok: false, error: 'This slot is no longer available because an earlier booking was extended. Please choose another slot.' };
  if (extraHours > slot.maxExtra) {
    return { ok: false, error: slot.maxExtra === 0
      ? (slot.short && slot.shifted ? 'Extra time is not possible for this short slot.' : 'Extra time is not possible for this slot — the next slot is already booked.')
      : `Only ${slot.maxExtra} extra hour${slot.maxExtra > 1 ? 's are' : ' is'} possible for this slot — the next slot is booked.` };
  }
  return { ok: true, start: minToTime(slot.start), end: minToTime(slot.end), startMin: slot.start, short: slot.short };
}
