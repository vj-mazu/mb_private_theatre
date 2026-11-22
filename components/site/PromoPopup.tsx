'use client';

import Image from '@/components/Img';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, X } from 'lucide-react';
import type { Promo } from '@/lib/server/promos';

/** Admin-managed popup ad: shown once per visit, a few seconds after landing, never during booking. */
export function PromoPopup({ promos }: { promos: Promo[] }) {
  const pathname = usePathname();
  const [promo, setPromo] = useState<Promo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!promos.length || pathname.startsWith('/book') || pathname.startsWith('/ticket')) return;
    const next = promos.find((p) => { try { return sessionStorage.getItem(`mb-promo-${p.id}`) !== '1'; } catch { return true; } });
    if (!next) return;
    const t = setTimeout(() => setPromo(next), 5500);
    return () => clearTimeout(t);
  }, [promos, pathname]);

  function close() {
    if (promo) try { sessionStorage.setItem(`mb-promo-${promo.id}`, '1'); } catch {}
    setPromo(null);
  }

  return (
    <AnimatePresence>
      {promo && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <motion.div className="absolute inset-0 bg-navy/50 backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div role="dialog" aria-label={promo.title}
            className="relative w-full max-w-md overflow-hidden rounded-[28px] bg-cream-card shadow-lift"
            initial={{ opacity: 0, y: 40, scale: 0.94, rotateX: 12 }} animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }} exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 900 }}>
            <button onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-1.5 text-navy shadow transition hover:bg-white"><X className="h-4 w-4" /></button>
            {promo.image_url && (
              <div className="relative aspect-[16/10] bg-brand-50">
                <Image src={promo.image_url} alt="" fill sizes="448px" className="object-cover" />
              </div>
            )}
            <div className="p-6 text-center">
              <h2 className="text-2xl">{promo.title}</h2>
              {promo.text && <p className="mt-2 text-navy-soft">{promo.text}</p>}
              {promo.coupon_code && (
                <button onClick={() => { navigator.clipboard?.writeText(promo.coupon_code); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-xl border-2 border-dashed border-brand-400 bg-brand-50 px-4 py-2 font-mono text-lg font-bold tracking-wider text-brand-700">
                  {promo.coupon_code}{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              )}
              <Link href={promo.link_url || '/book'} onClick={close}
                className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white transition hover:bg-brand-700">
                {promo.button_label || 'Book now'}
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
