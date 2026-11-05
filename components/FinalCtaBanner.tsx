'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, PhoneCall, Sparkles } from 'lucide-react';

export default function FinalCtaBanner() {
  return (
    <section className="py-10 sm:py-20 bg-royal-900 text-white relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-royal-600/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-800 border border-royal-700 text-amber-300 text-xs sm:text-sm font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Prime Weekend Slots Filling Up Fast</span>
        </div>

        <h2 className="font-playfair text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
          Plan Your Celebration at <br className="hidden sm:inline" />
          <span className="text-amber-300">Movie Bash</span> Today
        </h2>

        <p className="text-base sm:text-xl text-slate-100 max-w-2xl mx-auto font-normal leading-relaxed">
          Book your private theatre slot in just 2 minutes. Choose your favorite setup, cake flavors, and magical fog entry with zero hassle.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/book-now"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-royal-glow flex items-center justify-center gap-2 hover:scale-105"
          >
            <CalendarDays className="w-5 h-5" />
            <span>Book Private Screen</span>
          </Link>

          <a
            href="tel:+919902923656"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold text-white bg-royal-800/80 hover:bg-royal-700 border border-royal-700 transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-5 h-5 text-amber-400" />
            <span>Call +91 99029 23656</span>
          </a>
        </div>

        <div className="pt-2 text-xs text-slate-300">
          Electronic City &bull; BTM 2nd Stage &bull; 100% Privacy Guaranteed
        </div>

      </div>
    </section>
  );
}
