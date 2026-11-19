'use client';

import React from 'react';
import { Tv, Sparkles, Utensils, PhoneCall, HeartHandshake } from 'lucide-react';

export default function WhyChooseUs() {
  const points = [
    {
      num: '01',
      title: 'All OTT Platforms Ready',
      desc: 'Seamlessly stream on Netflix, Prime Video, Disney+ Hotstar, YouTube, or connect your personal laptop via HDMI.',
      icon: Tv,
    },
    {
      num: '02',
      title: 'Decor Included',
      desc: 'Beautiful themed balloon styling, ribbon cascades, warm fairy lighting, and celebration backdrops set up before you walk in.',
      icon: Sparkles,
    },
    {
      num: '03',
      title: 'Food & Add-ons Available',
      desc: 'Fresh cakes, popcorn combos, and cold drinks available on demand. Outside food and Swiggy/Zomato delivery warmly allowed.',
      icon: Utensils,
    },
    {
      num: '04',
      title: 'Plan It in One Call',
      desc: 'Our party coordinators customize timing, personalized names on screen, cake surprises, and fog entries in just minutes.',
      icon: PhoneCall,
    },
    {
      num: '05',
      title: 'Friendly Helpful Team',
      desc: 'Attentive on-ground staff respecting your 100% private screening while standing by for instant support and photography.',
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-cream border-b border-sky-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold shadow-xs">
            Why Bengaluru Chooses Movie Bash
          </span>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-ink mt-3 tracking-tight">
            Designed for Pure Privacy &amp; Grand Celebrations
          </h2>
          <p className="mt-4 text-base text-slate-600 font-medium">
            Every screen is tailored to give you the comfort of your living room with the luxury of a private multiplex.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {points.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-[0_12px_40px_rgba(20,17,16,0.06)] hover:shadow-[0_16px_50px_rgba(239,74,35,0.12)] hover:border-[#00A2E4] transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-playfair text-2xl sm:text-3xl font-black text-[#00A2E4]">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E6F3FB] text-[#00A2E4] flex items-center justify-center group-hover:bg-[#00A2E4] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}

          {points.slice(3, 5).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-[0_12px_40px_rgba(20,17,16,0.06)] hover:shadow-[0_16px_50px_rgba(239,74,35,0.12)] hover:border-[#00A2E4] transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <span className="font-playfair text-2xl sm:text-3xl font-black text-[#00A2E4]">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E6F3FB] text-[#00A2E4] flex items-center justify-center group-hover:bg-[#00A2E4] group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-ink mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            );
          })}

          {/* Bonus 6th highlight card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0B2238] to-[#2a2220] text-white shadow-[0_16px_50px_rgba(0,0,0,0.3)] flex flex-col justify-between border border-white/10">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#ffd46e]">Opening Special</span>
              <h3 className="font-playfair text-2xl sm:text-3xl font-bold mt-2 text-white">
                Flat ₹300 Off First Booking
              </h3>
              <p className="text-xs sm:text-sm text-white/90 mt-3 leading-relaxed">
                Use promo code <strong className="text-white font-mono bg-white/20 px-2 py-0.5 rounded">MOVIEBASH300</strong> on checkout. Includes free celebration cake &amp; personal name board!
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/20">
              <a
                href="/book-now"
                className="w-full py-3 rounded-full text-center text-xs sm:text-sm font-bold text-[#0B2238] bg-[#F6FAFD] hover:bg-[#00A2E4] hover:text-white shadow-md block transition-all hover:scale-105"
              >
                Claim ₹300 Voucher &rarr;
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
