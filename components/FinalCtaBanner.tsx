'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, PhoneCall, Sparkles } from 'lucide-react';

export default function FinalCtaBanner() {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fffaf0] via-[#edf5ff] to-[#d9ebff] text-ink relative overflow-hidden border-t border-sky-100">
      {/* Decorative Glow */}
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff0df] border border-[#f39a4b]/30 text-[#f39a4b] text-xs sm:text-sm font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-[#f39a4b]" />
          <span>Prime Weekend Slots Filling Up Fast</span>
        </div>

        <h2 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-ink">
          Plan Your Celebration at <br className="hidden sm:inline" />
          <span className="text-[#237eea]">Movie Bash</span> Today
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Book your private theatre slot in just 2 minutes. Choose your favorite setup, cake flavors, and magical fog entry with zero hassle.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book-now"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-white bg-gradient-to-r from-[#f39a4b] via-[#f5a75f] to-[#e6832e] hover:shadow-[0_8px_25px_rgba(243,154,75,0.35)] shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Book Private Screen</span>
          </Link>

          <a
            href="tel:+919902923656"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-[#155fbd] bg-white border border-sky-200 hover:bg-sky-50 shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5 text-[#237eea]" />
            <span>Call +91 99029 23656</span>
          </a>
        </div>

        <div className="pt-2 text-xs text-slate-500 font-medium">
          Electronic City &bull; BTM 2nd Stage &bull; 100% Privacy Guaranteed
        </div>

      </div>
    </section>
  );
}
