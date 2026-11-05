'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Sparkles } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-royal-950 text-white py-2 px-4 text-xs sm:text-sm font-medium border-b border-royal-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="inline-flex items-center justify-center p-1 bg-royal-700 rounded-full text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <span>
            Explore our venues in <strong className="text-amber-300 font-bold">Electronic City</strong> &amp; <strong className="text-amber-300 font-bold">BTM 2nd Stage</strong>. Flat ₹200 OFF with code <strong className="text-white underline">MOVIEBASH200</strong>!
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
