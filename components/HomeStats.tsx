'use client';

import React from 'react';
import { Film, Star, Users, MapPin } from 'lucide-react';

export default function HomeStats() {
  const stats = [
    {
      label: 'Bookings Completed',
      value: '12,500+',
      desc: 'Memorable celebrations hosted',
      icon: Film,
    },
    {
      label: 'Google Rating',
      value: '4.9 ★',
      desc: 'Based on 850+ real reviews',
      icon: Star,
    },
    {
      label: 'Max Guests Per Theatre',
      value: '20 Guests',
      desc: 'Spacious & private for groups',
      icon: Users,
    },
    {
      label: 'Bengaluru Branches',
      value: '2 Venues',
      desc: 'Electronic City & BTM 2nd Stage',
      icon: MapPin,
    },
  ];

  return (
    <section className="py-8 sm:py-14 bg-royal-950 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-royal-900 border border-royal-800 hover:border-amber-400/50 transition-all text-center flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-royal-800 text-amber-400 flex items-center justify-center mb-2.5 sm:mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-playfair text-2xl sm:text-4xl font-black text-amber-400 tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-bold text-white">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[11px] sm:text-xs text-slate-300 font-medium">
                  {s.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
