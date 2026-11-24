'use client';

import Image from '@/components/Img';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { Cake, Check } from 'lucide-react';
import { cn } from '@/components/ui';
import { inr } from '@/lib/booking-rules';

export interface BookPackage {
  id: number | null; name: string; tagline: string; includes: string[]; price: number; original_price: number | null;
  /** Photos of the chosen theatre (first one is shown first); the guest can switch between them. */
  images: string[]; highlight: boolean; includesCake: boolean; meta?: string;
}

const ACCENTS = ['#1577B1', '#B8862B', '#14958F', '#7C5CC4'];
const PRINT_S = 1.25;

/**
 * Package picker styled as a ticket printer: choosing a package in the toggle feeds a fresh
 * printed movie ticket out of the machine's slot (stepped paper feed, slight 3D curl that settles flat).
 * The ticket that is out of the printer is the selected package.
 */
export function PackageTicket({ items, value, onChange, theatreName }: {
  items: BookPackage[]; value: number | null; onChange: (id: number | null) => void; theatreName?: string;
}) {
  const reduce = useReducedMotion();
  const index = Math.max(0, items.findIndex((it) => it.id === value));
  const it = items[index];
  const [printing, setPrinting] = useState(true);
  const first = useRef(true);

  useEffect(() => {
    setPrinting(true);
    const t = setTimeout(() => setPrinting(false), (first.current ? 0.15 : 0.45) * 1000 + PRINT_S * 1000);
    first.current = false;
    return () => clearTimeout(t);
  }, [index]);

  // Keep the selection valid if the list changes (e.g. another theatre without this package).
  useEffect(() => { if (!items.some((x) => x.id === value) && items[0]) onChange(items[0].id); }, [items, value, onChange]);

  if (!it) return null;

  return (
    <div>
      {/* Printer */}
      <div className="relative z-20 rounded-[26px] bg-gradient-to-b from-[#1a3f66] via-navy to-[#0a1f36] px-3 pb-4 pt-3 shadow-[0_24px_40px_-24px_rgba(14,42,71,0.75)] sm:px-5">
        <div className="flex items-center justify-between px-1 pb-3">
          <p className="font-display text-sm italic text-[#e7c77d]">Movie Bash · Ticket counter</p>
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            <span className={cn('h-2 w-2 rounded-full', printing ? 'animate-pulse bg-amber-400 shadow-[0_0_8px_#fbbf24]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]')} />
            {printing ? 'Printing' : 'Ready'}
          </span>
        </div>
        <div role="radiogroup" aria-label="Package" className="no-scrollbar flex gap-1 overflow-x-auto rounded-2xl bg-white/10 p-1">
          {items.map((x, k) => (
            <button key={x.id ?? 'custom'} role="radio" aria-checked={k === index} onClick={() => onChange(x.id)}
              className={cn('relative min-w-0 flex-1 whitespace-nowrap rounded-xl px-2 py-2 text-sm font-semibold transition-colors sm:px-4 sm:py-2.5', k === index ? 'text-navy' : 'text-white/75 hover:text-white')}>
              {k === index && <motion.span layoutId="ticket-tab" className="absolute inset-0 rounded-xl bg-cream-card shadow" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
              <span className="relative flex flex-col items-center justify-center leading-tight sm:flex-row sm:gap-1.5">
                {x.name}
                <span className={cn('text-xs font-medium', k === index ? 'text-navy-soft' : 'text-white/50')}>{inr(x.price)}</span>
              </span>
            </button>
          ))}
        </div>
        {/* Paper slot */}
        <div className="mx-3 mt-4 h-3 rounded-full bg-[#04101d] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.08)] sm:mx-6" />
      </div>

      {/* Paper coming out of the slot */}
      <div className="relative -mt-[22px] px-5 sm:px-10">
        <div className="relative overflow-hidden pt-[14px]" style={{ perspective: 1400 }}>
          {/* shadow cast by the slot lip onto the paper */}
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[14px] z-10 h-5 bg-gradient-to-b from-[#0e2a47]/35 to-transparent" />
          <AnimatePresence mode="wait" initial={!reduce}>
            <motion.div key={it.id ?? 'custom'} style={{ transformOrigin: '50% 0%' }}
              initial={reduce ? { opacity: 0 } : { y: '-101%', rotateX: -16 }}
              animate={reduce ? { opacity: 1 } : { y: ['-101%', '-78%', '-76%', '-52%', '-50%', '-26%', '-24%', '0%'], rotateX: [-16, -16, -14, -12, -10, -8, -6, 0] }}
              exit={reduce ? { opacity: 0 } : { y: 40, rotate: -4, opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }}
              transition={{ duration: PRINT_S, times: [0, 0.18, 0.26, 0.44, 0.52, 0.7, 0.78, 1], ease: 'easeOut' }}>
              <Ticket it={it} n={index} theatreName={theatreName} stamped={!printing} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/** Deterministic barcode bars from a string. */
function bars(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return Array.from({ length: 34 }, (_, i) => { h = Math.imul(h ^ i, 16777619); return 1 + ((h >>> 0) % 3); });
}

function Ticket({ it, n, theatreName, stamped }: { it: BookPackage; n: number; theatreName?: string; stamped: boolean }) {
  const accent = ACCENTS[n % ACCENTS.length];
  const serial = `MB-${it.name.slice(0, 3).toUpperCase()}-${String(n + 1).padStart(4, '0')}`;
  const [shot, setShot] = useState(0);
  const [bad, setBad] = useState<string[]>([]);
  const photos = it.images.filter((p) => p && !bad.includes(p));
  const cur = photos[Math.min(shot, photos.length - 1)];

  // Gentle 3D tilt that follows the pointer (desktop only — touch devices keep it flat).
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [5, -5]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 180, damping: 18 });
  const shine = useTransform(mx, [-0.5, 0.5], ['20%', '80%']);
  const sheen = useTransform(shine, (p) => `radial-gradient(600px circle at ${p} 0%, rgba(255,255,255,0.55), transparent 45%)`);
  function move(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== 'mouse') return;
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  const leave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div onPointerMove={move} onPointerLeave={leave} style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
      className="relative pb-3 drop-shadow-[0_22px_26px_rgba(14,42,71,0.22)]">
      <div className="ticket-paper relative overflow-hidden text-navy">
        {/* Photo + header */}
        <div className="relative min-w-0">
          <div className="flex items-center justify-between border-b border-dashed border-navy/20 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.22em] text-navy-soft sm:px-6">
            <span>Admit · Private screening</span>
            <span className="font-mono tracking-normal">{serial}</span>
          </div>
          <div>
            {/* Theatre photos: large and sharp, with a strip to switch between them */}
            <div className="flex flex-col bg-navy">
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16 / 10', minHeight: 200 }}>
                {cur
                  ? (
                    <AnimatePresence initial={false}>
                      <motion.div key={cur} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
                        <Image src={cur} alt={`${it.name} package in ${theatreName || 'the theatre'}`} fill priority quality={90} onError={() => setBad((b) => [...b, cur])}
                          sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
                      </motion.div>
                    </AnimatePresence>
                  )
                  : <div className="absolute inset-0" style={{ background: accent }} />}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10" />
                <span className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow" style={{ background: accent }}>
                  No. {String(n + 1).padStart(2, '0')}
                </span>
                {/* "Selected" stamp lands once printing finishes */}
                <div className="pointer-events-none absolute right-3 top-3 z-10">
                  <AnimatePresence>
                    {stamped && (
                      <motion.span initial={{ scale: 2.4, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 0.95, rotate: -8 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                        className="block whitespace-nowrap rounded-md border-[2.5px] bg-[#fffaf0]/95 px-2 py-0.5 font-mono text-[11px] font-black uppercase tracking-[0.18em]"
                        style={{ color: accent, borderColor: accent }}>
                        ✓ Selected
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                {it.highlight && <span className="absolute left-[72px] top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-navy shadow">Most loved</span>}
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="font-display text-3xl leading-tight text-white sm:text-4xl">{it.name}</h3>
                  {it.tagline && <p className="mt-0.5 text-sm text-white/90">{it.tagline}</p>}
                </div>
              </div>
              {photos.length > 1 && (
                <div className="no-scrollbar flex gap-1.5 overflow-x-auto bg-navy p-2">
                  {photos.map((p, k) => (
                    <button key={p} type="button" aria-label={`Photo ${k + 1}`} aria-pressed={k === shot} onClick={() => setShot(k)}
                      className={cn('relative h-12 w-[68px] shrink-0 overflow-hidden rounded-md ring-2 transition', k === shot ? 'ring-white' : 'opacity-60 ring-transparent hover:opacity-100')}>
                      <Image src={p} alt="" fill quality={60} sizes="68px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:grid md:grid-cols-[minmax(0,1fr)_170px]">
            <div className="min-w-0 px-5 py-4 sm:px-6">
              {it.meta && <p className="text-xs font-semibold text-navy-soft">{it.meta}</p>}
              <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {it.includes.map((inc) => (
                  <li key={inc} className="flex gap-2.5 text-sm leading-snug">
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white" style={{ background: accent }}><Check className="h-2.5 w-2.5" strokeWidth={3} /></span>
                    {inc}
                  </li>
                ))}
              </ul>
              {it.includesCake && (
                <p className="mt-3 flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
                  <Cake className="mt-0.5 h-3.5 w-3.5 shrink-0" />500 g cake included — choose the flavour on the next step.
                </p>
              )}
            </div>

        {/* Tear-off stub */}
        <div className="relative flex items-center justify-between gap-4 border-t-2 border-dashed border-navy/25 px-5 py-4 md:flex-col md:items-stretch md:justify-center md:border-l-2 md:border-t-0 md:px-4 md:text-center">
          {/* punched notches where the stub tears off */}
          <span aria-hidden className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-cream md:-left-3 md:-top-3" />
          <span aria-hidden className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-cream md:-bottom-3 md:-left-3 md:right-auto md:top-auto" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-navy-soft">{theatreName || 'Your theatre'}</p>
            <p className="mt-1 font-display text-3xl" style={{ color: accent }}>{inr(it.price)}</p>
            {it.original_price && it.original_price > it.price && <p className="text-xs text-navy-faint line-through">{inr(it.original_price)}</p>}
          </div>
          <div className="flex flex-col items-end md:mt-4 md:items-center">
            <div aria-hidden className="flex h-10 items-stretch gap-[2px]">
              {bars(serial).map((w, i) => <span key={i} className="bg-navy" style={{ width: w }} />)}
            </div>
            <p className="mt-1 font-mono text-[9px] tracking-widest text-navy-soft">{serial}</p>
          </div>
        </div>

        </div>

        {/* glossy sheen that follows the pointer */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
          style={{ background: sheen }} />
      </div>
      {/* Serrated tear edge at the bottom of the printed paper */}
      <div aria-hidden className="ticket-edge absolute inset-x-0 bottom-0 h-3" />
    </motion.div>
  );
}
