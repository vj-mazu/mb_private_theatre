'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Parisienne } from 'next/font/google';

const script = Parisienne({ weight: '400', subsets: ['latin'], display: 'block' });
const DURATION = 1.5;

// Plays once per page load (every visit / refresh), not again on in-site navigation back to home.
let played = false;

/** Seconds the hero should wait so its entrance starts as the intro lifts. */
export function introDelay(): number {
  return typeof window === 'undefined' || played ? 0 : DURATION + 0.35;
}

/** Opening screen: the brand name writes itself on a sky-blue screen, then slides up to reveal the page. */
export function IntroLoader() {
  const [show, setShow] = useState(() => !played);
  const progress = useMotionValue(0);
  const percent = useTransform(progress, (v) => `${Math.round(v)}%`);

  useEffect(() => {
    if (!show) return;
    played = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    const controls = animate(progress, 100, { duration: reduce ? 0.3 : DURATION, ease: [0.45, 0, 0.2, 1] });
    const t = setTimeout(() => setShow(false), reduce ? 400 : DURATION * 1000 + 200);
    return () => { controls.stop(); clearTimeout(t); document.documentElement.style.overflow = ''; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (!show) document.documentElement.style.overflow = ''; }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div key="intro" className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#1F9BDE] px-6 text-white"
          exit={{ y: '-100%', borderBottomLeftRadius: '50% 12%', borderBottomRightRadius: '50% 12%' }} transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}>
          <svg viewBox="0 0 900 220" className="w-full max-w-3xl overflow-visible" aria-label="Movie Bash">
            <defs>
              <filter id="intro-glow" x="-20%" y="-50%" width="140%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <motion.path d="M10 150 C 90 110, 150 110, 205 150" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }} />
            <motion.text x="450" y="150" textAnchor="middle" className={script.className} fontSize="150" filter="url(#intro-glow)"
              stroke="#fff" strokeWidth="1.6" strokeDasharray="2400" fill="#fff"
              initial={{ strokeDashoffset: 2400, fillOpacity: 0 }} animate={{ strokeDashoffset: 0, fillOpacity: 1 }}
              transition={{ strokeDashoffset: { duration: 1.15, ease: [0.45, 0, 0.3, 1], delay: 0.15 }, fillOpacity: { duration: 0.4, delay: 0.95 } }}>
              Movie Bash
            </motion.text>
            <motion.path d="M695 150 C 750 110, 810 110, 890 150" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 1.1, ease: 'easeOut' }} />
          </svg>
          <motion.p className="mt-4 text-center font-display text-2xl italic sm:text-3xl"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.45 }}>
            Your celebration is about to begin…
          </motion.p>
          <motion.p className="mt-3 text-xs font-semibold tracking-[0.25em] text-white/80">{percent}</motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
