'use client';

import Image from '@/components/Img';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Modal, cn } from '@/components/ui';
import type { RoomMedia, RoomVideo } from '@/lib/room-media';

/** Photos + videos of the chosen room set up for the chosen occasion (booking details step). */
export function OccasionShowcase({ media, room, occasion }: { media: RoomMedia; room: string; occasion: string }) {
  const [i, setI] = useState(0);
  const [video, setVideo] = useState<RoomVideo | null>(null);
  useEffect(() => { setI(0); }, [media]);
  const src = media.images[Math.min(i, media.images.length - 1)];

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-cream-card shadow-card">
      {src && (
        <div className="relative aspect-[16/10] bg-navy">
          <AnimatePresence initial={false}>
            <motion.div key={src} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
              <Image src={src} alt={`${occasion} setup in the ${room}`} fill quality={90} priority sizes="(min-width: 1024px) 760px, 100vw" className="object-cover" />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/80">{room}</p>
            <p className="font-display text-2xl leading-tight text-white sm:text-3xl">{occasion} setup</p>
          </div>
        </div>
      )}
      {(media.images.length > 1 || media.videos.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 p-3">
          {media.images.length > 1 && (
            <div className="no-scrollbar flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {media.images.map((s, k) => (
                <button key={s} type="button" aria-label={`Photo ${k + 1}`} aria-pressed={k === i} onClick={() => setI(k)}
                  className={cn('relative h-12 w-[72px] shrink-0 overflow-hidden rounded-lg ring-2 transition', k === i ? 'ring-brand-500' : 'opacity-70 ring-transparent hover:opacity-100')}>
                  <Image src={s} alt="" fill quality={60} sizes="72px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          {media.videos.map((v) => (
            <button key={v.src} type="button" onClick={() => setVideo(v)}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-brand-600 px-4 text-xs font-semibold text-white shadow-card transition hover:bg-brand-700">
              <PlayCircle className="h-4 w-4" />{media.videos.length > 1 ? `Watch: ${v.label.split(' · ').pop()}` : 'Watch video'}
            </button>
          ))}
        </div>
      )}
      <Modal open={!!video} onClose={() => setVideo(null)} title={video?.label || 'Video'} size="sm">
        {video && <video src={video.src} poster={video.poster} controls autoPlay playsInline loop className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl bg-black" />}
      </Modal>
    </div>
  );
}
