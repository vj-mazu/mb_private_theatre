'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/components/ui';
import { CAKE_MAX_KG, CAKE_MIN_KG, CAKE_STEP_KG, cakeCharge, inr, kgLabel, normalizeKg } from '@/lib/booking-rules';

const QUICK = [0.5, 1, 1.5, 2, 3, 5];

/** Cake weight picker: 0.5 – 5 kg in 0.5 kg steps (quick chips, stepper or typed). Shows the extra charge. */
export function CakeWeight({ kg, onChange, pricePer500, includedInPackage, compact }: {
  kg: number; onChange: (kg: number) => void; pricePer500: number; includedInPackage: boolean; compact?: boolean;
}) {
  const [text, setText] = useState(String(kg));
  useEffect(() => setText(String(kg)), [kg]);
  const extra = cakeCharge({ price: pricePer500 }, kg, includedInPackage);

  function commit(v: string) {
    const n = normalizeKg(v);
    onChange(n);
    setText(String(n));
  }

  return (
    <div className={cn('rounded-2xl border border-line bg-cream-card p-4', compact && 'p-3')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Cake weight</p>
          <p className="text-xs text-navy-soft">
            {inr(pricePer500)} per 500 g{includedInPackage ? ' · first 500 g included in your package' : ''}
          </p>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
          <button type="button" aria-label="Less cake" disabled={kg <= CAKE_MIN_KG} onClick={() => onChange(normalizeKg(kg - CAKE_STEP_KG))}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-cream-deep disabled:opacity-30"><Minus className="h-4 w-4" /></button>
          <label className="flex items-center">
            <input value={text} inputMode="decimal" aria-label="Cake weight in kg" onChange={(e) => setText(e.target.value.replace(/[^\d.]/g, ''))}
              onBlur={(e) => commit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && commit((e.target as HTMLInputElement).value)}
              className="w-12 bg-transparent text-center font-semibold tabular-nums outline-none" />
            <span className="pr-1 text-sm text-navy-soft">kg</span>
          </label>
          <button type="button" aria-label="More cake" disabled={kg >= CAKE_MAX_KG} onClick={() => onChange(normalizeKg(kg + CAKE_STEP_KG))}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-cream-deep disabled:opacity-30"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button type="button" key={q} onClick={() => onChange(q)}
            className={cn('rounded-full px-3 py-1 text-xs font-semibold transition-colors', kg === q ? 'bg-brand-600 text-white' : 'bg-white text-navy-soft ring-1 ring-line hover:ring-brand-300')}>
            {kgLabel(q)}
          </button>
        ))}
        <span className="ml-auto self-center text-sm font-semibold text-brand-700">{extra ? `+ ${inr(extra)}` : 'Included'}</span>
      </div>
    </div>
  );
}
