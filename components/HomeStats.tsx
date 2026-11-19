'use client';

import React from 'react';
import { Film, Star, Users, MapPin } from 'lucide-react';

export default function HomeStats() {
  const stats = [
    {
      label: 'Bookings Completed',
      value: '3,500+',
      desc: 'Memorable celebrations hosted',
      icon: Film,
    },
    {
      label: 'Google Rating',
      value: '5.0 ★',
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
    <section className="py-8 sm:py-14 bg-white border-y border-[#00A2E4]/15 text-ink relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#fffdf9] border border-[#00A2E4]/15 hover:border-[#00A2E4] transition-all text-center flex flex-col items-center justify-center group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E6F3FB] text-[#00A2E4] flex items-center justify-center mb-2.5 sm:mb-3 group-hover:bg-[#00A2E4] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="font-playfair text-2xl sm:text-4xl font-black text-[#00A2E4] tracking-tight">
                  {s.value}
                </div>
                <div className="mt-1 text-xs sm:text-sm font-bold text-ink">
                  {s.label}
                </div>
                <div className="mt-0.5 text-[11px] sm:text-xs text-slate-500 font-medium">
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
