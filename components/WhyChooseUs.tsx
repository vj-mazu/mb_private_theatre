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
    <section className="py-10 sm:py-24 bg-sand-100/70 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-700">
            Why Bengaluru Chooses Movie Bash
          </span>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 mt-2 tracking-tight">
            Designed for Pure Privacy &amp; Grand Celebrations
          </h2>
          <p className="mt-4 text-base text-ink/75">
            Every screen is tailored to give you the comfort of your living room with the luxury of a private multiplex.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8">
          {points.slice(0, 3).map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <span className="font-playfair text-2xl sm:text-3xl font-black text-royal-900 group-hover:text-royal-600 transition-colors">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-royal-100 text-royal-700 flex items-center justify-center group-hover:bg-royal-700 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-royal-900 mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
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
                className="p-4 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-elevated transition-all hover:-translate-y-1 group md:col-span-1 lg:col-span-1"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-6">
                  <span className="font-playfair text-2xl sm:text-3xl font-black text-royal-900 group-hover:text-royal-600 transition-colors">
                    {item.num}
                  </span>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-royal-100 text-royal-700 flex items-center justify-center group-hover:bg-royal-700 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
                <h3 className="text-base sm:text-xl font-bold text-royal-900 mb-1 sm:mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink/70 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}

          {/* Bonus 6th highlight card */}
          <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl royal-gradient text-white shadow-elevated flex flex-col justify-between">
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300">Special Offer</span>
              <h3 className="font-playfair text-xl sm:text-2xl font-bold mt-1.5 sm:mt-2 text-white">
                Planning a Weekend Surprise?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1.5 sm:mt-2 leading-relaxed">
                Slots fill up 48 hours in advance. Lock your favorite branch &amp; slot with just ₹500 advance today.
              </p>
            </div>
            <a
              href="tel:+919902923656"
              className="mt-4 sm:mt-6 inline-flex items-center justify-center gap-2 py-2.5 px-4 sm:py-3 sm:px-5 rounded-full bg-amber-400 text-royal-950 font-bold text-xs sm:text-sm hover:bg-amber-300 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call +91 99029 23656</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
