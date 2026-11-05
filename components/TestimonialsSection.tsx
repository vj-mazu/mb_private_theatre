'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Quote, Play, Pause, ExternalLink, Sparkles, MapPin } from 'lucide-react';

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      author: 'Kavin Raj',
      occasion: 'Family Gathering',
      branch: 'Electronic City',
      rating: 5,
      date: '2 weeks ago',
      avatar: '/images/couple_7.webp',
      text: 'Great place to spend time with friends and family on a special day. Lovely decoration, cozy and neat, great service, easy to book and add on. Outside food is allowed and you can use your own OTT platforms.',
    },
    {
      id: 2,
      author: 'Shreya Sharma',
      occasion: 'Couple Private Screening',
      branch: 'Electronic City',
      rating: 5,
      date: '3 weeks ago',
      avatar: '/images/couple_8.webp',
      text: 'One of the best private theatres in Bengaluru to celebrate. Booked the couple theatre for 4 members; the magical fog entry and fairy light setup was breathtaking!',
    },
    {
      id: 3,
      author: 'Mani Kandan',
      occasion: 'Birthday Surprise',
      branch: 'BTM 2nd Stage',
      rating: 5,
      date: '1 month ago',
      avatar: '/images/celebration_3.webp',
      text: "Top-notch arrangements, great for surprising loved ones. Thanks for making my husband's 30th birthday so memorable. The 135-inch laser screen clarity was mindblowing.",
    },
    {
      id: 4,
      author: 'Kumar & Ananya',
      occasion: 'Wedding Anniversary',
      branch: 'Electronic City',
      rating: 5,
      date: '1 month ago',
      avatar: '/images/celebration_4.webp',
      text: 'Amazing experience for our 5th anniversary. Fog entry, fresh chocolate truffle cake, customized flower decoration and photo shoot were completely fabulous.',
    },
    {
      id: 5,
      author: 'Divya Ramesh',
      occasion: 'Romantic Date Night',
      branch: 'Electronic City',
      rating: 5,
      date: 'Recent Visit',
      avatar: '/images/couple_1.webp',
      text: 'Booked the Couple Theater at Electronic City. The rose petal walkway and 4K cinema projection blew my partner away. Super clean, 100% private, and very polite crew!',
    },
    {
      id: 6,
      author: 'Arvind & Sneha',
      occasion: 'Milestone 25th Anniversary',
      branch: 'BTM 2nd Stage',
      rating: 5,
      date: 'Last month',
      avatar: '/images/celebration_2.webp',
      text: 'Celebrated 25th anniversary with our children. The 150-inch family theatre Dolby Atmos sound was crystal clear. The cold fire sparklers during cake cutting gave us goosebumps!',
    },
    {
      id: 7,
      author: 'Priya Sundaram',
      occasion: 'Best Friend’s Bachelorette',
      branch: 'BTM 2nd Stage',
      rating: 5,
      date: '3 weeks ago',
      avatar: '/images/celebration_5.webp',
      text: 'Booked the VIP Celebration Suite at BTM 2nd Stage. We connected our Netflix and danced with karaoke mics. The ambient wall lights were picture-perfect for our Instagram reels.',
    },
    {
      id: 8,
      author: 'Rajesh G.',
      occasion: 'Surprise Birthday for Daughter',
      branch: 'Electronic City',
      rating: 5,
      date: '2 weeks ago',
      avatar: '/images/ambience_5.webp',
      text: 'The cloud fog walk entry was pure magic! My 8-year-old daughter felt like a princess. Truly a 5-star celebration destination in Bangalore, hassle-free booking.',
    },
  ];

  // Seamless infinite loop by tripling items so ultra-wide and mobile screens always loop continuously
  const allTestimonials = [...testimonials, ...testimonials, ...testimonials];

  return (
    <section className="py-12 sm:py-24 bg-sand-50 relative overflow-hidden select-none" id="testimonials">
      
      {/* Studio Lighting Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-royal-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="text-center max-w-3xl mx-auto">
          
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold mb-3 shadow-xs">
            <span className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-500" />
            </span>
            <span>Rated 4.9 ★ by 850+ Verified Google Reviews</span>
          </div>

          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 tracking-tight">
            Trusted by Our Guests
          </h2>
          <p className="mt-3 text-sm sm:text-base text-ink/75 max-w-2xl mx-auto leading-relaxed">
            Real celebrations, real emotions. Read authentic stories from couples, families, and friends who made their milestones unforgettable at Movie Bash.
          </p>

          {/* Interactive Status & Control Bar */}
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-sand-300 text-slate-700 hover:text-royal-900 shadow-xs transition-all active:scale-95"
              title={isPaused ? 'Resume auto-scroll' : 'Pause auto-scroll'}
            >
              {isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
                  <span>Resume Movement</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 text-royal-700" />
                  <span>Pause Movement</span>
                </>
              )}
            </button>

            <span className="text-[11px] text-slate-500 font-medium">
              💡 Hover any review card to pause reading
            </span>
          </div>
        </div>
      </div>

      {/* CONTINUOUS AUTOMATIC HORIZONTAL MOVING TRACK */}
      <div className="relative w-full overflow-hidden group">
        
        {/* Soft edge gradient fades for seamless studio entry & exit */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-36 bg-gradient-to-r from-sand-50 via-sand-50/90 to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-36 bg-gradient-to-l from-sand-50 via-sand-50/90 to-transparent z-10" />

        {/* Marquee Track: GPU-accelerated smooth continuous horizontal translation */}
        <div
          className={`flex w-max gap-4 sm:gap-6 py-4 animate-marquee ${
            isPaused ? 'marquee-paused' : ''
          }`}
          style={{ 
            animationPlayState: isPaused ? 'paused' : 'running',
            willChange: 'transform' 
          }}
        >
          {allTestimonials.map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="w-[300px] sm:w-[400px] shrink-0 p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-sand-200/90 shadow-soft hover:shadow-elevated hover:border-royal-500 transition-all duration-300 flex flex-col justify-between group/card relative"
            >
              {/* Quote Icon Backdrop */}
              <Quote className="absolute top-4 right-4 sm:top-5 sm:right-5 w-8 h-8 sm:w-10 sm:h-10 text-sand-200/70 pointer-events-none group-hover/card:text-royal-100 transition-colors" />

              <div>
                {/* Header: Stars & Google Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    {[...Array(item.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                    <svg className="w-3 h-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Google Verified</span>
                  </div>
                </div>

                {/* Review Text: High contrast readable font */}
                <p className="font-playfair text-sm sm:text-base font-medium italic text-[#101410] leading-relaxed line-clamp-4">
                  &ldquo;{item.text}&rdquo;
                </p>
              </div>

              {/* Author & Venue Footer */}
              <div className="mt-5 pt-4 border-t border-sand-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 border-2 border-royal-700 shadow-xs">
                    <Image
                      src={item.avatar}
                      alt={item.author}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[#101410] truncate">
                      {item.author}
                    </h4>
                    <span className="text-[11px] font-semibold text-royal-700 block truncate">
                      {item.occasion}
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-sand-100 px-2 py-1 rounded-md shrink-0">
                  <MapPin className="w-2.5 h-2.5 text-royal-700" />
                  <span>{item.branch}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Google Review Callout Bar */}
      <div className="mt-8 sm:mt-12 text-center px-4">
        <a
          href="https://maps.google.com/?q=Movie+Bash+Electronic+City"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-royal-700 hover:text-royal-900 underline decoration-royal-300 hover:decoration-royal-700 underline-offset-4 transition-all"
        >
          <span>Read all 850+ real customer reviews on Google Maps</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </section>
  );
}
