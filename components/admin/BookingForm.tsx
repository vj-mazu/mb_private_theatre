'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, Check } from 'lucide-react';
import { Button, Field, Input, Select, Textarea, api, cn, useToast } from '@/components/ui';
import { CakeWeight } from '@/components/booking/CakeWeight';
import {
  PAYMENT_METHODS, SOURCES, addonItem, priceTiers, phoneDigits, cakeCharge, chargedQty, kgLabel, computeQuote, formatDate, inr, isSlotExpired, slotLabel, todayIST, type BookingItem,
} from '@/lib/booking-rules';

type Catalog = any;
type Custom = { name: string; price: number | ''; qty: number };

export interface BookingFormValue {
  branch_id: number; theatre_id: number; slot_id: number; booking_date: string;
  customer_name: string; phone: string; whatsapp: string; email: string; special_person_name: string; occasion: string;
  package_id: number | null; guests: number; cake_id: number | null; cake_kg: number; extra_hours?: number; addons: { addon_id: number; qty: number }[];
  custom_items: { name: string; price: number; qty: number }[]; coupon_code: string; discount: number; source: string;
  advance: number; payment_method: string; notes: string;
}

export function BookingForm({ initial, bookingId, amountPaid = 0 }: { initial?: BookingFormValue; bookingId?: number; amountPaid?: number }) {
  const router = useRouter();
  const toast = useToast();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 30_000); return () => clearInterval(t); }, []);
  const [cat, setCat] = useState<Catalog | null>(null);
  const [booked, setBooked] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [extraMax, setExtraMax] = useState<Record<string, number>>({});
  const [times, setTimes] = useState<Record<string, { start: string; end: string; shifted: boolean }>>({});
  const at = (tid: number, s: any) => times[`${tid}:${s.id}`] || { start: s.start_time as string, end: s.end_time as string, shifted: false };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const [v, setV] = useState<BookingFormValue>(initial || {
    branch_id: 0, theatre_id: 0, slot_id: 0, booking_date: todayIST(),
    customer_name: '', phone: '', whatsapp: '', email: '', special_person_name: '', occasion: '',
    package_id: null, guests: 0, cake_id: null, cake_kg: 0.5, extra_hours: 0, addons: [], custom_items: [], coupon_code: '', discount: 0,
    source: 'walkin', advance: 0, payment_method: 'upi', notes: '',
  });
  const [customs, setCustoms] = useState<Custom[]>(initial?.custom_items?.length ? initial.custom_items : []);
  const set = <K extends keyof BookingFormValue>(k: K, val: BookingFormValue[K]) => setV((s) => ({ ...s, [k]: val }));
  // "Other" occasion: staff type the occasion themselves (also used when an existing booking has a custom one).
  const [otherOccasion, setOtherOccasion] = useState(false);
  useEffect(() => {
    if (cat && v.occasion && !cat.occasions.some((o: any) => o.name === v.occasion)) setOtherOccasion(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat]);

  useEffect(() => {
    api('/api/catalog').then((c) => {
      setCat(c);
      setV((s) => {
        if (s.branch_id) return s;
        const branch = c.branches[0];
        const theatre = c.theatres.find((t: any) => t.branch_id === branch?.id);
        return { ...s, branch_id: branch?.id || 0, theatre_id: theatre?.id || 0, guests: theatre?.base_capacity || 2, package_id: c.packages[0]?.id ?? null };
      });
    }).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!v.branch_id || !v.booking_date) return;
    api(`/api/availability?branch=${v.branch_id}&date=${v.booking_date}${bookingId ? `&exclude=${bookingId}` : ''}`)
      .then((d) => { setBooked(d.booked); setBlocked(d.blocked || []); setExtraMax(d.extraMax || {}); setTimes(d.times || {}); }).catch(() => setBooked([]));
  }, [v.branch_id, v.booking_date, bookingId]);

  const theatres = useMemo(() => cat?.theatres.filter((t: any) => t.branch_id === v.branch_id) || [], [cat, v.branch_id]);
  const theatre = theatres.find((t: any) => t.id === v.theatre_id);
  const pkg = cat?.packages.find((p: any) => p.id === v.package_id);
  const pkgPrice = pkg && theatre ? theatre.prices[pkg.id]?.price : undefined;
  const cake = cat?.cakes.find((c: any) => c.id === v.cake_id);
  const extraPersons = theatre ? Math.max(0, v.guests - theatre.base_capacity) : 0;

  const items: BookingItem[] = [
    ...v.addons.flatMap((a) => {
      const ad = cat?.addons.find((x: any) => x.id === a.addon_id);
      const line = ad ? addonItem(ad, a.qty) : null;
      return line ? [line] : [];
    }),
    ...customs.filter((c) => c.name && c.price !== '').map((c) => ({ kind: 'custom' as const, name: c.name, price: Number(c.price), qty: c.qty })),
  ];
  const quote = theatre ? computeQuote({
    basePrice: pkg ? pkgPrice ?? 0 : theatre.base_price, includesCake: false, baseCapacity: theatre.base_capacity,
    extraPersonPrice: theatre.extra_person_price, guests: v.guests, cakePrice: cakeCharge(cake, v.cake_kg || 0.5, !!pkg?.includes_cake), items, discount: v.discount,
    extraHours: v.extra_hours || 0, extraHourPrice: theatre.extra_hour_price,
  }) : null;
  const paid = bookingId ? amountPaid : v.advance;

  function pickBranch(id: number) {
    const t = cat.theatres.find((x: any) => x.branch_id === id);
    setV((s) => ({ ...s, branch_id: id, theatre_id: t?.id || 0, slot_id: 0, guests: t?.base_capacity || 2 }));
  }
  function pickTheatre(id: number) {
    const t = cat.theatres.find((x: any) => x.id === id);
    setV((s) => ({ ...s, theatre_id: id, slot_id: 0, guests: Math.min(Math.max(s.guests, t.base_capacity), t.max_capacity) }));
  }
  function addonQty(id: number, delta: number) {
    setV((s) => {
      const cur = s.addons.find((a) => a.addon_id === id);
      const qty = (cur?.qty || 0) + delta;
      const rest = s.addons.filter((a) => a.addon_id !== id);
      return { ...s, addons: qty > 0 ? [...rest, { addon_id: id, qty }] : rest };
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!v.slot_id) return setError('Choose a time slot');
    if (otherOccasion && v.occasion.trim().length < 2) return setError('Type the occasion');
    if (pkg && pkgPrice === undefined) return setError(`${pkg.name} has no price for ${theatre?.name}. Choose Custom or set a price in Packages.`);
    const payload = {
      ...v,
      customer_name: v.customer_name.trim() || v.special_person_name.trim(),
      phone: v.phone.trim() || v.whatsapp.trim(),
      custom_items: customs.filter((c) => c.name.trim() && c.price !== '').map((c) => ({ ...c, price: Number(c.price) })),
    };
    setBusy(true);
    try {
      if (bookingId) {
        await api(`/api/admin/bookings/${bookingId}`, { method: 'PUT', json: payload });
        toast('Booking updated');
        router.push(`/admin/bookings/${bookingId}`);
      } else {
        const r = await api<{ id: number; ref: string }>('/api/admin/bookings', { method: 'POST', json: payload });
        toast(`Booking ${r.ref} created`);
        router.push(`/admin/bookings/${r.id}`);
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  if (!cat) return <div className="grid gap-4 lg:grid-cols-3"><div className="skeleton h-96 lg:col-span-2" /><div className="skeleton h-64" /></div>;

  return (
    <form onSubmit={submit} className="grid items-start gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <Section n={1} title="Guest">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Special person's name" required><Input value={v.special_person_name} onChange={(e) => set('special_person_name', e.target.value)} required /></Field>
            <Field label="WhatsApp number" required><Input type="tel" inputMode="numeric" value={v.whatsapp} onChange={(e) => set('whatsapp', phoneDigits(e.target.value))} placeholder="10-digit mobile" required /></Field>
            <Field label="Occasion">
              <Select value={otherOccasion ? 'Other' : v.occasion} onChange={(e) => {
                const other = e.target.value === 'Other';
                setOtherOccasion(other);
                set('occasion', other ? '' : e.target.value);
              }}>
                <option value="">Select occasion</option>
                {cat.occasions.map((o: any) => <option key={o.id}>{o.name}</option>)}
                <option>Other</option>
              </Select>
            </Field>
            {otherOccasion && (
              <Field label="Occasion (type it)" required>
                <Input autoFocus maxLength={60} value={v.occasion} onChange={(e) => set('occasion', e.target.value)} placeholder="e.g. Retirement party" />
              </Field>
            )}
            <Field label="Booked by (if different)" hint="Leave empty to use special person's name">
              <Input value={v.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
            </Field>
          </div>
        </Section>

        <Section n={2} title="Branch, theatre & timing">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Branch">
              <Select value={v.branch_id} onChange={(e) => pickBranch(Number(e.target.value))}>
                {cat.branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Private theatre">
              <Select value={v.theatre_id} onChange={(e) => pickTheatre(Number(e.target.value))}>
                {theatres.map((t: any) => <option key={t.id} value={t.id}>{t.name} ({t.base_capacity}–{t.max_capacity} guests)</option>)}
              </Select>
            </Field>
            <Field label="Date"><Input type="date" value={v.booking_date} onChange={(e) => setV((x) => ({ ...x, booking_date: e.target.value, slot_id: 0, extra_hours: 0 }))} /></Field>
          </div>
          <p className="mb-2 mt-4 text-xs font-semibold text-navy-soft">Timings</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {theatre?.slots.map((s: any) => {
              const isBlocked = blocked.includes(`${theatre.id}:${s.id}`);
              const taken = booked.includes(`${theatre.id}:${s.id}`) || isBlocked;
              const started = isSlotExpired(v.booking_date, at(theatre.id, s).start, 0, now);
              const active = v.slot_id === s.id;
              return (
                <button type="button" key={s.id} disabled={taken} onClick={() => setV((x) => ({ ...x, slot_id: s.id, extra_hours: 0 }))}
                  className={cn('rounded-xl border px-3 py-2.5 text-left text-sm transition-all duration-200',
                    active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-line bg-white hover:border-brand-300',
                    taken && 'cursor-not-allowed bg-cream-deep text-navy-faint line-through hover:border-line')}>
                  <span className="font-semibold">{slotLabel(at(theatre.id, s).start, at(theatre.id, s).end)}</span>
                  <span className="block text-xs text-navy-soft">{isBlocked ? 'Unavailable' : taken ? 'Booked' : started ? 'Expired' : 'Available'}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section n={3} title="Package or custom">
          <div className="grid gap-2 sm:grid-cols-3">
            {[...cat.packages, null].map((p: any) => {
              const price = p ? theatre?.prices[p.id]?.price : theatre?.base_price;
              const active = (p?.id ?? null) === v.package_id;
              return (
                <button type="button" key={p?.id ?? 'custom'} onClick={() => set('package_id', p?.id ?? null)} disabled={p && price === undefined}
                  className={cn('rounded-xl border p-3 text-left transition-all duration-200 disabled:opacity-40',
                    active ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-line bg-white hover:border-brand-300')}>
                  <span className="flex items-center justify-between text-sm font-semibold">{p ? p.name : 'Custom'}{active && <Check className="h-4 w-4 text-brand-600" />}</span>
                  <span className="block text-xs text-navy-soft">{p ? (p.includes_cake ? 'Cake included' : p.tagline) : 'Room only'}</span>
                  <span className="mt-1 block font-bold tabular-nums">{price !== undefined ? inr(price) : 'No price'}</span>
                </button>
              );
            })}
          </div>
          {theatre && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Extra persons</p>
                <p className="text-xs text-navy-soft">{theatre.base_capacity} included · {inr(theatre.extra_person_price)} per extra · max {theatre.max_capacity}</p>
              </div>
              <Stepper value={extraPersons} onChange={(n) => set('guests', theatre.base_capacity + n)} max={theatre.max_capacity - theatre.base_capacity} />
            </div>
          )}
          {theatre && v.slot_id > 0 && (() => {
            const max = extraMax[`${theatre.id}:${v.slot_id}`] ?? 0;
            const slot = theatre.slots.find((x: any) => x.id === v.slot_id);
            return (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-cream px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">Extra hours</p>
                  <p className="text-xs text-navy-soft">
                    {max > 0 ? `${inr(theatre.extra_hour_price)} per hour · up to ${max} available` : 'Next slot is booked — no extra time possible'}
                    {(v.extra_hours || 0) > 0 && slot && ` · ends ${slotLabel(at(theatre.id, slot).start, at(theatre.id, slot).end, v.extra_hours).split('– ')[1]}`}
                  </p>
                </div>
                <Stepper value={Math.min(v.extra_hours || 0, max)} onChange={(n) => set('extra_hours', n)} max={max} />
              </div>
            );
          })()}
        </Section>

        <Section n={4} title="Cake flavour" note={pkg?.includes_cake ? '500 g included in package' : 'Charged extra with Custom'}>
          {cake && <div className="mb-3"><CakeWeight compact kg={v.cake_kg || 0.5} onChange={(kg) => set('cake_kg', kg)} pricePer500={cake.price} includedInPackage={!!pkg?.includes_cake} /></div>}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            <button type="button" onClick={() => set('cake_id', null)}
              className={cn('flex aspect-square items-center justify-center rounded-xl border text-xs font-medium transition', v.cake_id === null ? 'border-brand-500 bg-brand-50' : 'border-line bg-white')}>
              No cake
            </button>
            {cat.cakes.map((c: any) => (
              <button type="button" key={c.id} onClick={() => set('cake_id', c.id)} title={c.name}
                className={cn('overflow-hidden rounded-xl border bg-white text-left transition-all duration-200', v.cake_id === c.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-line hover:border-brand-300')}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image_url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                <span className="block truncate px-1.5 py-1 text-[11px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </Section>

        <Section n={5} title="Extra add-ons" note="Charged on top of the package">
          {pkg && (
            <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-semibold text-emerald-800">Included in {pkg.name} (no charge)</p>
              <p className="mt-1 text-xs leading-relaxed text-emerald-900">{(pkg.includes as string[]).join(' · ')}</p>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {cat.addons.map((a: any) => {
              const qty = v.addons.find((x) => x.addon_id === a.id)?.qty || 0;
              const tiers = priceTiers(a);
              return (
                <div key={a.id} className={cn('flex items-center justify-between gap-2 rounded-xl border px-3 py-2 transition', qty ? 'border-brand-400 bg-brand-50' : 'border-line bg-white')}>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{a.name}</p><p className="text-xs text-navy-soft">{tiers.length ? `from ${inr(tiers[0].price)}` : inr(a.price)}</p></div>
                  {tiers.length
                    ? <TierSelect tiers={tiers} value={qty} onChange={(n) => addonQty(a.id, n - qty)} />
                    : <Stepper value={qty} onChange={(n) => addonQty(a.id, n - qty)} max={20} />}
                </div>
              );
            })}
          </div>
        </Section>

        <Section n={6} title="Custom extras" note="Any item with your own name and amount">
          <div className="space-y-2">
            {customs.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_110px_70px_36px] gap-2">
                <Input placeholder="Item name" value={c.name} onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                <Input placeholder="Amount" inputMode="numeric" value={c.price} onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, price: e.target.value === '' ? '' : Number(e.target.value.replace(/\D/g, '')) } : x)))} />
                <Input aria-label="Quantity" inputMode="numeric" value={c.qty} onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) } : x)))} />
                <button type="button" onClick={() => setCustoms((s) => s.filter((_, j) => j !== i))} className="rounded-lg text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="mx-auto h-4 w-4" /></button>
              </div>
            ))}
            <Button type="button" variant="secondary" size="sm" onClick={() => setCustoms((s) => [...s, { name: '', price: '', qty: 1 }])}><Plus className="h-4 w-4" />Add item</Button>
          </div>
        </Section>

        <Section n={7} title="Payment & source">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Discount (₹)"><Input inputMode="numeric" value={v.discount || ''} onChange={(e) => set('discount', Number(e.target.value.replace(/\D/g, '')) || 0)} /></Field>
            {!bookingId && (
              <Field label="Advance received (₹)"><Input inputMode="numeric" value={v.advance || ''} onChange={(e) => set('advance', Number(e.target.value.replace(/\D/g, '')) || 0)} /></Field>
            )}
            {!bookingId && (
              <Field label="Payment type">
                <Select value={v.payment_method} onChange={(e) => set('payment_method', e.target.value)}>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Booking via">
              <Select value={v.source} onChange={(e) => set('source', e.target.value)}>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <Field label="Notes" className="sm:col-span-2"><Textarea value={v.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Decoration theme, name on cake, special requests…" /></Field>
          </div>
        </Section>
      </div>

      <aside className="card sticky top-20 p-5 lg:top-6">
        <h2 className="font-sans text-sm font-bold">Summary</h2>
        {theatre && (
          <p className="mt-1 text-xs text-navy-soft">
            {formatDate(v.booking_date)} · {theatre.slots.find((s: any) => s.id === v.slot_id) ? slotLabel(at(theatre.id, theatre.slots.find((s: any) => s.id === v.slot_id)).start, at(theatre.id, theatre.slots.find((s: any) => s.id === v.slot_id)).end, v.extra_hours || 0) : 'No slot yet'}
            <br />{theatre.name}
          </p>
        )}
        {quote && (
          <dl className="mt-4 space-y-2 text-sm">
            <Row label={pkg ? `${pkg.name} package` : 'Custom (room)'} value={inr(quote.base)} />
            {quote.extraPersons > 0 && <Row label={`Extra persons × ${quote.extraPersons}`} value={inr(quote.extraPersonAmount)} />}
            {quote.extraHours > 0 && <Row label={`Extra hours × ${quote.extraHours}`} value={inr(quote.extraHourAmount)} />}
            {cake && <Row label={`Cake · ${cake.name} (${kgLabel(v.cake_kg || 0.5)})`} value={quote.cakeAmount ? inr(quote.cakeAmount) : 'Included'} />}
            {items.map((it, i) => <Row key={i} label={`${it.name}${it.qty > 1 ? ` × ${it.qty}` : ''}`} value={chargedQty(it) ? inr(it.price * chargedQty(it)) : 'Included'} />)}
            {quote.discount > 0 && <Row label="Discount" value={`− ${inr(quote.discount)}`} />}
            <div className="my-3 border-t border-dashed border-line" />
            <Row label="Total amount" value={inr(quote.total)} strong />
            <Row label={bookingId ? 'Paid so far' : 'Advance'} value={inr(paid)} />
            <Row label="Balance" value={inr(Math.max(0, quote.total - paid))} strong />
          </dl>
        )}
        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <Button type="submit" size="lg" className="mt-5 w-full" loading={busy}>{bookingId ? 'Save changes' : 'Confirm booking'}</Button>
        {!bookingId && <p className="mt-2 text-center text-xs text-navy-faint">Confirmation is sent on WhatsApp automatically</p>}
      </aside>
    </form>
  );
}

function Section({ n, title, note, children }: { n: number; title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2.5 font-sans text-sm font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy text-[11px] text-cream">{n}</span>{title}
        </h2>
        {note && <span className="text-xs text-navy-soft">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('flex justify-between gap-3', strong && 'text-base font-bold')}>
      <dt className={cn('min-w-0 truncate', !strong && 'text-navy-soft')}>{label}</dt>
      <dd className="shrink-0 tabular-nums">{value}</dd>
    </div>
  );
}

/** Pick one pack of a pack-priced add-on (e.g. fog: 1 pot ₹399 … 5 pots ₹1,500), or none. */
export function TierSelect({ tiers, value, onChange }: { tiers: { qty: number; price: number; label: string }[]; value: number; onChange: (qty: number) => void }) {
  return (
    <Select aria-label="Option" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-40 shrink-0">
      <option value={0}>None</option>
      {tiers.map((t) => <option key={t.qty} value={t.qty}>{t.label} · {inr(t.price)}</option>)}
    </Select>
  );
}

export function Stepper({ value, onChange, max }: { value: number; onChange: (n: number) => void; max: number }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0} aria-label="Decrease"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:border-brand-400 disabled:opacity-40"><Minus className="h-3.5 w-3.5" /></button>
      <span className="w-7 text-center text-sm font-semibold tabular-nums">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="Increase"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-white transition hover:border-brand-400 disabled:opacity-40"><Plus className="h-3.5 w-3.5" /></button>
    </div>
  );
}
