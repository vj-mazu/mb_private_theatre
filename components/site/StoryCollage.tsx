'use client';

import Image from '@/components/Img';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/** Four photos in a layered collage that drift apart gently as the page scrolls. */
export function StoryCollage({ images }: { images: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const up = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const down = useTransform(scrollYProgress, [0, 1], [-30, 50]);
  const [a, b, c, d] = images;

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-[560px]">
      {a && (
        <motion.div style={{ y: up }} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9 }}
          className="absolute left-[14%] top-[6%] h-[64%] w-[58%] overflow-hidden rounded-[28px] border-[6px] border-white shadow-lift">
          <Image src={a} alt="" fill priority sizes="330px" className="object-cover" />
        </motion.div>
      )}
      {b && (
        <motion.div style={{ y: down }} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.9, delay: 0.15 }}
          className="absolute right-0 top-[22%] h-[42%] w-[40%] rotate-3 overflow-hidden rounded-[24px] border-[5px] border-white shadow-lift">
          <Image src={b} alt="" fill sizes="230px" className="object-cover" />
        </motion.div>
      )}
      {c && (
        <motion.div style={{ y: down }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }}
          className="absolute bottom-0 left-0 h-[38%] w-[42%] -rotate-3 overflow-hidden rounded-[24px] border-[5px] border-white shadow-lift">
          <Image src={c} alt="" fill sizes="240px" className="object-cover" />
        </motion.div>
      )}
      {d && (
        <motion.div style={{ y: up }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.35 }}
          className="absolute bottom-[4%] right-[8%] h-[34%] w-[38%] rotate-2 overflow-hidden rounded-[24px] border-[5px] border-white shadow-lift">
          <Image src={d} alt="" fill sizes="220px" className="object-cover" />
        </motion.div>
      )}
    </div>
  );
}
