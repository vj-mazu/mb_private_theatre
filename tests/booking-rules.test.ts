import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addonItem,
  cakeCharge,
  chargedQty,
  computeQuote,
  couponDiscount,
  dayMinutes,
  isSlotExpired,
  isValidPhone,
  phoneDigits,
  slotLabel,
  slotStartMs,
} from '../lib/booking-rules.ts';

test('phoneDigits and isValidPhone handle Indian mobile formats', () => {
  assert.equal(phoneDigits('+91 99029-23656'), '9902923656');
  assert.equal(phoneDigits('09876543210'), '9876543210');
  assert.equal(isValidPhone('9876543210'), true);
  assert.equal(isValidPhone('5876543210'), false);
  assert.equal(isValidPhone('98765'), false);
});

test('slotStartMs and isSlotExpired handle single-digit hours and after-midnight rollover', () => {
  const nineAm = slotStartMs('2026-12-01', '9:00');
  const nineAmPadded = slotStartMs('2026-12-01', '09:00');
  assert.equal(Number.isFinite(nineAm), true);
  assert.equal(nineAm, nineAmPadded);

  assert.equal(dayMinutes('00:30') >= 1440, true);
  const midnightSlot = slotStartMs('2026-12-01', '00:30');
  assert.equal(midnightSlot > nineAm, true);
  assert.equal(isSlotExpired('2026-12-01', '09:00', 15, nineAm + 16 * 60_000), true);
  assert.equal(isSlotExpired('2026-12-01', '09:00', 15, nineAm + 10 * 60_000), false);
  assert.equal(slotLabel('10:00', '13:00', 1), '10:00 AM – 2:00 PM (+1 hr)');
});

test('cakeCharge calculates 500g included vs custom and extra 500g steps', () => {
  const cake = { price: 499 };
  assert.equal(cakeCharge(cake, 0.5, true), 0);
  assert.equal(cakeCharge(cake, 1.0, true), 499);
  assert.equal(cakeCharge(cake, 0.5, false), 499);
  assert.equal(cakeCharge(cake, 1.0, false), 998);
  assert.equal(cakeCharge(null, 1.0, false), 0);
});

test('addonItem and chargedQty handle per-piece and pack-tier pricing', () => {
  const perPiece = { id: 1, name: 'Candle', price: 100 };
  assert.deepEqual(addonItem(perPiece, 3), { kind: 'addon', addon_id: 1, name: 'Candle', price: 100, qty: 3 });
  assert.equal(chargedQty({ kind: 'addon', name: 'Candle', price: 100, qty: 3, included: 1 }), 2);

  const tiered = { id: 2, name: 'Fog', price: 499, price_tiers: [{ qty: 2, price: 499, label: '2 pots' }, { qty: 4, price: 899, label: '4 pots' }] };
  assert.deepEqual(addonItem(tiered, 4), { kind: 'addon', addon_id: 2, name: 'Fog · 4 pots', price: 899, qty: 1, option: 4 });
  assert.equal(addonItem(tiered, 3), null);
});

test('computeQuote caps extra hours, avoids negative totals, and matches components', () => {
  const q = computeQuote({
    basePrice: 1499,
    includesCake: false,
    baseCapacity: 2,
    extraPersonPrice: 150,
    guests: 4,
    cakePrice: 499,
    items: [{ kind: 'addon', name: 'Fog', price: 499, qty: 1 }],
    discount: 200,
    extraHours: 5, // capped at MAX_EXTRA_HOURS = 2
    extraHourPrice: 500,
  });
  assert.equal(q.extraPersons, 2);
  assert.equal(q.extraPersonAmount, 300);
  assert.equal(q.extraHours, 2);
  assert.equal(q.extraHourAmount, 1000);
  assert.equal(q.subtotal, 1499 + 300 + 1000 + 499 + 499);
  assert.equal(q.total, q.subtotal - 200);
});

test('couponDiscount computes flat and percent discounts accurately', () => {
  assert.equal(couponDiscount({ discount_type: 'flat', value: 200 }, 1500), 200);
  assert.equal(couponDiscount({ discount_type: 'percent', value: 15 }, 2000), 300);
});
