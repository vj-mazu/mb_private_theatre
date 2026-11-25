import { MAX_EXTRA_HOURS, SHORT_SLOT_MINUTES, isShortLength, slotSpan } from './booking-rules';

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
  /** 1½ hours or less: a fixed short slot, or one squeezed by an earlier booking's extra hours. Packages cost less. */
  short: boolean;
  maxExtra: number;
  bookingId?: number;
}

export interface Occ { start: number; end: number; bookingId?: number; kind: 'booking' | 'block' }

/**
 * Builds the day's schedule for one theatre.
 * - Slots follow the configured timetable (its own gaps).
 * - When a booking runs past its scheduled end (extra hours), the following free slots move later
 *   to start GAP_MIN after it, cascading. The last slot of the day never moves.
 * - A moved slot that no longer fits before the next booked/blocked slot (or the fixed last slot) is offered as a short
 *   slot (SHORT_SLOT_MINUTES) in the time left, keeping GAP_MIN on both sides; if not even the shortest fits, it is unavailable.
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
      out.push({ id: s.id, theatreId, start: booking.start, end: booking.end, status: 'booked', shifted: booking.start !== s.span.start, short: false, maxExtra: 0, bookingId: booking.bookingId });
      carry = booking.end > s.span.end ? booking.end + GAP_MIN : -Infinity;
      return;
    }
    if (wholeDay || blockedIds.has(s.id)) {
      out.push({ id: s.id, theatreId, start: s.span.start, end: s.span.end, status: 'blocked', shifted: false, short: false, maxExtra: 0 });
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
      // The last slot must still end by its normal time (closing); any other slot GAP_MIN before what comes next.
      const room = (isLast ? s.span.end : limit - GAP_MIN) - start;
      const len = SHORT_SLOT_MINUTES.find((m) => m < duration && m <= room);
      if (len) {
        out.push({ id: s.id, theatreId, start, end: start + len, status: 'open', shifted, short: true, maxExtra: 0 });
        carry = start + len + GAP_MIN;
        return;
      }
      out.push({ id: s.id, theatreId, start, end, status: 'unavailable', shifted, short: false, maxExtra: 0 });
      return; // carry unchanged: the next slot still has to clear the earlier booking
    }

    // Extra hours: only blocked by real bookings/blocks (free slots after it simply move).
    const hardLimit = nextFixedStart(s.span.start + 1);
    let maxExtra = 0;
    for (let h = 1; h <= MAX_EXTRA_HOURS; h++) {
      if (end + h * 60 + GAP_MIN > hardLimit) break;
      maxExtra = h;
    }
    out.push({ id: s.id, theatreId, start, end, status: 'open', shifted, short: isShortLength(duration), maxExtra });
    carry = shifted ? end + GAP_MIN : -Infinity;
  });
  return out;
}
