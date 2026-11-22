'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

/** Extracts the post/reel shortcode from any Instagram reel or post URL. */
export function reelCode(url: string): string | null {
  const m = url.match(/instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p|tv)\/([\w-]+)/i);
  return m ? m[1] : null;
}

/** 3–4 Instagram reels shown as phone-shaped cards that rise in one after another. */
export function InstagramReels({ urls, profile }: { urls: string[]; profile?: string }) {
  const codes = urls.map(reelCode).filter(Boolean).slice(0, 4) as string[];
  if (!codes.length) return null;
  return (
    <div className="mt-14">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 font-sans text-sm font-bold"><Instagram className="h-4 w-4 text-[#DD2A7B]" />Top reels from our celebrations</h3>
        {profile && <a href={profile} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-700 hover:underline">Follow on Instagram →</a>}
      </div>
      <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-5 overflow-x-auto px-4 pb-4 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
        {codes.map((code, i) => (
          <motion.div key={code} initial={{ opacity: 0, y: 40, rotate: i % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="w-[78vw] max-w-[300px] shrink-0 snap-center rounded-[30px] bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-[2px] shadow-lift lg:w-auto lg:max-w-none">
            <div className="h-[540px] overflow-hidden rounded-[28px] bg-white">
              <iframe src={`https://www.instagram.com/reel/${code}/embed/`} title={`Instagram reel ${i + 1}`} loading="lazy"
                className="h-full w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
