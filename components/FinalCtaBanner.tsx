'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, PhoneCall, Sparkles } from 'lucide-react';

export default function FinalCtaBanner() {
  return (
    <section className="py-16 sm:py-24 bg-[#FAF3E4] text-[#141110] relative overflow-hidden border-t border-[#141110]/10">
      {/* Decorative Glow */}
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef4a23]/10 border border-[#ef4a23]/30 text-[#ef4a23] text-xs sm:text-sm font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-[#ef4a23]" />
          <span>Prime Weekend Slots Filling Up Fast</span>
        </div>

        <h2 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-[#141110]">
          Plan Your Celebration at <br className="hidden sm:inline" />
          <span className="text-[#ef4a23]">Movie Bash</span> Today
        </h2>

        <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto font-medium leading-relaxed">
          Book your private theatre slot in just 2 minutes. Choose your favorite setup, cake flavors, and magical fog entry with zero hassle.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book-now"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-white bg-gradient-to-r from-[#ef4a23] via-[#ff5b35] to-[#ef4a23] hover:shadow-[0_8px_25px_rgba(239,74,35,0.35)] shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Book Private Screen</span>
          </Link>

          <a
            href="tel:+919902923656"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-[#141110] bg-white border border-[#141110]/20 hover:bg-[#fff5ee] shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5 text-[#ef4a23]" />
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
