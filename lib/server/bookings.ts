import 'server-only';
import crypto from 'crypto';
import { z } from 'zod';
import type { PoolClient } from 'pg';
import { q, one, tx, audit } from './db';
import { getSettings } from './catalog';
import { invalidateContent } from './cache';
import { reserveTime } from './occupancy';
import { sendWhatsApp } from './whatsapp';
import { MAX_EXTRA_HOURS, addonItem, priceTiers, isValidPhone, cakeCharge, kgLabel, normalizeKg, CAKE_MAX_KG, CAKE_MIN_KG, computeQuote, couponDiscount, isSlotExpired, slotLabel, todayIST, type BookingItem } from '../booking-rules';

export class BookingError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export type Actor = { kind: 'customer' } | { kind: 'staff'; name: string; role: 'admin' | 'staff'; branch_id: number | null };
const actorName = (a: Actor) => (a.kind === 'customer' ? 'customer' : a.name);

const PHONE_MSG = 'Enter a valid 10-digit mobile number';
// Exactly 10 digits (an optional +91 / 0 prefix is accepted); longer numbers are rejected, not truncated.
export function strictPhone(v: string): string {
  const d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d; // anything else must already be exactly 10 digits
}
const phone = z.string().transform(strictPhone).refine(isValidPhone, PHONE_MSG);
const optionalPhone = z.string().optional().default('').transform(strictPhone).refine((v) => v === '' || isValidPhone(v), PHONE_MSG);

export const bookingInput = z.object({
  branch_id: z.coerce.number().int().positive(),
  theatre_id: z.coerce.number().int().positive(),
  slot_id: z.coerce.number().int().positive(),
  booking_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  customer_name: z.string().trim().min(2, 'Enter the name').max(80),
  phone,
  whatsapp: optionalPhone,
  email: z.string().trim().max(120).optional().default(''),
  special_person_name: z.string().trim().max(80).optional().default(''),
  occasion: z.string().trim().max(60).optional().default(''),
  package_id: z.coerce.number().int().positive().nullable().optional().default(null),
  guests: z.coerce.number().int().min(1).max(50),
  extra_hours: z.coerce.number().int().min(0).max(MAX_EXTRA_HOURS, `At most ${MAX_EXTRA_HOURS} extra hours`).optional().default(0),
  cake_id: z.coerce.number().int().positive().nullable().optional().default(null),
  cake_kg: z.coerce.number().min(CAKE_MIN_KG, 'Cake must be at least 0.5 kg').max(CAKE_MAX_KG, 'Cake can be at most 5 kg')
    .refine((v) => Number.isInteger(v * 2), 'Cake weight must be in 0.5 kg steps').optional().default(0.5),
  addons: z.array(z.object({ addon_id: z.coerce.number().int().positive(), qty: z.coerce.number().int().min(1).max(20) })).max(40).optional().default([]),
  custom_items: z.array(z.object({ name: z.string().trim().min(1).max(80), price: z.coerce.number().int().min(0), qty: z.coerce.number().int().min(1).max(50).default(1) })).max(30).optional().default([]),
  coupon_code: z.string().trim().toUpperCase().max(30).optional().default(''),
  discount: z.coerce.number().int().min(0).optional().default(0), // staff only
  source: z.string().optional().default('website'),
  advance: z.coerce.number().int().min(0).optional().default(0), // staff only
  payment_method: z.string().optional().default('upi'),
  notes: z.string().trim().max(1000).optional().default(''),
});
export type BookingInput = z.infer<typeof bookingInput>;

function makeRef(branchSlug: string) {
  const code = branchSlug.split('-').map((p) => p[0]).join('').toUpperCase().slice(0, 3) || 'MB';
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  return `MB${code}-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
}

/** Cancels website holds whose payment window has passed, freeing the slot. */
export async function releaseExpiredHolds(ex?: PoolClient) {
  await q(
    `UPDATE bookings SET status='cancelled', cancel_reason='Payment not completed in time', updated_at=now()
     WHERE status='awaiting_payment' AND hold_expires_at IS NOT NULL AND hold_expires_at < now()`,
    [], ex
  );
}

async function priceBooking(input: BookingInput, actor: Actor, ex: PoolClient) {
  const theatre = await one<any>(
    `SELECT t.*, b.slug AS branch_slug, b.name AS branch_name FROM theatres t JOIN branches b ON b.id=t.branch_id
     WHERE t.id=$1 AND t.branch_id=$2`, [input.theatre_id, input.branch_id], ex);
  if (!theatre) throw new BookingError('Selected theatre is not available');
  if (actor.kind === 'customer' && !theatre.is_active) throw new BookingError('Selected theatre is not available');
  if (actor.kind === 'staff' && actor.role === 'staff' && actor.branch_id && actor.branch_id !== input.branch_id) {
    throw new BookingError('You can only create bookings for your branch', 403);
  }

  const slot = await one<any>('SELECT * FROM slots WHERE id=$1 AND theatre_id=$2', [input.slot_id, input.theatre_id], ex);
  if (!slot) throw new BookingError('Selected time slot is not available');
  if (input.guests > theatre.max_capacity) throw new BookingError(`${theatre.name} allows up to ${theatre.max_capacity} guests`);

  let packageName = 'Custom';
  let basePrice = theatre.base_price;
  let includesCake = false;
  let packageIncludes: string[] = [];
  if (input.package_id) {
    const pkg = await one<any>(
      `SELECT p.name, p.includes, p.includes_cake, pp.price FROM packages p JOIN package_prices pp ON pp.package_id=p.id AND pp.theatre_id=$2
       WHERE p.id=$1 AND p.is_active`, [input.package_id, input.theatre_id], ex);
    if (!pkg) throw new BookingError('Selected package is not available for this theatre');
    packageName = pkg.name;
    basePrice = pkg.price;
    includesCake = pkg.includes_cake;
    packageIncludes = Array.isArray(pkg.includes) ? pkg.includes : [];
  } else {
    const custom = (await getSettings()).custom_package;
    if (actor.kind === 'customer' && !custom.enabled) throw new BookingError('Please choose a package');
    packageIncludes = custom.includes;
  }

  let cake: any = null;
  if (input.cake_id) {
    cake = await one<any>(`SELECT id, name, price FROM cakes WHERE id=$1${actor.kind === 'customer' ? ' AND is_active' : ''}`, [input.cake_id], ex);
    if (!cake) throw new BookingError('Selected cake is not available');
    cake.label = `${cake.name} · ${kgLabel(normalizeKg(input.cake_kg))}`;
  }
  const cakeKg = cake ? normalizeKg(input.cake_kg) : 0.5;
  const cakePrice = cakeCharge(cake, cakeKg, includesCake);

  const items: BookingItem[] = [];
  if (input.addons.length) {
    const addons = await q<any>(`SELECT id, name, price, price_tiers FROM addons WHERE id = ANY($1::int[])${actor.kind === 'customer' ? ' AND is_active' : ''}`, [input.addons.map((a) => a.addon_id)], ex);
    const seen = new Set<number>();
    for (const a of input.addons) {
      const found = addons.find((x) => x.id === a.addon_id);
      if (!found) throw new BookingError('One of the selected add-ons is no longer available');
      if (seen.has(found.id)) continue; // ignore duplicate lines
      seen.add(found.id);
      // Add-ons are always extras on top of the package (what the package includes is listed separately).
      // Pack-priced add-ons (fog pots) are charged at the pack price for the chosen pack.
      const item = addonItem(found, a.qty);
      if (!item) throw new BookingError(`${found.name}: choose one of ${priceTiers(found).map((t) => t.label).join(', ')}`);
      items.push(item);
    }
  }
  if (actor.kind === 'staff') {
    for (const c of input.custom_items) items.push({ kind: 'custom', name: c.name, price: c.price, qty: c.qty });
  }

  const pre = computeQuote({
    basePrice, includesCake: false, baseCapacity: theatre.base_capacity, extraPersonPrice: theatre.extra_person_price,
    guests: input.guests, cakePrice, items, discount: 0, extraHours: input.extra_hours, extraHourPrice: theatre.extra_hour_price,
  });

  let discount = actor.kind === 'staff' ? input.discount : 0;
  let couponCode = '';
  if (input.coupon_code) {
    const c = await one<any>(
      `SELECT * FROM coupons WHERE code=$1 AND is_active AND (expires_on IS NULL OR expires_on >= CURRENT_DATE)
       AND (usage_limit IS NULL OR used_count < usage_limit)`, [input.coupon_code], ex);
    if (!c) throw new BookingError('This coupon code is not valid');
    if (pre.subtotal < c.min_amount) throw new BookingError(`Coupon needs a minimum booking of ₹${c.min_amount}`);
    discount += couponDiscount(c, pre.subtotal);
    couponCode = c.code;
  }

  const quote = computeQuote({
    basePrice, includesCake: false, baseCapacity: theatre.base_capacity, extraPersonPrice: theatre.extra_person_price,
    guests: input.guests, cakePrice, items, discount, extraHours: input.extra_hours, extraHourPrice: theatre.extra_hour_price,
  });

  return { theatre, slot, packageName, packageIncludes, cake, items, quote, couponCode };
}

function assertSlotOpen(date: string, start: string, cutoff: number, actor: Actor) {
  if (date < todayIST()) throw new BookingError('This date has already passed');
  if (actor.kind === 'customer' && isSlotExpired(date, start, cutoff)) {
    throw new BookingError('This time slot has already started. Please pick another slot.');
  }
}

function uniqueViolation(err: any) {
  return err?.code === '23505' && String(err?.constraint || '').includes('bookings_slot_unique');
}

export async function createBooking(raw: unknown, actor: Actor) {
  const input = bookingInput.parse(raw);
  const settings = await getSettings();
  await releaseExpiredHolds();

  try {
    const booking = await tx(async (c) => {
      const p = await priceBooking(input, actor, c);
      const time = await reserveTime(c, input.theatre_id, input.booking_date, input.slot_id, input.extra_hours);
      if (!time.ok) throw new BookingError(time.error, 409);
      assertSlotOpen(input.booking_date, time.start, settings.booking.slot_cutoff_minutes, actor);

      const isStaff = actor.kind === 'staff';
      const advance = isStaff ? Math.min(input.advance, p.quote.total) : 0;
      const status = isStaff ? 'confirmed' : 'awaiting_payment';
      const holdExpires = isStaff ? null : new Date(Date.now() + settings.booking.hold_minutes * 60_000);

      let row: any = null;
      for (let attempt = 0; attempt < 3 && !row; attempt++) {
        row = await one<any>(
          `INSERT INTO bookings (ref, branch_id, theatre_id, slot_id, booking_date, slot_label, customer_name, phone, whatsapp, email,
             special_person_name, occasion, package_id, package_name, base_amount, guests, extra_persons, extra_person_amount,
             cake_name, cake_amount, items, items_amount, coupon_code, discount, total, amount_paid, status, source, hold_expires_at, notes, created_by, cake_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32)
           ON CONFLICT (ref) DO NOTHING RETURNING *`,
          [makeRef(p.theatre.branch_slug), input.branch_id, input.theatre_id, input.slot_id, input.booking_date,
            slotLabel(time.start, time.end, input.extra_hours), input.customer_name, input.phone, input.whatsapp || input.phone, input.email,
            input.special_person_name, input.occasion, input.package_id, p.packageName, p.quote.base, input.guests, p.quote.extraPersons,
            p.quote.extraPersonAmount, p.cake?.label || '', p.quote.cakeAmount, JSON.stringify(p.items), p.quote.itemsAmount,
            p.couponCode, p.quote.discount, p.quote.total, advance, status, isStaff ? input.source : 'website', holdExpires,
            input.notes, actorName(actor), p.cake?.id ?? null], c);
      }
      if (!row) throw new BookingError('Could not generate a booking reference, please retry', 500);
      await q('UPDATE bookings SET cake_kg=$2, package_includes=$3, extra_hours=$4, extra_hour_amount=$5, slot_start=$6, slot_end=$7 WHERE id=$1',
        [row.id, normalizeKg(input.cake_kg), JSON.stringify(p.packageIncludes), p.quote.extraHours, p.quote.extraHourAmount, time.start, time.end], c);

      if (advance > 0) {
        await q('INSERT INTO payments (booking_id, amount, method, note, recorded_by) VALUES ($1,$2,$3,$4,$5)',
          [row.id, advance, input.payment_method, 'Advance', actorName(actor)], c);
      }
      if (p.couponCode) { await q('UPDATE coupons SET used_count = used_count + 1 WHERE code=$1', [p.couponCode], c); invalidateContent(); }
      await q('INSERT INTO booking_events (booking_id, actor, action, details) VALUES ($1,$2,$3,$4)',
        [row.id, actorName(actor), 'created', JSON.stringify({ source: row.source, total: row.total })], c);
      return row;
    });

    if (actor.kind === 'staff') {
      const full = await getBooking({ id: booking.id });
      if (full) await sendWhatsApp({ to: full.whatsapp || full.phone, kind: 'confirmation', booking: full });
    }
    return booking;
  } catch (err) {
    if (uniqueViolation(err)) throw new BookingError('This slot was just booked. Please choose another slot.', 409);
    throw err;
  }
}

/** Staff edit: re-prices the booking from the submitted form (date/slot changes = reschedule). */
export async function updateBooking(id: number, raw: unknown, actor: Extract<Actor, { kind: 'staff' }>) {
  const input = bookingInput.parse(raw);
  try {
    return await tx(async (c) => {
      const before = await one<any>('SELECT * FROM bookings WHERE id=$1 FOR UPDATE', [id], c);
      if (!before) throw new BookingError('Booking not found', 404);
      if (before.status === 'completed') throw new BookingError('Completed bookings cannot be edited');
      // The form's discount is the full discount; a coupon is only applied again when a new code is entered.
      const couponChanged = Boolean(input.coupon_code) && input.coupon_code !== before.coupon_code;
      const p = await priceBooking({ ...input, coupon_code: couponChanged ? input.coupon_code : '' }, actor, c);
      // Reschedule / extension safety: the new time must be free of other bookings and blocks.
      const time = await reserveTime(c, input.theatre_id, input.booking_date, input.slot_id, input.extra_hours, id);
      if (!time.ok) throw new BookingError(time.error, 409);
      const discount = p.quote.discount;
      const total = p.quote.total;
      const couponCode = couponChanged ? p.couponCode : before.coupon_code;

      const rescheduled = before.booking_date !== input.booking_date || before.slot_id !== input.slot_id || before.theatre_id !== input.theatre_id
        || before.extra_hours !== input.extra_hours;
      const row = await one<any>(
        `UPDATE bookings SET branch_id=$2, theatre_id=$3, slot_id=$4, booking_date=$5, slot_label=$6, customer_name=$7, phone=$8,
           whatsapp=$9, email=$10, special_person_name=$11, occasion=$12, package_id=$13, package_name=$14, base_amount=$15, guests=$16,
           extra_persons=$17, extra_person_amount=$18, cake_name=$19, cake_amount=$20, items=$21, items_amount=$22,
           coupon_code=$23, discount=$24, total=$25, source=$26, notes=$27, cake_id=$28, updated_at=now()
         WHERE id=$1 RETURNING *`,
        [id, input.branch_id, input.theatre_id, input.slot_id, input.booking_date, slotLabel(time.start, time.end, input.extra_hours),
          input.customer_name, input.phone, input.whatsapp || input.phone, input.email, input.special_person_name, input.occasion,
          input.package_id, p.packageName, p.quote.base, input.guests, p.quote.extraPersons, p.quote.extraPersonAmount,
          p.cake?.label || '', p.quote.cakeAmount, JSON.stringify(p.items), p.quote.itemsAmount,
          couponCode, discount, total, input.source, input.notes, p.cake?.id ?? null], c);
      await q('UPDATE bookings SET cake_kg=$2, package_includes=$3, extra_hours=$4, extra_hour_amount=$5, slot_start=$6, slot_end=$7 WHERE id=$1',
        [id, normalizeKg(input.cake_kg), JSON.stringify(p.packageIncludes), p.quote.extraHours, p.quote.extraHourAmount, time.start, time.end], c);
      if (couponChanged) await q('UPDATE coupons SET used_count = used_count + 1 WHERE code=$1', [couponCode], c);

      await q('INSERT INTO booking_events (booking_id, actor, action, details) VALUES ($1,$2,$3,$4)', [id, actor.name, rescheduled ? 'rescheduled' : 'edited',
        JSON.stringify(rescheduled ? { from: `${before.booking_date} ${before.slot_label}`, to: `${row.booking_date} ${row.slot_label}` } : { total: [before.total, row.total] })], c);
      return { row, rescheduled };
    }).then(async (r) => {
      if (r.rescheduled) {
        const full = await getBooking({ id });
        // Guests hear about changes only once their booking is confirmed (verified).
        if (full && full.status === 'confirmed') await sendWhatsApp({ to: full.whatsapp || full.phone, kind: 'reschedule', booking: full });
      }
      return r.row;
    });
  } catch (err) {
    if (uniqueViolation(err)) throw new BookingError('That slot is already booked', 409);
    throw err;
  }
}

export async function getBooking(where: { id?: number; ref?: string }) {
  const row = await one<any>(
    `SELECT bk.*, t.name AS theatre_name, t.image_url AS theatre_image, br.name AS branch_name, br.address AS branch_address,
            br.map_url, br.phone AS branch_phone,
            (SELECT method FROM payments WHERE booking_id = bk.id ORDER BY created_at DESC LIMIT 1) AS payment_method
     FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id JOIN branches br ON br.id=bk.branch_id
     WHERE ${where.id ? 'bk.id=$1' : 'bk.ref=$1'}`, [where.id ?? where.ref]);
  return row;
}

export async function recordEvent(bookingId: number, actor: string, action: string, details: unknown = {}) {
  await q('INSERT INTO booking_events (booking_id, actor, action, details) VALUES ($1,$2,$3,$4)', [bookingId, actor, action, JSON.stringify(details)]);
  await audit(actor, action, 'booking', bookingId, details);
}

/** Converts a stored booking back into form input (used by edit + close). */
export function bookingToInput(b: any): BookingInput {
  const items: BookingItem[] = b.items || [];
  return {
    branch_id: b.branch_id, theatre_id: b.theatre_id, slot_id: b.slot_id, booking_date: b.booking_date,
    customer_name: b.customer_name, phone: b.phone, whatsapp: b.whatsapp, email: b.email,
    special_person_name: b.special_person_name, occasion: b.occasion, package_id: b.package_id, guests: b.guests,
    cake_id: b.cake_id, cake_kg: Number(b.cake_kg) || 0.5, coupon_code: b.coupon_code, discount: b.discount, source: b.source, notes: b.notes,
    advance: 0, payment_method: 'upi', extra_hours: Number(b.extra_hours) || 0,
    addons: items.filter((i) => i.kind === 'addon' && i.addon_id).map((i) => ({ addon_id: i.addon_id!, qty: i.option ?? i.qty })),
    custom_items: items.filter((i) => i.kind === 'custom').map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
  };
}

export async function addPayment(bookingId: number, amount: number, method: string, note: string, by: string) {
  if (!Number.isFinite(amount) || amount <= 0) throw new BookingError('Enter a valid amount');
  await tx(async (c) => {
    await q('INSERT INTO payments (booking_id, amount, method, note, recorded_by) VALUES ($1,$2,$3,$4,$5)', [bookingId, Math.round(amount), method, note, by], c);
    await q('UPDATE bookings SET amount_paid = amount_paid + $2, updated_at=now() WHERE id=$1', [bookingId, Math.round(amount)], c);
  });
  await recordEvent(bookingId, by, 'payment_added', { amount, method, note });
}

export async function setStatus(bookingId: number, status: string, by: string, extra: Record<string, unknown> = {}) {
  const params: unknown[] = [bookingId, status];
  const sets = ['status=$2', 'updated_at=now()', 'hold_expires_at=NULL'];
  if (status === 'completed') { params.push(by); sets.push('closed_at=now()', `closed_by=$${params.length}`); }
  if (status === 'cancelled') { params.push(String(extra.reason || '')); sets.push(`cancel_reason=$${params.length}`); }
  await q(`UPDATE bookings SET ${sets.join(', ')} WHERE id=$1`, params);
  await recordEvent(bookingId, by, `status_${status}`, extra);
}
