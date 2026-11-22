'use client';

import Image from '@/components/Img';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/components/ui';

export function GalleryGrid({ photos }: { photos: { id: number; image_url: string; caption: string; category: string }[] }) {
  const categories = ['All', ...Array.from(new Set(photos.map((p) => p.category)))];
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<number | null>(null);
  const list = cat === 'All' ? photos : photos.filter((p) => p.category === cat);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i! + 1) % list.length);
      if (e.key === 'ArrowLeft') setOpen((i) => (i! - 1 + list.length) % list.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, list.length]);

  return (
    <>
      <div className="no-scrollbar -mx-4 mt-8 flex gap-2 overflow-x-auto px-4">
        {categories.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn('whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200', cat === c ? 'bg-navy text-cream' : 'bg-cream-card text-navy-soft ring-1 ring-line hover:text-navy')}>{c}</button>
        ))}
      </div>

      <motion.div layout className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence initial={false}>
          {list.map((p, i) => (
            <motion.button layout key={p.id} onClick={() => setOpen(i)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }} className="group relative aspect-square overflow-hidden rounded-2xl bg-cream-deep">
              <Image src={p.image_url} alt={p.caption || p.category} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105" />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {open !== null && list[open] && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Close"><X className="h-5 w-5" /></button>
            <button onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }} className="absolute left-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Previous"><ChevronLeft className="h-6 w-6" /></button>
            <motion.div key={list[open].id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
              <Image src={list[open].image_url} alt={list[open].caption || ''} fill sizes="100vw" className="object-contain" />
            </motion.div>
            <button onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }} className="absolute right-3 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" aria-label="Next"><ChevronRight className="h-6 w-6" /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
