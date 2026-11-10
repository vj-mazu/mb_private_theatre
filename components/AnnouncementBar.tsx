'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-royal-950 text-white py-1.5 sm:py-2 px-3 sm:px-4 text-[11px] sm:text-xs font-medium border-b border-royal-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 w-full sm:w-auto text-center sm:text-left">
          <span className="inline-flex items-center justify-center p-1 bg-royal-700 rounded-full text-amber-300 shrink-0">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </span>
          <span className="leading-tight sm:leading-normal">
            <span className="hidden sm:inline">Explore our venues in <strong className="text-amber-300 font-bold">Electronic City</strong> &amp; <strong className="text-amber-300 font-bold">BTM 2nd Stage</strong>. </span>
            Flat <strong className="text-amber-300 font-bold">₹200 OFF</strong> with code <strong className="text-amber-300 font-black tracking-wide underline sm:no-underline">MOVIEBASH200</strong>!
            <Link href="/book-now" prefetch={true} className="inline-block ml-1.5 text-amber-400 font-bold hover:underline sm:hidden">
              Book &rarr;
            </Link>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-xs">
          <a
            href="tel:+919902923656"
            className="flex items-center gap-1.5 hover:text-amber-300 text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300" />
            <span>+91 99029 23656</span>
          </a>
          <span className="text-royal-600">|</span>
          <Link href="/book-now" prefetch={true} className="text-amber-300 hover:text-white font-bold transition-colors">
            Check Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
