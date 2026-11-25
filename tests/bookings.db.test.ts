// Real booking tests on a SEPARATE database (<your database>_test). Your real bookings are never touched.
// Needs PostgreSQL running and DATABASE_URL (from .env.local or the environment). Skipped when there is no database.
import test, { after, before, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { slotSpan, addDays, todayIST } from '../lib/booking-rules.ts';

const root = path.resolve(import.meta.dirname, '..');

function baseUrl(): string {
  if (process.env.TEST_DATABASE_URL) return process.env.TEST_DATABASE_URL;
  let url = process.env.DATABASE_URL || '';
  const env = path.join(root, '.env.local');
  if (!url && existsSync(env)) url = readFileSync(env, 'utf8').match(/^DATABASE_URL=(.*)$/m)?.[1]?.trim().replace(/^"|"$/g, '') || '';
  if (!url) return '';
  const u = new URL(url);
  u.pathname = `/${decodeURIComponent(u.pathname.slice(1))}_test`;
  return u.toString();
}

const TEST_URL = baseUrl();
const skip = !TEST_URL ? 'no DATABASE_URL: database tests skipped' : false;

let m: typeof import('../lib/server/bookings.ts');
let occupancy: typeof import('../lib/server/occupancy.ts');
let revenue: typeof import('../lib/server/revenue.ts');
let db: typeof import('../lib/server/db.ts');

const STAFF = { kind: 'staff', name: 'Test staff', role: 'admin', branch_id: null } as const;
const CUSTOMER = { kind: 'customer' } as const;
const DATE = addDays(todayIST(), 10);

// A theatre, two neighbouring slots too close together for +1 hour, a third slot, and its cheapest package.
let fx: { branch: number; theatre: number; first: number; second: number; other: number; firstEnd: number; secondStart: number;
  pkg: number; price: number; guests: number; extraHour: number };

const form = (over: Record<string, unknown> = {}) => ({
  branch_id: fx.branch, theatre_id: fx.theatre, slot_id: fx.first, booking_date: DATE, customer_name: 'Test Guest',
  phone: '9876543210', package_id: fx.pkg, guests: fx.guests, ...over,
});

before(async () => {
  if (skip) return;
  assert.match(new URL(TEST_URL).pathname, /_test$/, 'tests must only ever use a *_test database');
  // Build/refresh the test database exactly like the real setup does.
  const setup = spawnSync(process.execPath, ['scripts/db-setup.js'], {
    cwd: root, encoding: 'utf8', env: { ...process.env, DATABASE_URL: TEST_URL, DATABASE_SSL: 'false' },
  });
  assert.equal(setup.status, 0, `db-setup failed:\n${setup.stdout}\n${setup.stderr}`);

  process.env.DATABASE_URL = TEST_URL;
  process.env.DATABASE_SSL = 'false';
  delete process.env.WHATSAPP_TOKEN; // never send real WhatsApp messages from tests
  delete process.env.WHATSAPP_PHONE_NUMBER_ID;
  delete process.env.WHATSAPP_ADMIN_NUMBER;
  db = await import('../lib/server/db.ts');
  m = await import('../lib/server/bookings.ts');
  occupancy = await import('../lib/server/occupancy.ts');
  revenue = await import('../lib/server/revenue.ts');

  const theatres = await db.q<any>(`SELECT t.id, t.branch_id, t.base_capacity, t.extra_hour_price FROM theatres t
    JOIN branches b ON b.id=t.branch_id WHERE t.is_active AND b.is_active ORDER BY t.id`);
  for (const t of theatres) {
    const slots = (await db.q<any>('SELECT id, start_time, end_time FROM slots WHERE theatre_id=$1 AND is_active', [t.id]))
      .map((s) => ({ id: s.id, ...slotSpan(s.start_time, s.end_time) })).sort((a, b) => a.start - b.start);
    const pkg = await db.one<any>(`SELECT pp.package_id, pp.price FROM package_prices pp JOIN packages p ON p.id=pp.package_id
      WHERE pp.theatre_id=$1 AND p.is_active ORDER BY pp.price LIMIT 1`, [t.id]);
    if (!pkg || slots.length < 3) continue;
    const i = slots.findIndex((s, k) => k < slots.length - 1 && slots[k + 1].start - s.end < 60 + 15);
    if (i < 0) continue;
    const other = slots.find((s) => s.id !== slots[i].id && s.id !== slots[i + 1].id)!;
    fx = { branch: t.branch_id, theatre: t.id, first: slots[i].id, second: slots[i + 1].id, other: other.id,
      firstEnd: slots[i].end, secondStart: slots[i + 1].start, pkg: pkg.package_id, price: pkg.price,
      guests: t.base_capacity, extraHour: t.extra_hour_price };
    break;
  }
  assert.ok(fx, 'the test database needs an active theatre with 3+ slots and a package');
});

beforeEach(async () => {
  if (skip) return;
  await db.q('DELETE FROM payments; DELETE FROM booking_events; DELETE FROM whatsapp_messages; DELETE FROM bookings; DELETE FROM slot_blocks;');
  await db.q("DELETE FROM coupons WHERE code LIKE 'TEST%'");
});

after(async () => {
  if (skip || !db) return;
  await (globalThis as any).mbPool?.end();
});

const slotOf = async (id: number) => (await occupancy.daySchedule([fx.theatre], DATE)).find((s) => s.id === id)!;

test('a website booking waits for payment and charges the package price', { skip }, async () => {
  const b = await m.createBooking(form(), CUSTOMER);
  assert.equal(b.status, 'awaiting_payment');
  assert.ok(b.hold_expires_at, 'the slot is held for a limited time');
  assert.equal(b.total, fx.price);
  assert.equal(b.amount_paid, 0);
});

test('the price is always worked out by the server: a guest cannot give themselves a discount or advance', { skip }, async () => {
  const b = await m.createBooking(form({ discount: 5000, advance: 5000 }), CUSTOMER);
  assert.equal(b.discount, 0);
  assert.equal(b.amount_paid, 0);
  assert.equal(b.total, fx.price);
});

test('two guests booking the same slot at the same moment: only one succeeds', { skip }, async () => {
  const results = await Promise.allSettled([m.createBooking(form(), CUSTOMER), m.createBooking(form({ phone: '9876543211' }), CUSTOMER)]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  const failed = results.find((r) => r.status === 'rejected') as PromiseRejectedResult;
  assert.equal(failed.reason.status, 409);
  assert.match(failed.reason.message, /just booked/);
});

test('an extra hour is charged at the room price and moves the next free slot', { skip }, async () => {
  const b = await m.createBooking(form({ extra_hours: 1 }), CUSTOMER);
  assert.equal(b.total, fx.price + fx.extraHour);
  const next = await slotOf(fx.second);
  assert.equal(next.shifted, true);
  assert.equal(next.start, fx.firstEnd + 60 + occupancy.GAP_MIN);
});

test('extra hours are refused when the next slot is already booked', { skip }, async () => {
  await m.createBooking(form({ slot_id: fx.second }), STAFF);
  await assert.rejects(m.createBooking(form({ extra_hours: 1 }), CUSTOMER), /Extra time is not possible/);
  const ok = await m.createBooking(form(), CUSTOMER); // without extra hours it is fine
  assert.equal(ok.status, 'awaiting_payment');
});

test('cancelling a booking with an extra hour puts the next slot back to its normal time', { skip }, async () => {
  const b = await m.createBooking(form({ extra_hours: 1 }), STAFF);
  assert.equal((await slotOf(fx.second)).shifted, true);
  await m.setStatus(b.id, 'cancelled', 'Test staff', { reason: 'test' });
  const next = await slotOf(fx.second);
  assert.equal(next.shifted, false);
  assert.equal(next.start, fx.secondStart);
  assert.equal(next.status, 'open');
  const again = await m.createBooking(form(), CUSTOMER); // the cancelled slot can be booked again
  assert.equal(again.status, 'awaiting_payment');
});

test('a guest who does not pay in time loses the hold and the slot opens again', { skip }, async () => {
  const b = await m.createBooking(form(), CUSTOMER);
  await db.q("UPDATE bookings SET hold_expires_at = now() - interval '1 minute' WHERE id=$1", [b.id]);
  await m.releaseExpiredHolds();
  assert.equal((await m.getBooking({ id: b.id })).status, 'cancelled');
  const again = await m.createBooking(form({ phone: '9876543211' }), CUSTOMER);
  assert.equal(again.status, 'awaiting_payment');
});

test('coupons: the discount is applied, counted once, and given back when the booking is cancelled', { skip }, async () => {
  await db.q("INSERT INTO coupons (code, discount_type, value, min_amount) VALUES ('TEST10', 'percent', 10, 0)");
  const b = await m.createBooking(form({ coupon_code: 'test10' }), CUSTOMER);
  assert.equal(b.discount, Math.round(fx.price * 0.1));
  assert.equal(b.total, fx.price - b.discount);
  const used = async () => (await db.one<any>("SELECT used_count FROM coupons WHERE code='TEST10'")).used_count;
  assert.equal(await used(), 1);
  await m.setStatus(b.id, 'cancelled', 'Test staff', { reason: 'test' });
  assert.equal(await used(), 0);
  await assert.rejects(m.createBooking(form({ coupon_code: 'NOPE99' }), CUSTOMER), /not valid/);
});

test('revenue counts only completed bookings; advances are shown separately', { skip }, async () => {
  const today = todayIST();
  // Completed: 500 advance + 1000 at closing = 1500 revenue.
  const done = await m.createBooking(form({ advance: 500 }), STAFF);
  await m.addPayment(done.id, 1000, 'cash', 'Final payment', 'Test staff');
  await m.setStatus(done.id, 'completed', 'Test staff');
  // Confirmed with an advance, still to come.
  await m.createBooking(form({ slot_id: fx.second, advance: 700 }), STAFF);
  // Confirmed with an advance, but the date has passed and it was never closed (guest did not come).
  const noShow = await m.createBooking(form({ slot_id: fx.other, advance: 300 }), STAFF);
  await db.q('UPDATE bookings SET booking_date=$2 WHERE id=$1', [noShow.id, addDays(today, -3)]);
  // Cancelled with an advance: not revenue, not an advance.
  const gone = await m.createBooking(form({ slot_id: fx.other, booking_date: addDays(DATE, 1), advance: 400 }), STAFF);
  await m.setStatus(gone.id, 'cancelled', 'Test staff', { reason: 'test' });

  const r = await revenue.revenueReport(addDays(today, -10), addDays(today, 40), undefined, today);
  assert.equal(r.totals.bookings, 1);
  assert.equal(r.totals.revenue, 1500);
  assert.equal(r.advances.upcoming, 700);
  assert.equal(r.advances.upcoming_count, 1);
  assert.equal(r.advances.no_show, 300);
  assert.equal(r.advances.no_show_count, 1);
});

// ---- Short slots: a test room with Celebration Theater's timings (7:00-9:00 PM, 9:15-11:15 PM, 11:30 PM-1:00 AM). ----
async function shortRoom() {
  let t = await db.one<any>("SELECT id FROM theatres WHERE name='TEST Short Room'");
  if (!t) {
    t = await db.one<any>(`INSERT INTO theatres (branch_id, name, base_capacity, max_capacity, base_price, extra_person_price, extra_hour_price, short_slot_discount, sort_order, is_active)
      VALUES ($1,'TEST Short Room',6,12,1699,150,750,400,99,true) RETURNING id`, [fx.branch]);
    for (const [a, b] of [['19:00', '21:00'], ['21:15', '23:15'], ['23:30', '01:00']]) {
      await db.q('INSERT INTO slots (theatre_id, start_time, end_time, is_active) VALUES ($1,$2,$3,true)', [t.id, a, b]);
    }
    await db.q('INSERT INTO package_prices (package_id, theatre_id, price) VALUES ($1,$2,2200)', [fx.pkg, t.id]);
  }
  const ids = await db.q<any>('SELECT id, start_time FROM slots WHERE theatre_id=$1', [t.id]);
  const by = (s: string) => ids.find((r) => r.start_time === s).id;
  return { theatre: t.id, seven: by('19:00'), nine: by('21:15'), late: by('23:30') };
}
const roomForm = (r: { theatre: number }, over: Record<string, unknown>) => form({ theatre_id: r.theatre, guests: 6, ...over });

test('short slot: your Celebration case is sold as 10:15 - 11:15 PM with packages ₹400 less', { skip }, async () => {
  const r = await shortRoom();
  await m.createBooking(roomForm(r, { slot_id: r.late }), STAFF);
  await m.createBooking(roomForm(r, { slot_id: r.seven, extra_hours: 1 }), STAFF); // 7:00 - 10:00 PM
  const s = (await occupancy.daySchedule([r.theatre], DATE)).find((x) => x.id === r.nine)!;
  assert.deepEqual([s.status, s.short], ['open', true]);

  const b = await m.createBooking(roomForm(r, { slot_id: r.nine }), CUSTOMER);
  assert.equal(b.total, 2200 - 400);
  const full = await m.getBooking({ id: b.id });
  assert.equal(full.short_slot, true);
  assert.deepEqual([full.slot_start, full.slot_end], ['22:15', '23:15']);
  assert.equal(full.slot_label, '10:15 PM – 11:15 PM');
});

test('short slot: room-only price stays the same and extra hours are refused', { skip }, async () => {
  const r = await shortRoom();
  await m.createBooking(roomForm(r, { slot_id: r.late }), STAFF);
  await m.createBooking(roomForm(r, { slot_id: r.seven, extra_hours: 1 }), STAFF);
  await assert.rejects(m.createBooking(roomForm(r, { slot_id: r.nine, extra_hours: 1 }), STAFF), /short slot/);
  const roomOnly = await m.createBooking(roomForm(r, { slot_id: r.nine, package_id: null }), STAFF);
  assert.equal(roomOnly.total, 1699);
});

test('short slot: editing the booking keeps its time and price, even after the long booking is cancelled', { skip }, async () => {
  const r = await shortRoom();
  await m.createBooking(roomForm(r, { slot_id: r.late }), STAFF);
  const long = await m.createBooking(roomForm(r, { slot_id: r.seven, extra_hours: 1 }), STAFF);
  const b = await m.createBooking(roomForm(r, { slot_id: r.nine }), STAFF);
  await m.setStatus(long.id, 'cancelled', 'Test staff', { reason: 'test' });

  const edited = await m.updateBooking(b.id, { ...m.bookingToInput(await m.getBooking({ id: b.id })), customer_name: 'Edited Name' }, STAFF);
  assert.equal(edited.customer_name, 'Edited Name');
  assert.equal(edited.total, 1800);
  const after = await m.getBooking({ id: b.id });
  assert.deepEqual([after.slot_start, after.slot_end, after.short_slot], ['22:15', '23:15', true]);
});

test('normal slots are not affected: full price when nothing is squeezed', { skip }, async () => {
  const r = await shortRoom();
  const b = await m.createBooking(roomForm(r, { slot_id: r.nine }), CUSTOMER);
  assert.equal(b.total, 2200);
  assert.equal((await m.getBooking({ id: b.id })).short_slot, false);
});

test('a fixed 1-hour slot charges packages the room’s short-slot discount less (room only unchanged)', { skip }, async () => {
  const r = await shortRoom();
  let one = await db.one<any>("SELECT id FROM slots WHERE theatre_id=$1 AND start_time='16:00'", [r.theatre]);
  if (!one) one = await db.one<any>("INSERT INTO slots (theatre_id, start_time, end_time, is_active) VALUES ($1,'16:00','17:00',true) RETURNING id", [r.theatre]);
  await db.q('UPDATE theatres SET short_slot_discount=300 WHERE id=$1', [r.theatre]);
  try {
    const pkgBooking = await m.createBooking(roomForm(r, { slot_id: one.id }), CUSTOMER);
    assert.equal(pkgBooking.total, 2200 - 300);
    assert.equal((await m.getBooking({ id: pkgBooking.id })).short_slot, true);
    const roomOnly = await m.createBooking(roomForm(r, { slot_id: one.id, package_id: null, booking_date: addDays(DATE, 1) }), STAFF);
    assert.equal(roomOnly.total, 1699);
  } finally {
    await db.q('UPDATE theatres SET short_slot_discount=400 WHERE id=$1', [r.theatre]);
  }
});

test('the same person can book a slot with extra time and then the short slot after it', { skip }, async () => {
  const r = await shortRoom();
  await m.createBooking(roomForm(r, { slot_id: r.late, phone: '9000000001' }), STAFF);
  const same = { phone: '9876543210', customer_name: 'Same Guest' };
  const first = await m.createBooking(roomForm(r, { ...same, slot_id: r.seven, extra_hours: 1 }), CUSTOMER); // 7:00 - 10:00 PM
  const second = await m.createBooking(roomForm(r, { ...same, slot_id: r.nine }), CUSTOMER); // 10:15 - 11:15 PM short
  assert.equal(first.status, 'awaiting_payment');
  assert.equal(second.status, 'awaiting_payment');
  assert.equal(second.total, 1800);
  // ...but not the same slot twice.
  await assert.rejects(m.createBooking(roomForm(r, { ...same, slot_id: r.nine }), CUSTOMER), /just booked/);
});
