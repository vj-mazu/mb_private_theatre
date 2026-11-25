'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Button, Field, Input, Modal, Select, Textarea, api, cn, useToast } from '@/components/ui';
import { Stepper, TierSelect } from './BookingForm';
import { PAYMENT_METHODS, addonItem, cakeCharge, computeQuote, inr, kgLabel, priceTiers, shortPackagePrice } from '@/lib/booking-rules';

type Custom = { name: string; price: number | ''; qty: number };

/**
 * Final settlement on the day: change the package if needed, add/remove extras and custom items,
 * set a discount, record the final payment and close the booking. Totals use the same rules as the server.
 */
export function CloseBookingModal({ open, onClose, booking, input, onDone }: {
  open: boolean; onClose: () => void; booking: any; input: any; onDone: () => void;
}) {
  const toast = useToast();
  const [cat, setCat] = useState<any>(null);
  const [packageId, setPackageId] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);
  const [extraHours, setExtraHours] = useState(0);
  const [maxExtra, setMaxExtra] = useState(0);
  const [selected, setSelected] = useState<{ addon_id: number; qty: number }[]>([]);
  const [customs, setCustoms] = useState<Custom[]>([]);
  const [discount, setDiscount] = useState(0);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    api('/api/catalog?all=1').then(setCat).catch(() => {});
    setPackageId(input.package_id ?? null);
    setGuests(input.guests);
    setExtraHours(input.extra_hours || 0);
    api(`/api/availability?branch=${booking.branch_id}&date=${booking.booking_date}&exclude=${booking.id}`)
      .then((d) => setMaxExtra(d.extraMax?.[`${booking.theatre_id}:${booking.slot_id}`] ?? 0)).catch(() => setMaxExtra(input.extra_hours || 0));
    setSelected(input.addons);
    setCustoms(input.custom_items);
    setDiscount(booking.discount);
    setNotes(booking.notes || '');
  }, [open, input, booking]);

  const theatre = cat?.theatres.find((t: any) => t.id === booking.theatre_id);
  // A short-slot booking keeps its lower package prices at closing (unless the extra hours change, which re-checks the slot).
  const short = !!booking.short_slot && extraHours === (input.extra_hours || 0);
  const pkgPrice = (id: number) => (theatre?.prices[id] ? shortPackagePrice(theatre.prices[id].price, short, theatre.short_slot_discount) : undefined);
  const pkg = cat?.packages.find((p: any) => p.id === packageId);
  const cake = cat?.cakes.find((c: any) => c.id === input.cake_id);
  const options = useMemo(() => theatre
    ? [...(cat?.packages || []).filter((p: any) => theatre.prices[p.id]).map((p: any) => ({ id: p.id, name: p.name, price: pkgPrice(p.id)! })),
      { id: null, name: 'Custom', price: theatre.base_price }]
    : [], [cat, theatre, short]); // eslint-disable-line react-hooks/exhaustive-deps

  const items = selected.flatMap((a) => {
    const ad = cat?.addons.find((x: any) => x.id === a.addon_id);
    const line = ad ? addonItem(ad, a.qty) : null;
    return line ? [line] : [];
  });
  const customItems = customs.filter((c) => c.name.trim() && c.price !== '').map((c) => ({ kind: 'custom' as const, name: c.name, price: Number(c.price), qty: c.qty }));
  const quote = theatre ? computeQuote({
    basePrice: pkg ? pkgPrice(pkg.id) ?? 0 : theatre.base_price, includesCake: false,
    baseCapacity: theatre.base_capacity, extraPersonPrice: theatre.extra_person_price, guests,
    cakePrice: cakeCharge(cake, input.cake_kg || 0.5, !!pkg?.includes_cake), items: [...items, ...customItems], discount,
    extraHours, extraHourPrice: theatre.extra_hour_price,
  }) : null;
  const total = quote?.total ?? booking.total;
  const balance = total - booking.amount_paid; // what the customer still owes on the new total
  const collecting = Math.max(0, Number(amount) || 0);
  const leftAfter = balance - collecting;

  useEffect(() => { if (open) setAmount(String(Math.max(0, balance))); }, [open, balance]);

  function qty(id: number, n: number) {
    setSelected((s) => (n > 0 ? [...s.filter((a) => a.addon_id !== id), { addon_id: id, qty: n }] : s.filter((a) => a.addon_id !== id)));
  }

  async function submit() {
    setBusy(true);
    try {
      await api(`/api/admin/bookings/${booking.id}`, {
        method: 'POST',
        json: {
          action: 'close', package_id: packageId, guests, extra_hours: extraHours, addons: selected, discount, final_amount: Number(amount) || 0, method, notes,
          custom_items: customItems.map(({ name, price, qty: q }) => ({ name, price, qty: q })),
        },
      });
      onDone();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Complete ${booking.ref}`} size="lg"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant="dark" loading={busy} onClick={submit}>Collect & complete booking</Button></>}>
      <p className="mb-4 text-sm text-navy-soft">Update anything that changed during the celebration, then record the final payment.</p>

      <h3 className="mb-2 text-xs font-semibold text-navy-soft">Package</h3>
      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((o: any) => (
          <button key={o.id ?? 'custom'} type="button" onClick={() => setPackageId(o.id)}
            className={cn('rounded-xl border px-3 py-2.5 text-left text-sm transition', o.id === packageId ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-200' : 'border-line bg-white hover:border-brand-300')}>
            <span className="flex items-center justify-between font-semibold">{o.name}{o.id === packageId && <Check className="h-4 w-4 text-brand-600" />}</span>
            <span className="text-xs text-navy-soft">{inr(o.price)}</span>
          </button>
        ))}
      </div>
      {pkg && (
        <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900">
          <strong>Included in {pkg.name}:</strong> {(pkg.includes as string[]).join(' · ')}
        </p>
      )}
      {theatre && (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-cream px-3 py-2">
          <span className="text-sm">Guests <span className="text-xs text-navy-soft">({theatre.base_capacity} included · {inr(theatre.extra_person_price)} per extra)</span></span>
          <Stepper value={guests} onChange={(v) => setGuests(Math.max(1, v))} max={theatre.max_capacity} />
        </div>
      )}
      {theatre && (
        <div className="mt-2 flex items-center justify-between rounded-xl bg-cream px-3 py-2">
          <span className="text-sm">Extra hours <span className="text-xs text-navy-soft">({inr(theatre.extra_hour_price)}/hr · {maxExtra > 0 ? `up to ${maxExtra} free after this slot` : 'next slot is booked'})</span></span>
          <Stepper value={extraHours} onChange={setExtraHours} max={Math.max(maxExtra, input.extra_hours || 0)} />
        </div>
      )}

      <h3 className="mb-2 mt-5 text-xs font-semibold text-navy-soft">Extra add-ons (charged)</h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {(cat?.addons || []).map((a: any) => {
          const n = selected.find((s) => s.addon_id === a.id)?.qty || 0;
          const tiers = priceTiers(a);
          return (
            <div key={a.id} className={cn('flex items-center justify-between gap-2 rounded-xl border px-3 py-2', tiers.length > 0 && 'sm:col-span-2', n ? 'border-brand-300 bg-brand-50/50' : 'border-line bg-white')}>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{a.name}</p><p className="text-xs text-navy-soft">{tiers.length ? `from ${inr(tiers[0].price)}` : `${inr(a.price)} each`}</p></div>
              {tiers.length
                ? <TierSelect tiers={tiers} value={n} onChange={(v) => qty(a.id, v)} />
                : <Stepper value={n} onChange={(v) => qty(a.id, v)} max={20} />}
            </div>
          );
        })}
      </div>

      <h3 className="mb-2 mt-5 text-xs font-semibold text-navy-soft">Custom items</h3>
      <div className="space-y-2">
        {customs.map((c, i) => (
          <div key={i} className="grid grid-cols-[1fr_110px_70px_36px] gap-2">
            <Input value={c.name} placeholder="Item" onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            <Input value={c.price} placeholder="Amount" inputMode="numeric" onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, price: e.target.value === '' ? '' : Number(e.target.value.replace(/\D/g, '')) } : x)))} />
            <Input value={c.qty} aria-label="Quantity" inputMode="numeric" onChange={(e) => setCustoms((s) => s.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Number(e.target.value.replace(/\D/g, '')) || 1) } : x)))} />
            <button type="button" onClick={() => setCustoms((s) => s.filter((_, j) => j !== i))} className="rounded-lg text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="mx-auto h-4 w-4" /></button>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={() => setCustoms((s) => [...s, { name: '', price: '', qty: 1 }])}><Plus className="h-4 w-4" />Add item</Button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="Discount (₹)" hint="Final discount on the whole bill">
          <Input inputMode="numeric" value={discount || ''} onChange={(e) => setDiscount(Number(e.target.value.replace(/\D/g, '')) || 0)} />
          <span className="mt-2 flex flex-wrap gap-1.5">
            {[5, 10, 15, 20].map((pct) => (
              <button key={pct} type="button" onClick={() => quote && setDiscount(Math.round((quote.subtotal * pct) / 100))}
                className="rounded-lg border border-line bg-white px-2.5 py-1 text-xs font-semibold text-navy-soft transition hover:border-brand-400 hover:text-brand-700">{pct}%</button>
            ))}
            {discount > 0 && <button type="button" onClick={() => setDiscount(0)} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50">Clear</button>}
          </span>
        </Field>
        <Field label="Amount collected now (₹)" hint={`Balance to collect: ${inr(Math.max(0, balance))}`}><Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="Payment type"><Select value={method} onChange={(e) => setMethod(e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</Select></Field>
        <Field label="Completion notes" className="sm:col-span-3"><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>

      {quote && (
        <dl className="mt-5 space-y-1.5 rounded-xl bg-cream p-4 text-sm">
          <Line label={pkg ? `${pkg.name} package` : 'Custom (room)'} value={inr(quote.base)} />
          {quote.extraPersons > 0 && <Line label={`Extra persons × ${quote.extraPersons}`} value={inr(quote.extraPersonAmount)} />}
          {quote.extraHours > 0 && <Line label={`Extra hours × ${quote.extraHours}`} value={inr(quote.extraHourAmount)} />}
          {cake && <Line label={`Cake · ${cake.name} · ${kgLabel(input.cake_kg || 0.5)}`} value={quote.cakeAmount ? inr(quote.cakeAmount) : 'Included'} />}
          {[...items, ...customItems].map((it, i) => <Line key={i} label={`${it.name}${it.qty > 1 ? ` × ${it.qty}` : ''}`} value={inr(it.price * it.qty)} />)}
          {quote.discount > 0 && <Line label="Discount" value={`− ${inr(quote.discount)}`} />}
          {/* The bill reads top to bottom: total (after any discount) − advance already paid = what to collect now. */}
          <div className="space-y-1.5 border-t border-line pt-3">
            <div className="flex justify-between gap-3 font-semibold"><dt>{quote.discount > 0 ? 'Total (after discount)' : 'Total'}</dt><dd className="tabular-nums">{inr(total)}</dd></div>
            <Line label="Advance already paid" value={`− ${inr(booking.amount_paid)}`} />
            <div className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200">
              <dt className="font-semibold text-amber-800">{balance < 0 ? 'Paid extra (to return)' : 'Balance to collect'}</dt>
              <dd className="text-xl font-bold tabular-nums text-amber-800">{inr(Math.abs(balance))}</dd>
            </div>
          </div>
          <p className="text-center text-xs text-navy-soft">
            Collecting now {inr(collecting)} · {leftAfter > 0 ? `${inr(leftAfter)} will still be due` : leftAfter < 0 ? `${inr(-leftAfter)} more than the balance` : 'nothing left to pay after this'}
          </p>
        </dl>
      )}
    </Modal>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="text-navy-soft">{label}</dt><dd className="tabular-nums">{value}</dd></div>;
}
