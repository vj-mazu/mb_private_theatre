import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDay, GAP_MIN, type Occ } from '../lib/day-schedule.ts';

// Times are minutes from midnight: 12:00 PM = 720.
const slot = (id: number, start: string, end: string) => ({ id, start_time: start, end_time: end });
const booking = (id: number, start: number, end: number): Occ => ({ start, end, bookingId: id, kind: 'booking' });
const day = (slots: ReturnType<typeof slot>[], booked: [number, Occ][] = [], blocks: { slotId: number | null }[] = []) =>
  Object.fromEntries(buildDay(slots, new Map(booked), blocks, 1).map((s) => [s.id, s]));

const THREE = [slot(1, '12:00', '15:00'), slot(2, '15:30', '18:30'), slot(3, '21:00', '23:59')];

test('an empty day: every slot is open at its normal time and can take up to 2 extra hours', () => {
  const d = day(THREE);
  for (const id of [1, 2, 3]) {
    assert.equal(d[id].status, 'open');
    assert.equal(d[id].shifted, false);
    assert.equal(d[id].maxExtra, 2);
  }
  assert.equal(d[1].start, 720);
});

test('a booking with +1 hour moves the next free slot to start 15 minutes after it', () => {
  const d = day(THREE, [[1, booking(11, 720, 960)]]); // 12:00 PM - 4:00 PM
  assert.equal(d[1].status, 'booked');
  assert.equal(d[2].status, 'open');
  assert.equal(d[2].shifted, true);
  assert.equal(d[2].start, 960 + GAP_MIN); // 4:15 PM
  assert.equal(d[2].end, 960 + GAP_MIN + 180); // still 3 hours long
  assert.equal(d[3].start, 21 * 60, 'the later slot keeps its time');
});

test('extra hours are blocked when the next slot is already booked', () => {
  const d = day(THREE, [[2, booking(12, 930, 1110)]]);
  assert.equal(d[1].status, 'open');
  assert.equal(d[1].maxExtra, 0);
});

test('only 1 extra hour is allowed when there is room for exactly 1', () => {
  const slots = [slot(1, '12:00', '15:00'), slot(2, '16:30', '19:30')];
  const d = day(slots, [[2, booking(12, 990, 1170)]]); // next booking at 4:30 PM
  assert.equal(d[1].maxExtra, 1); // 3:00 PM + 1 hr + 15 min gap = 4:15 PM, fits; +2 hrs does not
});

test('a moved slot that no longer fits in full becomes a short slot in the time left', () => {
  const slots = [slot(1, '12:00', '15:00'), slot(2, '15:30', '18:30'), slot(3, '19:00', '22:00'), slot(4, '22:30', '01:30')];
  const d = day(slots, [[1, booking(11, 720, 960)]]);
  assert.equal(d[2].status, 'open'); // 4:15 PM - 7:15 PM
  // 3 hours no longer fit before the 10:30 PM last slot: 7:30 PM - 9:00 PM is sold as a 1½-hour slot.
  assert.deepEqual([d[3].status, d[3].short, d[3].start, d[3].end], ['open', true, 1170, 1260]);
  assert.equal(d[4].status, 'open');
  assert.equal(d[4].shifted, false);
});

test('the last slot of the day never moves past its normal end: if pushed, only a short slot fits', () => {
  const slots = [slot(1, '12:00', '15:00'), slot(2, '15:30', '18:30')];
  const d = day(slots, [[1, booking(11, 720, 960)]]);
  // Pushed to 4:15 PM, it must still end by 6:30 PM: a 1½-hour slot 4:15 - 5:45 PM.
  assert.deepEqual([d[2].status, d[2].short, d[2].start, d[2].end], ['open', true, 975, 1065]);
});

test('a blocked slot cannot be booked and stops extra hours before it', () => {
  const d = day(THREE, [], [{ slotId: 2 }]);
  assert.equal(d[2].status, 'blocked');
  assert.equal(d[1].maxExtra, 0);
  assert.equal(d[3].status, 'open');
});

test('blocking the whole day blocks every slot', () => {
  const d = day(THREE, [], [{ slotId: null }]);
  for (const id of [1, 2, 3]) assert.equal(d[id].status, 'blocked');
});

test('after a cancellation the free slots go back to their normal times', () => {
  const withExtra = day(THREE, [[1, booking(11, 720, 960)]]);
  assert.equal(withExtra[2].shifted, true);
  const cancelled = day(THREE); // cancelled bookings are left out of the schedule
  assert.equal(cancelled[2].shifted, false);
  assert.equal(cancelled[2].start, 930); // back to 3:30 PM
});

test('a guest already booked at a moved time keeps that time when the earlier booking is cancelled', () => {
  // Slot 2 was booked at its moved time (4:15 PM - 7:15 PM); the 12:00 PM booking was then cancelled.
  const d = day(THREE, [[2, booking(12, 975, 1155)]]);
  assert.equal(d[2].status, 'booked');
  assert.equal(d[2].start, 975);
  assert.equal(d[1].status, 'open');
  assert.equal(d[1].start, 720);
  assert.equal(d[1].maxExtra, 1); // 3:00 PM + 1 hr + 15 min = 4:15 PM, exactly fits
});

// Celebration Theater, Electronic City: 7:00 - 9:00 PM, 9:15 - 11:15 PM, 11:30 PM - 1:00 AM.
const CELEBRATION = [slot(12, '19:00', '21:00'), slot(13, '21:15', '23:15'), slot(14, '23:30', '01:00')];
const LATE = booking(14, 1410, 1500); // 11:30 PM - 1:00 AM booked

test('short slot: 1½ hours free between bookings gives a 1-hour slot (15 min gap each side)', () => {
  const d = day(CELEBRATION, [[12, booking(12, 1140, 1320)], [14, LATE]]); // 7:00 - 10:00 PM (+1 hr)
  assert.equal(d[13].status, 'open');
  assert.equal(d[13].short, true);
  assert.equal(d[13].start, 22 * 60 + 15); // 10:15 PM
  assert.equal(d[13].end, 23 * 60 + 15); // 11:15 PM, then 15 min before the 11:30 PM booking
  assert.equal(d[13].maxExtra, 0, 'no extra hours on a short slot');
});

test('short slot: 2 hours free between bookings gives a 1½-hour slot', () => {
  const slots = [slot(12, '19:00', '21:00'), slot(13, '21:15', '23:15'), slot(14, '23:45', '01:00')];
  const d = day(slots, [[12, booking(12, 1140, 1305)], [14, booking(14, 1425, 1500)]]); // ends 9:45 PM; next 11:45 PM
  assert.deepEqual([d[13].status, d[13].short, d[13].end - d[13].start], ['open', true, 90]);
});

test('short slot: less than 1½ hours free means not available', () => {
  const d = day(CELEBRATION, [[12, booking(12, 1140, 1350)], [14, LATE]]); // runs to 10:30 PM; only 1 hr free
  assert.equal(d[13].status, 'unavailable');
  assert.equal(d[13].short, false);
});

test('a normal day has no short slots', () => {
  const d = day(CELEBRATION, [[14, LATE]]);
  for (const id of [12, 13]) assert.equal(d[id].short, false);
});

test('a fixed 1-hour or 1½-hour slot in the timetable is a short slot; 2-hour slots are not', () => {
  // Couple Theater, Electronic City: 2:30 - 4:30 PM, 5:00 - 6:00 PM, 6:30 - 8:30 PM, 11:00 PM - 1:00 AM; Celebration's 11:30 PM - 1:00 AM.
  const d = day([slot(3, '14:30', '16:30'), slot(4, '17:00', '18:00'), slot(5, '18:30', '20:30'), slot(9, '23:30', '01:00')]);
  assert.deepEqual([d[3].short, d[4].short, d[5].short, d[9].short], [false, true, false, true]);
  assert.equal(d[4].maxExtra, 2, 'a fixed short slot can still take extra time (free slots after it move)');
});
