'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { introDelay } from './IntroLoader';

export interface OrbitItem { name: string; image: string; href: string }

const ease = [0.22, 1, 0.36, 1] as const;
const STEP = 34;
// [x%, y%, size px, delay s] — fixed so server and client render the same.
const SPARKS: [number, number, number, number][] = [[8,18,3,0],[18,62,2,1.1],[27,30,3,2.2],[38,12,2,0.6],[62,14,3,1.7],[71,58,2,0.3],[82,24,3,2.6],[91,66,2,1.4],[12,82,2,2],[88,86,3,0.9],[50,8,2,2.9],[34,88,2,1.6]]; // degrees between tiles on the wheel

/**
 * Hero inspired by product-wheel landing pages: a framed stage with the selected celebration photo in the centre,
 * a wheel of tilted photo tiles orbiting behind it, and a big serif headline. Tiles rotate on a timer or on tap.
 */
export function HeroOrbit({ title, items, rating, from }: { title: string; items: OrbitItem[]; rating: number; from: string }) {
  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [d] = useState(introDelay);
  const [maxOffset, setMaxOffset] = useState(2.8);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const apply = () => setMaxOffset(mq.matches ? 2.2 : 2.8);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
  const turn = useMotionValue(0); // continuous position on the wheel (in items)

  useEffect(() => {
    const controls = animate(turn, active, { type: 'spring', stiffness: 70, damping: 18, mass: 1 });
    return () => controls.stop();
  }, [active, turn]);
  // Pause only while the tab is hidden (touch/hover never stops the rotation).
  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setActive((a) => a + 1), 4200);
    return () => clearInterval(t);
  }, [paused, n]);

  const idx = ((active % n) + n) % n;
  // Rotate the shortest way round to tile i.
  const pick = (i: number) => setActive((a) => {
    let delta = (i - (((a % n) + n) % n) + n) % n;
    if (delta > n / 2) delta -= n;
    return a + delta;
  });
  const item = items[idx];
  // Load the big centre photo only for the current slide and the next one (then keep it), instead of all at once.
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0, 1 % Math.max(n, 1)]));
  useEffect(() => {
    setMounted((m) => (m.has(idx) && m.has((idx + 1) % n) ? m : new Set(Array.from(m).concat([idx, (idx + 1) % n]))));
  }, [idx, n]);

  return (
    <section className="relative isolate overflow-hidden px-3 pb-10 pt-4 sm:px-5 sm:pb-16">
      {/* Aurora backdrop around the frame */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,#EAF5FC_0%,#FBF7EF_70%)]">
        <motion.div className="absolute -left-40 -top-32 h-[520px] w-[520px] rounded-full bg-brand-300/45 blur-[90px]"
          animate={{ x: [0, 120, 0], y: [0, 60, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute -right-32 top-20 h-[460px] w-[460px] rounded-full bg-[#9ad7f5]/50 blur-[90px]"
          animate={{ x: [0, -100, 0], y: [0, 80, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-[#c9e8fb]/70 blur-[80px]"
          animate={{ x: [0, 80, -40, 0] }} transition={{ duration: 26, repeat: Infinity, ease: 'easeInOut' }} />
      </div>
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: d, ease }}
        className="gold-frame relative mx-auto max-w-[1400px] overflow-hidden rounded-[32px] p-[2px] shadow-[0_50px_100px_-45px_rgba(14,42,71,0.75)] sm:rounded-[40px]">
        <div className="relative flex flex-col overflow-hidden rounded-[30px] bg-[radial-gradient(70%_55%_at_50%_32%,#2b78b5_0%,#103a62_58%,#081f37_100%)] sm:rounded-[38px]">
          <div aria-hidden className="absolute left-1/2 top-0 h-[60%] w-[70%] -translate-x-1/2 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(185,225,248,0.35),transparent_70%)]" />
          {/* Inner gold hairline — like a cinema screen frame */}
          <div aria-hidden className="pointer-events-none absolute inset-2.5 z-30 rounded-[24px] border border-gold-300/25 sm:inset-3.5 sm:rounded-[30px]" />
          {/* Two soft spotlight beams sweeping from the top corners */}
          <motion.div aria-hidden className="pointer-events-none absolute -left-[10%] -top-[30%] h-[140%] w-[45%] origin-top-left bg-[linear-gradient(170deg,rgba(243,227,181,0.20),rgba(243,227,181,0.06)_40%,transparent_70%)] blur-2xl [clip-path:polygon(0_0,38%_0,100%_100%,55%_100%)]"
            animate={{ rotate: [-6, 4, -6] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }} />
          <motion.div aria-hidden className="pointer-events-none absolute -right-[10%] -top-[30%] h-[140%] w-[45%] origin-top-right bg-[linear-gradient(190deg,rgba(185,225,248,0.22),rgba(185,225,248,0.06)_40%,transparent_70%)] blur-2xl [clip-path:polygon(62%_0,100%_0,45%_100%,0_100%)]"
            animate={{ rotate: [6, -4, 6] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }} />
          {/* Soft vignette for depth */}
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_55%,rgba(4,14,28,0.55)_100%)]" />
          {/* Sparkle field */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {SPARKS.map(([x, y, sz, dl], k) => (
              <motion.span key={k} className="absolute rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, width: sz, height: sz }}
                animate={{ opacity: [0, 0.9, 0], scale: [0.6, 1.2, 0.6] }} transition={{ duration: 3.2, delay: dl, repeat: Infinity, ease: 'easeInOut' }} />
            ))}
          </div>

          {/* Stage: wheel + centre photo */}
          <div className="relative h-[clamp(300px,38svh,330px)] sm:h-[clamp(420px,60svh,560px)]">
            <div className="absolute inset-x-0 top-1/2">
              {items.map((it, i) => <Tile key={it.name} item={it} i={i} n={n} turn={turn} maxOffset={maxOffset} onPick={() => pick(i)} />)}
            </div>

            <div className="absolute left-1/2 top-1/2 z-20 h-[76%] -translate-x-1/2 -translate-y-1/2 sm:h-[84%]">
              <div aria-hidden className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(134,203,241,0.45),transparent)] blur-2xl" />
              <div className="gold-frame relative aspect-[4/5] h-full rounded-[30px] p-[3px] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.75),0_0_50px_-10px_rgba(231,199,125,0.35)]">
              <div className="relative h-full w-full overflow-hidden rounded-[27px] bg-navy">
                {/* Photos cross-fade; the next one is always preloaded, so switching never shows an empty frame. */}
                {items.map((it, k) => mounted.has(k) && (
                  <motion.div key={it.image + k} className="absolute inset-0" initial={false}
                    animate={{ opacity: k === idx ? 1 : 0, scale: k === idx ? 1 : 1.08 }} transition={{ opacity: { duration: 0.8 }, scale: { duration: 1.4, ease } }}>
                    <Image src={it.image} alt={k === idx ? it.name : ''} fill priority={k === 0} sizes="(min-width: 640px) 380px, 60vw" quality={82} className="object-cover" />
                  </motion.div>
                ))}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
                {/* light sheen that glides across the photo every few seconds */}
                <motion.div aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ['0%', '420%'] }} transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut', delay: d + 1.5 }} />
                <div aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-white/30" />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-center p-4 text-center">
                  <AnimatePresence mode="wait">
                    <motion.p key={item.name} initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                      transition={{ duration: 0.45, ease }} className="whitespace-nowrap font-display text-xl text-white drop-shadow sm:text-3xl">{item.name}</motion.p>
                  </AnimatePresence>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => setActive((a) => a - 1)} aria-label="Previous" className="hidden h-9 w-9 sm:flex items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-navy"><ChevronLeft className="h-4 w-4" /></button>
                    <Link href={item.href} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-4 py-2 text-sm font-semibold text-navy shadow-lift transition hover:-translate-y-0.5">
                      from {from} <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button onClick={() => setActive((a) => a + 1)} aria-label="Next" className="hidden h-9 w-9 sm:flex items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white hover:text-navy"><ChevronRight className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* Headline */}
          <div className="relative px-4 pb-8 pt-4 text-center sm:pb-10">
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + 0.25, duration: 0.6 }}
              className="mb-3 flex items-center justify-center gap-2.5 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-200 sm:gap-3 sm:text-xs sm:tracking-[0.32em]">
              <span className="h-px w-6 shrink-0 bg-gradient-to-r from-transparent to-gold-300 sm:w-14" />Private theatre celebrations<span className="h-px w-6 shrink-0 bg-gradient-to-l from-transparent to-gold-300 sm:w-14" />
            </motion.p>
            <h1 className="mx-auto max-w-5xl text-[2.2rem] leading-[1.02] text-white sm:text-6xl lg:text-7xl">
              {title.split(' ').map((w, k, arr) => (
                <span key={k} className="inline-block overflow-hidden pb-1 align-bottom">
                  <motion.span className={`inline-block ${k >= arr.length - 2 ? 'gold-text italic' : ''}`}
                    initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: d + 0.35 + k * 0.06, ease }}>
                    {w}{k < arr.length - 1 ? ' ' : ''}
                  </motion.span>
                </span>
              ))}
            </h1>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: d + 0.9, duration: 0.6 }}
              className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm text-white/85">
              <Link href="/book" className="group inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f3e3b5,#d9b25f_55%,#c9962e)] px-7 py-3.5 text-base font-semibold text-navy shadow-[0_14px_30px_-12px_rgba(201,150,46,0.8),inset_0_1px_0_rgba(255,255,255,0.6)] transition hover:-translate-y-0.5 hover:brightness-105">
                Book your slot <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="flex items-center gap-2 whitespace-nowrap rounded-full border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur">
                <span className="flex">{Array.from({ length: 5 }).map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</span>
                {rating.toFixed(1)} on Google
              </span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Tile({ item, i, n, turn, maxOffset, onPick }: { item: OrbitItem; i: number; n: number; turn: MotionValue<number>; maxOffset: number; onPick: () => void }) {
  // Signed distance (in items) from the active position, wrapped to [-n/2, n/2).
  const offset = useTransform(turn, (t) => { let o = (i - t) % n; if (o < -n / 2) o += n; if (o >= n / 2) o -= n; return o; });
  const angle = useTransform(offset, (o) => o * STEP);
  const x = useTransform(angle, (a) => `calc(${Math.sin((a * Math.PI) / 180)} * var(--r))`);
  const y = useTransform(angle, (a) => `calc(${-Math.cos((a * Math.PI) / 180)} * var(--r) + var(--r) * 0.82)`);
  const opacity = useTransform(offset, (o) => (Math.abs(o) < 0.55 ? 0 : Math.abs(o) > maxOffset ? 0 : 1));
  const scale = useTransform(offset, (o) => 1 - Math.min(Math.abs(o), 3) * 0.06);
  const z = useTransform(offset, (o) => Math.round(10 - Math.abs(o)));

  return (
    <motion.button suppressHydrationWarning onClick={onPick} aria-label={item.name} style={{ x, y, rotate: angle, opacity, scale, zIndex: z }}
      className="absolute left-1/2 top-0 -ml-[var(--t)] -mt-[var(--t)] h-[calc(var(--t)*2)] w-[calc(var(--t)*2)] rounded-[26%] bg-[linear-gradient(135deg,#f3e3b5,#ffffff_40%,#d9b25f)] p-1.5 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6),0_0_26px_rgba(231,199,125,0.3)] transition-[filter] hover:brightness-110 [--r:min(46vw,190px)] [--t:27px] sm:p-2 sm:[--r:min(34vw,420px)] sm:[--t:70px]">
      <span className="relative block h-full w-full overflow-hidden rounded-[22%]">
        <Image src={item.image} alt="" fill quality={75} sizes="(min-width: 640px) 140px, 72px" draggable={false} className="object-cover" />
      </span>
    </motion.button>
  );
}
