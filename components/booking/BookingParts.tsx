import Image from '@/components/Img';
import { Users, Minus, Plus } from 'lucide-react';
import { chargedQty, formatDate, inr, kgLabel, slotLabel } from '@/lib/booking-rules';

// Pieces of the customer booking flow: price summary, + / − counter and the chosen room's preview.
export function Summary({ theatre, slot, date, pkg, cake, cakeKg, extraHours, items, quote, coupon, advance, short, branch }: any) {
  if (!theatre || !slot) return <p className="text-sm text-navy-soft">Pick a theatre and time slot to see your booking summary.</p>;
  return (
    <div>
      <p className="eyebrow">Your booking</p>
      <h3 className="mt-2 text-xl">{theatre.name}</h3>
      <p className="text-sm text-navy-soft">{branch?.name}</p>
      <p className="mt-2 text-sm font-medium">{formatDate(date, { weekday: 'long', day: 'numeric', month: 'long' })}<br />{slotLabel(slot.start_time, slot.end_time, extraHours)}</p>
      {quote && (
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <Line label={pkg ? `${pkg.name} package${short ? ' · short slot' : ''}` : 'Custom (room only)'} value={inr(quote.base)} />
          {quote.extraPersons > 0 && <Line label={`Extra guests × ${quote.extraPersons}`} value={inr(quote.extraPersonAmount)} />}
          {quote.extraHours > 0 && <Line label={`Extra hours × ${quote.extraHours}`} value={inr(quote.extraHourAmount)} />}
          {cake && <Line label={`${cake.name} cake · ${kgLabel(cakeKg)}`} value={quote.cakeAmount ? inr(quote.cakeAmount) : 'Included'} />}
          {items.map((i: any) => <Line key={i.name} label={`${i.name}${i.qty > 1 ? ` × ${i.qty}` : ''}`} value={chargedQty(i) ? inr(i.price * chargedQty(i)) : 'Included'} />)}
          {coupon && <Line label={`Coupon ${coupon.code}`} value={`− ${inr(quote.discount)}`} />}
          <div className="flex justify-between border-t border-dashed border-line pt-3 text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{inr(quote.total)}</dd></div>
          <div className="flex justify-between rounded-lg bg-brand-50 px-3 py-2 text-brand-700"><dt>Advance to pay now</dt><dd className="font-bold tabular-nums">{inr(Math.min(advance, quote.total))}</dd></div>
        </dl>
      )}
      {!quote && <p className="mt-5 border-t border-line pt-4 text-sm text-navy-soft">Choose your package next to see the price.</p>}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><dt className="min-w-0 truncate text-navy-soft">{label}</dt><dd className="shrink-0 tabular-nums">{value}</dd></div>;
}

export function Counter({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
      <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-cream-deep disabled:opacity-30" aria-label="Decrease"><Minus className="h-4 w-4" /></button>
      <span className="w-8 text-center font-semibold tabular-nums">{value}</span>
      <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-8 w-8 items-center justify-center rounded-lg transition hover:bg-cream-deep disabled:opacity-30" aria-label="Increase"><Plus className="h-4 w-4" /></button>
    </div>
  );
}

/** Walk-through video (or photo) of the chosen theatre, shown while picking a package. */
export function TheatrePreview({ theatre, branch }: { theatre: any; branch?: string }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-navy text-cream shadow-lift">
      <div className="grid sm:grid-cols-[1.4fr_1fr]">
        <div className="relative aspect-video bg-black">
          {theatre.video_url ? (
            <video key={theatre.video_url} src={theatre.video_url} poster={theatre.image_url || undefined} playsInline controls preload="none"
              className="h-full w-full object-cover" />
          ) : theatre.image_url ? (
            <Image src={theatre.image_url} alt={theatre.name} fill sizes="(min-width: 640px) 60vw, 100vw" className="object-cover" />
          ) : null}
        </div>
        <div className="flex flex-col justify-center p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">{branch}</p>
          <h2 className="mt-1 text-2xl text-cream">{theatre.name}</h2>
          {theatre.description && <p className="mt-2 text-sm text-cream/70">{theatre.description}</p>}
          <p className="mt-3 flex items-center gap-1.5 text-sm text-cream/80"><Users className="h-4 w-4 text-brand-300" />{theatre.base_capacity} included · up to {theatre.max_capacity}</p>
        </div>
      </div>
    </div>
  );
}
