'use client';

import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

export default function WhatWeProvideSection() {
  const items = [
    {
      num: '01',
      title: 'Decoration',
      caption: 'Thoughtful surprises',
      desc: 'Balloons, ribbons, fairy lights & neon signs personalized to your occasion.',
      image: '/images/ambience_9.webp',
    },
    {
      num: '02',
      title: 'Floral Arrangements',
      caption: 'Fresh fragrant blooms',
      desc: 'Hand-tied Dutch rose bouquets & romantic rose petal walkways.',
      image: '/images/couple_5.webp',
    },
    {
      num: '03',
      title: 'Photography',
      caption: 'Capture every moment',
      desc: 'Dedicated photoshoot sessions capturing smiles, cake cutting & candid reels.',
      image: '/images/ambience_10.webp',
    },
    {
      num: '04',
      title: 'Food & Beverages',
      caption: 'Snacks to full meals',
      desc: 'Buttery popcorn, chilled sodas, or order any food via Zomato/Swiggy.',
      image: '/images/ambience_11.webp',
    },
    {
      num: '05',
      title: 'Custom Cakes',
      caption: 'Celebrate with fresh cake',
      desc: 'Delicious chocolate truffle, red velvet, and heart cakes baked fresh.',
      image: '/images/celebration_7.webp',
    },
    {
      num: '06',
      title: 'Special Grand Entries',
      caption: 'Fog, cold pyro & buggy',
      desc: 'Cinematic ground fog entry and glittering indoor safe sparklers.',
      image: '/images/ambience_6.webp',
    },
  ];

  return (
    <section className="py-10 sm:py-24 bg-sand-100/60 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-700">
            End-To-End Experience
          </span>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 mt-2 tracking-tight">
            Everything Your Celebration Needs
          </h2>
          <p className="mt-4 text-base text-ink/75">
            We handle everything from custom decor to surprise entries so you just walk in and enjoy.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6 lg:gap-8">
          {items.map((item) => (
            <div
              key={item.num}
              className="rounded-2xl sm:rounded-3xl bg-white border border-sand-200 overflow-hidden shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              <div className="relative h-28 sm:h-52 w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 50vw, 400px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-royal-900/80 via-transparent to-transparent" />
                
                <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-royal-700 text-amber-300 font-playfair font-black text-[10px] sm:text-xs flex items-center justify-center shadow-md">
                    {item.num}
                  </span>
                </div>

                <div className="absolute bottom-2 left-2.5 right-2.5 sm:bottom-3 sm:left-4 sm:right-4 text-white">
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-300 block font-bold">{item.caption}</span>
                  <h3 className="font-playfair text-sm sm:text-xl font-bold truncate">{item.title}</h3>
                </div>
              </div>

              <div className="p-2.5 sm:p-5">
                <p className="text-[11px] sm:text-xs text-ink/75 leading-relaxed line-clamp-2 sm:line-clamp-none">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
