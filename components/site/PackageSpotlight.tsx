'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/components/ui';
import { inr } from '@/lib/booking-rules';

// One colour per package: panel, soft circle, accent text.
const THEMES = [
  { panel: '#2A9BD9', circle: '#DDF0FC', accent: '#167DBA' },
  { panel: '#1B3F6B', circle: '#E4E9F4', accent: '#1B3F6B' },
  { panel: '#18A39A', circle: '#DDF5F2', accent: '#0F7F78' },
  { panel: '#7C5CC4', circle: '#EEE8FA', accent: '#6445AE' },
];
const ease = [0.22, 1, 0.36, 1] as const;

interface Item { key: string; name: string; tagline: string; includes: string[]; image: string; highlight: boolean; price: (t: any) => { price: number } | undefined }

/** Package showcase: copy + round thumbnails on the left; a coloured stage with the package photo, vertical name pill and giant outlined name on the right. */
export function PackageSpotlight({ branches, theatres, packages, customPackage }: { branches: any[]; theatres: any[]; packages: any[]; customPackage: { enabled: boolean; tagline: string; includes: string[]; image_url: string } }) {
  const [branch, setBranch] = useState(branches[0]?.id);
  const [index, setIndex] = useState(0);
  const list = theatres.filter((t) => t.branch_id === branch);
  const slug = branches.find((b) => b.id === branch)?.slug;

  const items: Item[] = [
    ...packages.map((p) => ({ key: `p${p.id}`, name: p.name, tagline: p.tagline, includes: p.includes, image: p.image_url || list[0]?.image_url, highlight: p.highlight, price: (t: any) => t.prices[p.id] })),
    ...(customPackage.enabled ? [{ key: 'custom', name: 'Custom', tagline: customPackage.tagline, highlight: false,
      image: customPackage.image_url || list[list.length - 1]?.image_url || list[0]?.image_url, includes: customPackage.includes,
      price: (t: any) => ({ price: t.base_price }) }] : []),
  ];
  const n = items.length;
  const item = items[index];
  const theme = THEMES[index % THEMES.length];
  const from = Math.min(...list.map((t) => item.price(t)?.price ?? Infinity));

  const fromOf = (it: Item) => {
    const p = Math.min(...list.map((t) => it.price(t)?.price ?? Infinity));
    return Number.isFinite(p) ? inr(p) : '—';
  };
  // Package toggle (shown at the top): every option visible; the visitor switches, nothing changes on its own.
  const toggle = (id: string) => (
    <div role="tablist" aria-label="Packages" className="grid gap-1.5 rounded-2xl border border-line bg-white p-1.5 shadow-card"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {items.map((it, i) => (
        <button key={it.key} role="tab" aria-selected={i === index} onClick={() => setIndex(i)}
          className={cn('relative rounded-xl px-2 py-2.5 text-center transition-colors duration-300', i === index ? 'text-white' : 'text-navy hover:bg-cream-deep')}>
          {i === index && <motion.span layoutId={id} className="absolute inset-0 rounded-xl shadow-lift" style={{ background: theme.accent }} transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
          <span className="relative block text-sm font-bold">{it.name}</span>
          <span className={cn('relative block text-[11px]', i === index ? 'text-white/80' : 'text-navy-soft')}>from {fromOf(it)}</span>
        </button>
      ))}
    </div>
  );

  return (
    <section id="packages" className="relative scroll-mt-16 overflow-hidden bg-brand-50/60">
      <div className="container-page pt-16 lg:hidden">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700"><span className="h-px w-6 bg-brand-700" />The celebration menu</p>
        <h2 className="mt-3 text-3xl">{n} ways to celebrate. <span className="italic" style={{ color: theme.accent }}>One unforgettable night.</span></h2>
        {branches.length > 1 && (
          <div className="mt-4 inline-flex w-full rounded-full border border-line bg-white p-1">
            {branches.map((b) => (
              <button key={b.id} onClick={() => setBranch(b.id)}
                className={cn('flex-1 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors', branch === b.id ? 'bg-navy text-white' : 'text-navy-soft')}>{b.name}</button>
            ))}
          </div>
        )}
        <div className="mt-4">{toggle('pkg-toggle-m')}</div>
      </div>
      <div className="relative grid min-h-[640px] lg:grid-cols-2">
        {/* Left: copy */}
        <div className="relative z-10 order-2 flex flex-col justify-center px-5 pb-16 pt-6 lg:order-1 sm:px-10 lg:py-24 lg:pl-[max(24px,calc((100vw-72rem)/2+24px))] lg:pr-10">
          <p className="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-700 lg:flex"><span className="h-px w-6 bg-brand-700" />The celebration menu</p>
          <h2 className="mt-4 hidden text-4xl sm:text-5xl lg:block">{n} ways to celebrate. <span className="italic" style={{ color: theme.accent }}>One unforgettable night.</span></h2>
          <div className="mt-6 hidden max-w-lg lg:block">{toggle('pkg-toggle-d')}</div>

          <AnimatePresence mode="wait">
            <motion.div key={item.key + branch} initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
              transition={{ duration: 0.5, ease }}>
              <p className="text-sm font-semibold lg:mt-8" style={{ color: theme.accent }}>from {Number.isFinite(from) ? inr(from) : '—'}</p>
              <h3 className="mt-1 text-4xl sm:text-5xl">{item.name} <span className="italic" style={{ color: theme.accent }}>package</span></h3>
              <p className="mt-3 max-w-lg text-navy-soft">{item.tagline}</p>
              <ul className="mt-5 grid max-w-lg gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
                {item.includes.map((inc) => (
                  <li key={inc} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: theme.accent }} />{inc}</li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={`/book?branch=${slug}`} className="inline-flex h-12 items-center gap-2 rounded-full px-6 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5" style={{ background: theme.accent }}>
              Book {item.name} <ArrowRight className="h-4 w-4" />
            </Link>
            {branches.length > 1 && (
              <div className="hidden rounded-full border border-line bg-white p-1 lg:inline-flex">
                {branches.map((b) => (
                  <button key={b.id} onClick={() => setBranch(b.id)}
                    className={cn('rounded-full px-3.5 py-2 text-xs font-semibold transition-colors', branch === b.id ? 'bg-navy text-white' : 'text-navy-soft hover:text-navy')}>{b.name}</button>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right: stage */}
        <div className="relative order-1 min-h-[320px] overflow-hidden sm:min-h-[420px] lg:order-2 lg:min-h-0">
          <motion.div aria-hidden className="absolute -left-[18%] top-1/2 aspect-square w-[118%] -translate-y-1/2 rounded-full max-lg:left-[-10%] max-lg:w-[120%]"
            animate={{ backgroundColor: theme.circle }} transition={{ duration: 0.8 }} />
          <motion.div aria-hidden className="absolute inset-y-0 left-[38%] right-0 rounded-l-[56px]" animate={{ backgroundColor: theme.panel }} transition={{ duration: 0.8 }} />

          {/* Giant outlined name, horizontal along the bottom of the panel */}
          <AnimatePresence mode="wait">
            <motion.span key={'big' + item.key} aria-hidden
              className="pointer-events-none absolute bottom-4 left-[40%] max-lg:hidden right-3 overflow-hidden whitespace-nowrap text-center font-display text-[3.5rem] leading-[1.1] text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)] sm:text-[5rem] xl:text-[6.5rem]"
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} transition={{ duration: 0.6, ease }}>
              {item.name}
            </motion.span>
          </AnimatePresence>

          {/* Photo with name label on top */}
          <div className="absolute inset-0 flex items-center justify-center lg:pl-[6%]" style={{ perspective: 1400 }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div key={'img' + item.key + branch} className="relative w-[80%] max-w-[520px]"
                initial={{ opacity: 0, x: 120, rotate: 8, rotateY: -25, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, rotate: -3, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, x: -120, rotate: -12, rotateY: 25, scale: 0.9 }}
                transition={{ duration: 0.75, ease }}>
                <span className="absolute -top-5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-5 py-2 font-display text-xl shadow-lift sm:text-2xl" style={{ color: theme.accent }}>
                  {item.name} package
                </span>
                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border-[6px] border-white shadow-[0_40px_70px_-25px_rgba(14,42,71,0.55)]">
                  {item.image && <Image src={item.image} alt={`${item.name} package setup`} fill sizes="(min-width: 1024px) 520px, 80vw" quality={82} className="object-cover" />}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
