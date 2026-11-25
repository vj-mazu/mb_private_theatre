// Shared (client + server) booking rules: time formatting, slot expiry and price calculation.

export const IST = 'Asia/Kolkata';

export function todayIST(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** "18:30" -> "6:30 PM" */
export function to12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const hour = h % 24;
  return `${hour % 12 || 12}:${String(m).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}

export function slotLabel(start: string, end: string, extraHours = 0): string {
  if (!extraHours) return `${to12h(start)} – ${to12h(end)}`;
  const [h, m] = end.split(':').map(Number);
  const mins = (h * 60 + m + extraHours * 60) % 1440;
  const newEnd = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  return `${to12h(start)} – ${to12h(newEnd)} (+${extraHours} hr${extraHours > 1 ? 's' : ''})`;
}

/** A guest can extend a slot by up to this many hours (if the following time is free). */
export const MAX_EXTRA_HOURS = 2;

/**
 * Short slot lengths (minutes), longest first. When an earlier booking's extra hours push a slot so it no longer fits,
 * the free time left (15 min gap on both sides) is offered as the longest of these that fits.
 */
export const SHORT_SLOT_MINUTES = [90, 60];

/** Any slot of 1½ hours or less (a fixed one in the timetable, or one squeezed by extra hours) is a short slot. */
export const isShortLength = (minutes: number) => minutes <= SHORT_SLOT_MINUTES[0];

/** Package price in a short slot: the theatre's short-slot discount less. The room-only (Custom) price never changes. */
export const shortPackagePrice = (price: number, short: boolean, discount: number) =>
  short ? Math.max(0, price - Math.max(0, discount || 0)) : price;

/** "1 hour", "1½ hours", "2 hours" for a slot's start/end. */
export function durationLabel(start: string, end: string): string {
  const [a, b] = [start, end].map((t) => t.split(':').map(Number)).map(([h, m]) => h * 60 + m);
  const mins = ((b - a) % 1440 + 1440) % 1440;
  const h = Math.floor(mins / 60);
  const half = mins % 60 === 30 ? '½' : mins % 60 ? ` h ${mins % 60} min` : '';
  return h === 1 && !half ? '1 hour' : `${h}${half} hours`;
}

/**
 * The business day runs past midnight: a slot that starts before this time (e.g. 12:00 AM – 1:00 AM)
 * belongs to the night of the booking date, after the evening slots.
 */
export const DAY_ROLLOVER_MIN = 5 * 60;

/** "HH:MM" -> minutes from midnight of the booking date (after-midnight starts count past 1440). */
export function dayMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  const min = h * 60 + m;
  return min < DAY_ROLLOVER_MIN ? min + 1440 : min;
}

export interface Span { start: number; end: number }
/** Minutes from midnight of the booking date; slots past midnight continue beyond 1440. */
export function slotSpan(start: string, end: string, extraHours = 0): Span {
  const s = dayMinutes(start);
  let e = dayMinutes(end);
  while (e <= s) e += 1440;
  return { start: s, end: e + Math.max(0, extraHours) * 60 };
}

/** Epoch ms for a slot start on a given IST date (an after-midnight slot starts on the next calendar day). */
export function slotStartMs(date: string, start: string): number {
  const [h = '0', m = '0'] = start.split(':');
  const hhmm = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  const extraDay = dayMinutes(start) >= 1440 ? 86_400_000 : 0;
  return Date.parse(`${date}T${hhmm}:00+05:30`) + extraDay;
}

/** A slot stops being bookable `cutoffMinutes` after it starts. */
export function isSlotExpired(date: string, start: string, cutoffMinutes: number, now: number = Date.now()): boolean {
  return now > slotStartMs(date, start) + cutoffMinutes * 60_000;
}

export function formatDate(date: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }): string {
  return new Date(`${date}T12:00:00+05:30`).toLocaleDateString('en-IN', { timeZone: IST, ...opts });
}

/**
 * Indian mobile numbers: digits only, at most 10. A pasted "+91 98765 43210" or "098765 43210"
 * loses its country/trunk prefix; anything else longer than 10 digits is cut, never silently re-read.
 */
export function phoneDigits(v: string): string {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d.slice(0, 10);
}
export const isValidPhone = (v: string) => /^[6-9]\d{9}$/.test(v);

export const inr = (n: number) => `₹${Math.round(n || 0).toLocaleString('en-IN')}`;

/**
 * `included` = how many of this add-on the package already covers (not charged).
 * `option` = the chosen price option of an add-on sold in fixed packs (e.g. 2 for "Fog entry · 2 pots");
 * such a line is stored as qty 1 at the pack price.
 */
export type BookingItem = { kind: 'addon' | 'custom'; addon_id?: number | null; name: string; price: number; qty: number; included?: number; option?: number };

export const chargedQty = (it: BookingItem) => Math.max(0, Math.round(it.qty) - Math.max(0, it.included || 0));

/** A fixed pack price for an add-on, e.g. { qty: 2, price: 699, label: '2 pots' }. */
export interface PriceTier { qty: number; price: number; label: string }
export interface AddonLike { id: number; name: string; price: number; price_tiers?: unknown }

/** Valid pack prices of an add-on, smallest pack first. Empty = sold per piece at `price`. */
export function priceTiers(a: { price_tiers?: unknown } | null | undefined): PriceTier[] {
  const raw = Array.isArray(a?.price_tiers) ? (a!.price_tiers as any[]) : [];
  const seen = new Set<number>();
  return raw
    .map((t) => ({ qty: Math.round(Number(t?.qty)), price: Math.round(Number(t?.price)), label: String(t?.label ?? '').trim() }))
    .filter((t) => t.qty > 0 && t.price >= 0 && Number.isFinite(t.price) && !seen.has(t.qty) && seen.add(t.qty))
    .map((t) => ({ ...t, label: t.label || `${t.qty}` }))
    .sort((x, y) => x.qty - y.qty);
}

/**
 * The bill line for `qty` of an add-on. For a pack-priced add-on `qty` must be one of its packs
 * (2 pots = ₹699, not 2 × the 1-pot price); returns null when it is not.
 */
export function addonItem(a: AddonLike, qty: number): BookingItem | null {
  const tiers = priceTiers(a);
  if (!tiers.length) return { kind: 'addon', addon_id: a.id, name: a.name, price: a.price, qty };
  const tier = tiers.find((t) => t.qty === qty);
  if (!tier) return null;
  return { kind: 'addon', addon_id: a.id, name: `${a.name} · ${tier.label}`, price: tier.price, qty: 1, option: tier.qty };
}

export interface QuoteInput {
  basePrice: number;          // package price for this theatre, or theatre custom price
  includesCake: boolean;      // cake is part of the package
  baseCapacity: number;
  extraPersonPrice: number;
  guests: number;
  cakePrice: number;          // price of chosen cake (0 if none chosen)
  items: BookingItem[];
  discount: number;
  extraHours?: number;
  extraHourPrice?: number;
}

export interface Quote {
  base: number;
  extraPersons: number;
  extraPersonAmount: number;
  extraHours: number;
  extraHourAmount: number;
  cakeAmount: number;
  itemsAmount: number;
  subtotal: number;
  discount: number;
  total: number;
}

export function computeQuote(i: QuoteInput): Quote {
  const extraPersons = Math.max(0, Math.floor(i.guests) - i.baseCapacity);
  const extraPersonAmount = extraPersons * i.extraPersonPrice;
  const cakeAmount = i.includesCake ? 0 : Math.max(0, i.cakePrice);
  const itemsAmount = i.items.reduce((s, it) => s + Math.max(0, Math.round(it.price)) * chargedQty(it), 0);
  const extraHours = Math.min(MAX_EXTRA_HOURS, Math.max(0, Math.round(i.extraHours || 0)));
  const extraHourAmount = extraHours * Math.max(0, i.extraHourPrice || 0);
  const subtotal = i.basePrice + extraPersonAmount + extraHourAmount + cakeAmount + itemsAmount;
  const discount = Math.min(subtotal, Math.max(0, Math.round(i.discount)));
  return { base: i.basePrice, extraPersons, extraPersonAmount, extraHours, extraHourAmount, cakeAmount, itemsAmount, subtotal, discount, total: subtotal - discount };
}

// Cakes are sold in 500 g units: 0.5 kg – 5 kg. Packages include one 500 g unit.
export const CAKE_MIN_KG = 0.5;
export const CAKE_MAX_KG = 5;
export const CAKE_STEP_KG = 0.5;

export function normalizeKg(kg: unknown): number {
  const n = Math.round(Number(kg) * 2) / 2;
  if (!Number.isFinite(n)) return CAKE_MIN_KG;
  return Math.min(CAKE_MAX_KG, Math.max(CAKE_MIN_KG, n));
}
export const kgLabel = (kg: number) => (kg < 1 ? `${kg * 1000} g` : `${kg} kg`);

/** What the guest pays for the cake: price is per 500 g; a package's 500 g is free. */
export function cakeCharge(cake: { price: number } | null | undefined, kg: number, includedInPackage: boolean): number {
  if (!cake) return 0;
  const units = Math.round(normalizeKg(kg) / CAKE_STEP_KG);
  return Math.max(0, units - (includedInPackage ? 1 : 0)) * cake.price;
}

export function couponDiscount(c: { discount_type: string; value: number }, subtotal: number): number {
  return c.discount_type === 'percent' ? Math.round((subtotal * c.value) / 100) : c.value;
}

export const STATUS_META: Record<string, { label: string; tone: 'amber' | 'sky' | 'green' | 'slate' | 'red' }> = {
  awaiting_payment: { label: 'Awaiting payment', tone: 'amber' },
  payment_review: { label: 'Verify payment', tone: 'sky' },
  confirmed: { label: 'Confirmed', tone: 'green' },
  completed: { label: 'Completed', tone: 'slate' },
  cancelled: { label: 'Cancelled', tone: 'red' },
};

export const SOURCES = [
  { value: 'walkin', label: 'Walk-in' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'phone', label: 'Phone call' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'website', label: 'Website' },
  { value: 'other', label: 'Other' },
];

export const PAYMENT_METHODS = [
  { value: 'upi', label: 'UPI' },
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'bank', label: 'Bank transfer' },
];
