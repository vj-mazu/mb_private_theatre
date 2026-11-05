'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Star, Sparkles } from 'lucide-react';

export default function BranchMarquee() {
  const chips = [
    {
      name: 'Electronic City Post, Bengaluru',
      tag: '12,500+ Celebrations',
      rating: '4.9/5',
      isNew: false,
      mapLink: 'https://maps.google.com/?q=Movie+Bash+Electronic+City',
    },
    {
      name: 'BTM 2nd Stage, Bengaluru',
      tag: 'Newly Launched',
      rating: '4.9/5',
      isNew: true,
      mapLink: 'https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru',
    },
    {
      name: 'Couple Private Screening',
      tag: 'From ₹899',
      rating: 'Top Rated',
      isNew: false,
      mapLink: '/book-now',
    },
    {
      name: 'Grand Birthday & Anniversary Suites',
      tag: 'Fog & Decor Included',
      rating: '5.0/5',
      isNew: false,
      mapLink: '/book-now',
    },
    {
      name: '150-inch Family Dolby Cinemas',
      tag: 'Up to 20 Guests',
      rating: '4.9/5',
      isNew: false,
      mapLink: '/book-now',
    },
  ];

  // Duplicate for seamless infinite marquee loop
  const allChips = [...chips, ...chips];

  return (
    <div className="bg-royal-900 border-y border-royal-800 py-3.5 overflow-hidden select-none">
      <div className="flex w-max animate-marquee gap-6">
        {allChips.map((chip, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-2 rounded-full bg-royal-800/80 border border-royal-700/60 text-sand-50 text-xs sm:text-sm font-semibold shrink-0"
          >
            <span className="flex items-center gap-1.5 text-white font-bold">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              <span>{chip.name}</span>
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-royal-600" />

            <span className="flex items-center gap-1 text-emerald-400">
              {chip.isNew ? (
                <span className="px-1.5 py-0.5 rounded bg-amber-400 text-royal-950 text-[10px] font-black uppercase">
                  NEW
                </span>
              ) : (
                <span>{chip.tag}</span>
              )}
            </span>

            <span className="w-1.5 h-1.5 rounded-full bg-royal-600" />

            <span className="flex items-center gap-1 text-amber-300">
              <Star className="w-3.5 h-3.5 fill-amber-300" />
              <span>{chip.rating}</span>
            </span>

            <a
              href={chip.mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] underline text-slate-200 hover:text-white transition-colors ml-1"
            >
              See Map &rarr;
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
