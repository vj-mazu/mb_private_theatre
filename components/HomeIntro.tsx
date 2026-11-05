'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Film, Heart } from 'lucide-react';

export default function HomeIntro() {
  return (
    <section className="py-8 sm:py-24 bg-sand-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-royal-100 text-royal-700 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-royal-500" />
              <span>Bengaluru’s Premier Private Cinema</span>
            </div>

            <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 tracking-tight leading-[1.15]">
              Host the Ultimate Celebration at <span className="text-royal-600">Movie Bash</span> Private Theatre!
            </h2>

            <p className="text-base sm:text-lg text-ink/80 leading-relaxed">
              Welcome to Movie Bash Private Theatre, Bengaluru&apos;s premier destination for private movie screenings and exclusive cinema experiences. Nestled in the heart of the city, our theatre offers a luxurious and intimate setting perfect for movie enthusiasts, families, and corporate events.
            </p>

            {/* Overlapping big quote banner */}
            <div className="p-6 rounded-3xl bg-sand-100 border-l-4 border-royal-700 shadow-sm relative">
              <p className="font-playfair text-lg sm:text-xl font-bold italic text-royal-900 leading-snug">
                &ldquo;Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.&rdquo;
              </p>
              <span className="block mt-2 text-xs font-bold uppercase tracking-wider text-royal-600">
                — The Movie Bash Promise
              </span>
            </div>

            {/* 3 Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
              <Link
                href="/book-now"
                className="px-6 py-3.5 rounded-full text-sm font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all hover:scale-105"
              >
                Book Now
              </Link>
              <Link
                href="/venues/electronic-city"
                className="px-6 py-3.5 rounded-full text-sm font-bold text-royal-700 bg-white hover:bg-sand-100 border border-sand-200 shadow-sm transition-all hover:scale-105"
              >
                Explore Our Venues
              </Link>
              <Link
                href="/about"
                className="px-5 py-3.5 rounded-full text-sm font-bold text-ink/80 hover:text-royal-700 transition-colors flex items-center gap-1.5"
              >
                <span>Know About Us</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Visual Image Collage Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Primary Cinema Hall Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white aspect-[4/3]">
                <Image
                  src="/images/ambience_1.webp"
                  alt="Cinema Hall View at Movie Bash"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Electronic City</span>
                  <h4 className="text-base font-bold">150-inch Dolby Cinema Hall</h4>
                </div>
              </div>

              {/* Overlapping Decorated Luxury Room Image */}
              <div className="absolute -bottom-8 -left-6 sm:-left-10 w-3/5 rounded-2xl overflow-hidden shadow-elevated border-4 border-white aspect-square">
                <Image
                  src="/images/couple_1.webp"
                  alt="Decorated Luxury Couple Room Setup"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white">
                  <span className="text-[10px] font-bold text-amber-300">Couple Suite</span>
                  <p className="text-xs font-bold">Romantic Rose Setup</p>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -top-6 -right-4 sm:-right-6 bg-white p-4 rounded-2xl shadow-elevated border border-sand-200 max-w-[190px]">
                <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                  <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  <span className="text-ink ml-1 text-xs">4.9/5</span>
                </div>
                <p className="text-[11px] text-ink/80 mt-1 font-medium leading-tight">
                  &ldquo;The fog effect &amp; decoration was unbelievable!&rdquo;
                </p>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
