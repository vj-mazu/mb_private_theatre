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

export interface Span { start: number; end: number }
/** Minutes from midnight of the booking date; slots past midnight continue beyond 1440. */
export function slotSpan(start: string, end: string, extraHours = 0): Span {
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const s = toMin(start);
  let e = toMin(end);
  if (e <= s) e += 1440;
  return { start: s, end: e + Math.max(0, extraHours) * 60 };
}

/** Epoch ms for a slot start on a given IST date. */
export function slotStartMs(date: string, start: string): number {
  return Date.parse(`${date}T${start}:00+05:30`);
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

/** `included` = how many of this add-on the package already covers (not charged). */
export type BookingItem = { kind: 'addon' | 'custom'; addon_id?: number | null; name: string; price: number; qty: number; included?: number };

export const chargedQty = (it: BookingItem) => Math.max(0, Math.round(it.qty) - Math.max(0, it.included || 0));

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
  completed: { label: 'Closed', tone: 'slate' },
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
