'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-[#237eea] text-white py-2 px-3 sm:px-4 text-[11px] sm:text-xs font-medium border-b border-[#155fbd]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto text-center sm:text-left">
          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#f39a4b] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-xs">
            Opening Offer
          </span>
          <span className="leading-tight sm:leading-normal">
            Flat <strong className="text-amber-200 font-bold">₹200 OFF</strong> with code <strong className="bg-white/20 px-1.5 py-0.5 rounded text-white font-mono font-black tracking-wide">MOVIEBASH200</strong>!
            <Link href="/book-now" prefetch={true} className="inline-block ml-2 text-white underline font-bold sm:hidden">
              Book &rarr;
            </Link>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-xs">
          <a
            href="tel:+919902923656"
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-200" />
            <span className="font-semibold">+91 99029 23656</span>
          </a>
          <span className="text-white/40">|</span>
          <Link href="/book-now" prefetch={true} className="text-white hover:text-amber-200 font-bold transition-colors">
            Check Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
