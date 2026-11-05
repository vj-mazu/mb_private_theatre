'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Cake, 
  Popcorn, 
  UtensilsCrossed, 
  CloudFog, 
  Sparkle, 
  Palette, 
  Baby, 
  Car, 
  Camera, 
  Flower2,
  Sparkles,
  ArrowRight,
  Play,
  Pause
} from 'lucide-react';

export default function AddonsStrip() {
  const [isPaused, setIsPaused] = useState(false);

  const addons = [
    { name: 'Fresh Truffle & Red Velvet Cakes', icon: Cake, price: 'From ₹499', tag: 'Fresh Baked' },
    { name: 'Popcorn & Beverage Combos', icon: Popcorn, price: 'From ₹199', tag: 'Cinema Snacks' },
    { name: 'Outside Food Welcome', icon: UtensilsCrossed, price: '100% Free', tag: 'Dine-in Area' },
    { name: 'Magical Cloud Fog Entry', icon: CloudFog, price: '₹499', tag: 'Grand Entry' },
    { name: 'Cold Fire Pyro Sparklers', icon: Sparkle, price: '₹399', tag: 'Safe & Smokeless' },
    { name: 'Neon & Canopy Balloon Decor', icon: Palette, price: 'From ₹299', tag: 'Photo-Ready' },
    { name: 'Baby Cart Surprise Entry', icon: Baby, price: '₹699', tag: 'Baby Shower' },
    { name: 'Car Surprise Remote Entry', icon: Car, price: '₹799', tag: 'Kids Favorite' },
    { name: 'Photo & Reel Video Shoot', icon: Camera, price: '₹1,199', tag: 'Pro Photographer' },
    { name: 'Romantic 20-Rose Bouquets', icon: Flower2, price: '₹399', tag: 'Fresh Blooms' },
  ];

  // Seamless infinite loop by tripling items
  const allAddons = [...addons, ...addons, ...addons];

  return (
    <div className="py-7 bg-royal-950 text-white border-y border-royal-800 overflow-hidden select-none relative group" id="addons-strip">
      
      {/* Studio Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Popular Celebration Add-ons (Add While Booking)</span>
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setIsPaused(!isPaused)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-royal-900 border border-royal-700 text-slate-300 hover:text-white hover:bg-royal-800 transition-colors"
            title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3 h-3 text-amber-300" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <Link
            href="/book-now"
            className="text-xs font-bold text-amber-400 hover:text-white transition-colors underline decoration-amber-400/50 flex items-center gap-1"
          >
            <span>Customize in Booking</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* CONTINUOUS AUTOMATIC HORIZONTAL MOVING STRIP (Zero Scrollbar) */}
      <div className="relative w-full overflow-hidden no-scrollbar">
        
        {/* Soft edge gradient fades */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-28 bg-gradient-to-r from-royal-950 via-royal-950/80 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-28 bg-gradient-to-l from-royal-950 via-royal-950/80 to-transparent z-10" />

        <div
          className={`flex w-max gap-3.5 sm:gap-4 py-1 animate-marquee ${
            isPaused ? 'marquee-paused' : ''
          }`}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            willChange: 'transform' 
          }}
        >
          {allAddons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-royal-900/90 border border-royal-800 hover:border-amber-400/80 hover:bg-royal-800 transition-all shadow-md group/card cursor-pointer"
              >
                <div className="p-2 rounded-xl bg-royal-800/80 text-amber-300 group-hover/card:bg-amber-400 group-hover/card:text-royal-950 transition-colors shadow-xs">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-extrabold text-white block whitespace-nowrap">
                      {item.name}
                    </span>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-royal-800 text-slate-300 border border-royal-700">
                      {item.tag}
                    </span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-extrabold block mt-0.5">
                    {item.price}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
