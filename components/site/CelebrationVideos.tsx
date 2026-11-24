'use client';

import Image from '@/components/Img';
import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { cn } from '@/components/ui';
import type { ShowcaseVideo } from '@/lib/types';

/**
 * Strip of short vertical celebration videos, each in a gold frame like a mounted print.
 * Nothing downloads until a card is tapped; one plays at a time.
 */
export function CelebrationVideos({ videos }: { videos: ShowcaseVideo[] }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const strip = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => strip.current?.scrollBy({ left: dir * 520, behavior: 'smooth' });

  return (
    <div className="relative mt-14">
      {/* Arrows (desktop) */}
      {(['prev', 'next'] as const).map((side) => (
        <button key={side} type="button" onClick={() => scroll(side === 'next' ? 1 : -1)} aria-label={side === 'next' ? 'Next videos' : 'Previous videos'}
          className={cn('absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gold-300/60 bg-white/90 text-navy shadow-lift backdrop-blur transition hover:scale-105 hover:bg-white lg:flex', side === 'next' ? '-right-4' : '-left-4')}>
          {side === 'next' ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      ))}

      <div ref={strip} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-10 pt-2 sm:mx-0 sm:px-3">
        {videos.map((v) => {
          const on = playing === v.video_url;
          const room = v.room || 'Movie Bash';
          const label = `${room} · ${v.title}`;
          return (
            <figure key={v.id} className="w-[212px] shrink-0 snap-center sm:w-[240px]">
              {/* gold frame */}
              <div className={cn('gold-frame rounded-[30px] p-[3px] transition-shadow duration-500', on ? 'shadow-[0_34px_60px_-26px_rgba(14,42,71,0.7)]' : 'shadow-[0_26px_44px_-28px_rgba(14,42,71,0.55)]')}>
                <div className="relative aspect-[9/16] overflow-hidden rounded-[27px] bg-navy">
                  {on ? (
                    <video src={v.video_url} poster={v.poster_url || undefined} autoPlay controls playsInline loop onEnded={() => setPlaying(null)} className="h-full w-full object-cover" />
                  ) : (
                    <button type="button" onClick={() => setPlaying(v.video_url)} aria-label={`Play video: ${label}`} className="group absolute inset-0 text-left">
                      {v.poster_url
                        ? <Image src={v.poster_url} alt={label} fill quality={85} sizes="(min-width: 640px) 480px, 424px" className="object-cover transition-transform duration-[900ms] ease-smooth group-hover:scale-105" />
                        // No poster: the video's first frame (only its first bytes are fetched).
                        : <video src={`${v.video_url}#t=0.1`} preload="metadata" muted playsInline aria-hidden className="absolute inset-0 h-full w-full object-cover" />}
                      <span className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-navy/10" />
                      {/* inner hairline, like a mounted print */}
                      <span aria-hidden className="pointer-events-none absolute inset-2.5 rounded-[20px] border border-white/45" />
                      <span className="absolute left-1/2 top-[44%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/25 text-white shadow-lift backdrop-blur-md transition duration-300 group-hover:scale-110 group-hover:bg-white/40">
                        <Play className="ml-0.5 h-6 w-6 fill-current" />
                      </span>
                      <span className="absolute inset-x-0 bottom-0 p-5 text-center">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-gold-200">{room}</span>
                        <span className="mt-1 block font-display text-2xl leading-tight text-white">{v.title}</span>
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
