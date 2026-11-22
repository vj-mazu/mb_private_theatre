'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, ArrowRight } from 'lucide-react';
import { BranchTabs } from './BranchTabs';
import { inr } from '@/lib/booking-rules';

export function TheatresSection({ branches, theatres }: { branches: any[]; theatres: any[] }) {
  const [branch, setBranch] = useState(branches[0]?.id);
  const list = theatres.filter((t) => t.branch_id === branch);
  const slug = branches.find((b) => b.id === branch)?.slug;

  return (
    <>
      <div className="flex justify-center"><BranchTabs branches={branches} value={branch} onChange={setBranch} className="mt-8" /></div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {list.map((t, i) => {
            const from = Math.min(t.base_price, ...Object.values(t.prices).map((p: any) => p.price));
            return (
              <motion.article key={t.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="card group overflow-hidden text-left transition-shadow duration-500 hover:shadow-lift">
                <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
                  {t.image_url && <Image src={t.image_url} alt={t.name} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.05]" />}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-2xl">{t.name}</h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      <Users className="h-3.5 w-3.5" />{t.base_capacity === t.max_capacity ? t.base_capacity : `${t.base_capacity}–${t.max_capacity}`}
                    </span>
                  </div>
                  {t.description && <p className="mt-2 line-clamp-2 text-sm text-navy-soft">{t.description}</p>}
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-navy-soft">from <span className="text-lg font-bold text-navy">{inr(from)}</span></p>
                    <Link href={`/book?branch=${slug}&theatre=${t.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 transition-all hover:gap-2">
                      Check slots <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}
