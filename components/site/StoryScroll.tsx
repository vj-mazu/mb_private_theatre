'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { ArrowRight, MapPin } from 'lucide-react';

export interface StoryChapter {
  title: string;
  body: string;
  quote?: string;
  image: string;
  cta?: { href: string; label: string };
  mapUrl?: string;
}

const TONES = ['from-[#FFFDF8] via-[#FBF7EF] to-[#F3F8FC]', 'from-[#FFFDF8] via-[#F7F9FC] to-[#EEF5FB]', 'from-[#FFFDF8] via-[#FBF7EF] to-[#F1F0F8]'];

/**
 * Home-page story: on desktop, chapters are cards that slide up and stack (the card beneath gently shrinks).
 * On phones they are simple cards that fade in — no sticky scrolling, so scrolling up and down stays natural.
 */
export function StoryScroll({ chapters, heading }: { chapters: StoryChapter[]; heading: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const n = chapters.length;

  return (
    <div ref={ref} className="relative bg-gradient-to-b from-cream via-brand-50/40 to-cream px-4 pb-20 pt-20 sm:px-5 lg:pb-24">
      <div className="container-page mb-10 text-center">{heading}</div>
      {chapters.map((c, i) => <Card key={i} c={c} i={i} n={n} progress={scrollYProgress} />)}
    </div>
  );
}

function Card({ c, i, n, progress }: { c: StoryChapter; i: number; n: number; progress: MotionValue<number> }) {
  const start = i / n;
  const scale = useTransform(progress, [start, 1], [1, 1 - (n - 1 - i) * 0.05]);
  const shade = useTransform(progress, [start + 0.5 / n, start + 1 / n], [0, i === n - 1 ? 0 : 0.12]);

  return (
    <div className="sticky mx-auto mb-[14vh] h-[min(74svh,600px)] max-w-6xl last:mb-0 lg:mb-[18vh] lg:h-[min(80vh,660px)]"
      style={{ top: `calc(84px + ${i * 14}px)`, perspective: 1200 }}>
      {/* Entry: the card rises, straightens and settles once as it comes into view (smooth on phones too). */}
      <motion.div className="h-full will-change-transform" style={{ transformOrigin: 'center bottom' }}
        initial={{ opacity: 0, y: 70, scale: 0.92, rotateX: 12 }}
        whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: 'spring', stiffness: 70, damping: 18, mass: 0.9 }}>
      <motion.article style={{ scale, transformOrigin: 'center top' }}
        className="gold-frame relative h-full rounded-[34px] p-[2px] shadow-[0_40px_80px_-36px_rgba(14,42,71,0.55),0_0_0_1px_rgba(201,150,46,0.08)]">
        <div className={`grid h-full grid-rows-[45%_1fr] overflow-hidden rounded-[32px] bg-gradient-to-br lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1 ${TONES[i % TONES.length]}`}>
          <div className="relative m-2 overflow-hidden rounded-[26px] lg:m-3 lg:mr-0">
            <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} whileInView={{ scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}>
              <Image src={c.image} alt={c.title} fill quality={85} sizes="(min-width: 1024px) 620px, 100vw" className="object-cover" priority={i === 0} />
            </motion.div>
            <div className="absolute inset-0 bg-gradient-to-t from-navy/25 via-transparent to-transparent" />
            {/* inner hairline frame, like a mounted print */}
            <div aria-hidden className="pointer-events-none absolute inset-3 rounded-[20px] border border-white/45" />
          </div>
          <div className="relative flex min-h-0 flex-col justify-center overflow-hidden p-5 sm:p-10 lg:py-8 lg:pl-10 lg:pr-9">
            <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(231,199,125,0.22),transparent)]" />
            <span className="flex items-center gap-3 text-gold-500"><span className="h-px w-10 bg-gradient-to-r from-transparent to-gold-400" />✦<span className="h-px w-10 bg-gradient-to-l from-transparent to-gold-400" /></span>
            <h3 className="mt-3 text-3xl leading-tight sm:text-5xl lg:text-[clamp(2.25rem,3.3vw,3rem)] lg:leading-[1.08]">{c.title}</h3>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-navy-soft sm:text-lg lg:text-base xl:text-[17px]">
              {c.body.split(/\n\s*\n/).map((p, k) => <p key={k} className={k > 0 ? 'max-lg:hidden' : 'max-lg:line-clamp-4'}>{p}</p>)}
            </div>
            {c.quote && (
              <blockquote className="relative mt-7 shrink-0 max-lg:hidden rounded-2xl border border-gold-300/50 bg-white/60 py-3.5 pl-6 pr-5 font-display text-lg italic leading-snug text-navy shadow-[0_10px_30px_-20px_rgba(168,122,31,0.6)] xl:text-[1.2rem] [@media(max-height:700px)]:hidden">
                <span aria-hidden className="absolute -top-5 left-4 font-display text-6xl leading-none text-gold-400">“</span>
                <span className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-gold-300 via-gold-500 to-gold-300" />
                {c.quote}
              </blockquote>
            )}
            {c.cta && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={c.cta.href} className="group inline-flex h-11 items-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_rgba(22,125,186,0.9)] transition-all hover:-translate-y-0.5 hover:bg-brand-700">
                  {c.cta.label}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                {c.mapUrl && <a href={c.mapUrl} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold transition hover:border-brand-300"><MapPin className="h-4 w-4 text-brand-600" />Directions</a>}
              </div>
            )}
          </div>
        </div>
        <motion.div aria-hidden className="pointer-events-none absolute inset-[2px] rounded-[32px] bg-navy" style={{ opacity: shade }} />
      </motion.article>
      </motion.div>
    </div>
  );
}
