'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowRight, 
  Heart, 
  Sparkles, 
  Cake, 
  Wine, 
  Baby, 
  Award,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CalendarDays,
  Play,
  Pause
} from 'lucide-react';

export default function OccasionsSection() {
  const occasions = [
    {
      id: 1,
      slug: 'anniversary',
      title: 'Romantic Anniversary',
      tagline: 'Fairy Lights, Heart Decor & Rose Petals',
      desc: 'Celebrate your journey together in complete intimacy. A private 4K cinema screening, dim candlelit ambience, flower walkway, and surprise anniversary video on the big screen.',
      image: '/images/couple_1.webp',
      badge: 'Most Popular for Couples',
      icon: Heart,
      highlights: ['Rose Petal Heart Decor', 'Personalized Video on 150" Screen', 'Romantic Fairy Lights Glow', 'Private Couple Recliner Suite']
    },
    {
      id: 2,
      slug: 'birthday-party',
      title: 'Grand Birthday Surprises',
      tagline: 'Magical Fog Entry, Neon Sign & Custom Cake',
      desc: 'Make birthdays unforgettable. Walk in through dense magical cloud fog, cut your cake under glowing neon backdrops, and dance to your favorite tracks with JBL Dolby audio.',
      image: '/images/celebration_1.webp',
      badge: 'Top Booked Celebration',
      icon: Cake,
      highlights: ['Magical Cloud Fog Walkway', 'Neon Milestone Illuminated Backdrop', 'Fresh Truffle/Red Velvet Cake', 'Cold Fire Pyro Sparklers']
    },
    {
      id: 3,
      slug: 'date-and-proposal',
      title: 'Dream Dates & Proposals',
      tagline: 'The Perfect "Yes" Moment on 4K Screen',
      desc: 'Pop the most important question of your life in complete privacy. Personalized proposal video playing on the giant screen, candlelit lanterns, and fireworks sparklers.',
      image: '/images/couple_3.webp',
      badge: '100% Yes Success Rate',
      icon: Sparkles,
      highlights: ['Big Screen Surprise Video Reveal', 'Candlelit Pathway & Fresh Flowers', 'Cold Sparklers Cake Cutting', 'Private Photographer Reel Shoot']
    },
    {
      id: 4,
      slug: 'bachelorette-party',
      title: 'Bachelorette & Bride-to-Be',
      tagline: 'Girl Gang Glamour, Karaoke & Party Recliners',
      desc: 'Celebrate the bride’s final single days with high-energy fun. Private dance space, wireless karaoke microphones, custom photo props, and endless laughs with your best friends.',
      image: '/images/celebration_5.webp',
      badge: 'High Energy & Fun',
      icon: Wine,
      highlights: ['Wireless Karaoke Microphones', 'Bachelorette Sash & Props Ready', 'Private Dance & Dining Lounge', 'OTT Streaming (Netflix/Prime)']
    },
    {
      id: 5,
      slug: 'baby-shower',
      title: 'Pastel Baby Showers',
      tagline: 'Sweet Memories, Balloon Canopies & Baby Buggy',
      desc: 'A warm, joyous celebration for the mother-to-be. Pastel balloon arches, baby buggy entry, family dining tables, and comfortable couch seating for elders and friends.',
      image: '/images/celebration_6.webp',
      badge: 'Family & Warmth',
      icon: Baby,
      highlights: ['Pastel Balloon Cloud Canopy', 'Remote Baby Buggy Surprise', 'Outside Catering & Snacks Allowed', 'Multi-tier Comfortable Seating']
    },
    {
      id: 6,
      slug: 'farewell',
      title: 'Farewell & Corporate Hangouts',
      tagline: 'Big Screen Memory Reels & Team Bonding',
      desc: 'Bid farewell to cherished colleagues or host exclusive team game nights and screenings with 150-inch Dolby surround projection and private party seating for up to 20 guests.',
      image: '/images/ambience_5.webp',
      badge: 'Up to 20 Guests',
      icon: Award,
      highlights: ['150-inch Curved Cinema Projection', 'Laptop HDMI & OTT Sharing', 'Spacious Seating for 12-20 Guests', 'Karaoke & Party Sound System']
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play animation timer (cycles every 5 seconds)
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % occasions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, occasions.length]);

  const activeOccasion = occasions[activeIndex];

  return (
    <section className="py-12 sm:py-24 bg-sand-50 relative overflow-hidden" id="occasions">
      
      {/* Background Soft Studio Aura */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-royal-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-100 border border-royal-200 text-royal-900 text-xs font-bold mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-royal-700" />
            <span>Every Milestone Deserves A Giant 4K Screen</span>
          </div>

          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 tracking-tight">
            Celebrate Life’s Special Occasions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 max-w-2xl mx-auto leading-relaxed">
            Select your celebration theme below to preview real decor setups, balloon backdrops, and custom special effects.
          </p>

          {/* Interactive Occasion Tabs (Animated Pill Switchers) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
            {occasions.map((occ, idx) => {
              const Icon = occ.icon;
              const isSelected = activeIndex === idx;
              return (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={occ.id}
                  onClick={() => {
                    setActiveIndex(idx);
                    setIsAutoPlaying(false);
                  }}
                  className={`px-3.5 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-royal-800 text-white shadow-md scale-105 ring-2 ring-royal-600/30'
                      : 'bg-white border-2 border-sand-300 text-slate-800 hover:border-royal-500 hover:text-royal-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-royal-700'}`} />
                  <span>{occ.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FEATURED ANIMATED SHOWCASE CARD */}
        <div 
          className="bg-white rounded-3xl border-2 border-slate-300 shadow-elevated overflow-hidden transition-all duration-500 relative"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Animated Auto-play Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 overflow-hidden">
            <div 
              key={activeIndex}
              className={`h-full bg-gradient-to-r from-royal-600 to-amber-400 ${
                isAutoPlaying ? 'animate-[progress_5s_linear_infinite]' : 'w-full'
              }`}
              style={{
                animation: isAutoPlaying ? 'progress 5000ms linear infinite' : 'none',
                width: isAutoPlaying ? undefined : '100%'
              }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            
            {/* Left 7 Cols: High-Resolution Real Setup Photo with Fade Transition */}
            <div className="lg:col-span-7 relative min-h-[300px] sm:min-h-[420px] bg-slate-950 overflow-hidden">
              <Image
                key={activeOccasion.image}
                src={activeOccasion.image}
                alt={activeOccasion.title}
                fill
                className="object-cover object-center animate-in fade-in zoom-in-95 duration-700"
                sizes="(max-width: 1024px) 100vw, 750px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Badge & Quick Stats */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-extrabold text-royal-900 shadow-md flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{activeOccasion.badge}</span>
                </span>
              </div>

              {/* Bottom Photo Overlay Tag */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                  Verified Real Setup Photograph
                </span>
                <p className="font-playfair text-xl sm:text-2xl font-bold leading-tight drop-shadow-md">
                  {activeOccasion.tagline}
                </p>
              </div>

              {/* Prev / Next Slide Floating Controls */}
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setActiveIndex((prev) => (prev === 0 ? occasions.length - 1 : prev - 1));
                  setIsAutoPlaying(false);
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                aria-label="Previous Occasion"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                type="button"
                suppressHydrationWarning
                onClick={() => {
                  setActiveIndex((prev) => (prev + 1) % occasions.length);
                  setIsAutoPlaying(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                aria-label="Next Occasion"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Right 5 Cols: Details & 1-Click Booking Action */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-royal-700">
                    Celebration Experience #{activeIndex + 1} of {occasions.length}
                  </span>
                  <button
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                    className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                    title={isAutoPlaying ? 'Pause rotation' : 'Resume auto rotation'}
                  >
                    {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-600" />}
                  </button>
                </div>

                <h3 className="font-playfair text-2xl sm:text-3xl font-black text-[#101410] tracking-tight">
                  {activeOccasion.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {activeOccasion.desc}
                </p>

                {/* Included Experience Highlights */}
                <div className="pt-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900 block mb-2.5">
                    What&apos;s Included In This Celebration:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {activeOccasion.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-center gap-3">
                <Link
                  href={`/book-now?occasion=${activeOccasion.slug}`}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-full text-xs sm:text-sm font-extrabold text-white bg-royal-800 hover:bg-royal-700 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-center"
                >
                  <CalendarDays className="w-4 h-4 text-amber-300" />
                  <span>Book This {activeOccasion.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/gallery"
                  className="w-full sm:w-auto py-3.5 px-5 rounded-full text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all text-center"
                >
                  View Photos &rarr;
                </Link>
              </div>

            </div>

          </div>
        </div>

        {/* Small Bottom Row: All 6 Occasion Cards Preview */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {occasions.map((occ, idx) => {
            const isCurrent = activeIndex === idx;
            return (
              <button
                type="button"
                suppressHydrationWarning
                key={occ.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className={`p-2.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isCurrent
                    ? 'border-royal-800 bg-white shadow-md ring-2 ring-royal-600/30'
                    : 'border-slate-300 bg-white/70 hover:border-royal-500 hover:bg-white'
                }`}
              >
                <div className="relative h-16 w-full rounded-xl overflow-hidden mb-2 bg-slate-900">
                  <Image src={occ.image} alt={occ.title} fill className="object-cover" sizes="150px" />
                </div>
                <h4 className="text-[11px] font-extrabold text-[#101410] truncate">{occ.title}</h4>
                <span className="text-[10px] text-royal-700 font-bold block mt-0.5">Click to Preview &rarr;</span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
