'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Quote, Play, Pause, ExternalLink, Sparkles, MapPin } from 'lucide-react';

export default function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);

  const testimonials = [
    {
      id: 1,
      author: 'Neha Sultana',
      occasion: "Baby's Birthday Celebration",
      branch: 'Electronic City',
      rating: 5,
      date: 'a month ago',
      avatar: '/images/couple_7.webp',
      text: "Had the absolute best time celebrating our baby's birthday here! The team provided outstanding service and genuine cooperation throughout the event. The photos and videos turned out stunning—crisp, well-lit, and beautiful memory-keepers. The cake was a huge hit too! The design was exactly what we asked for, and it tasted amazing. Thank you for making our baby's day so memorable!",
    },
    {
      id: 2,
      author: 'Pavani Pandu',
      occasion: "Son's 2nd Birthday Party",
      branch: 'Electronic City',
      rating: 5,
      date: '4 months ago',
      avatar: '/images/couple_8.webp',
      text: "We celebrated our son's 2nd birthday at Bash Movie yesterday, and it was an unforgettable experience! From the moment we arrived, everything was well organized and beautifully arranged. The decorations, lighting, and overall ambiance created a perfect setting for the celebration. The staff was extremely friendly, polite, and attentive. They took care of every little detail and made sure our event went smoothly without any stress. Our guests enjoyed the venue, and the kids had an amazing time. The service was excellent, and the entire team went above and beyond to make our special day memorable. Seeing the smiles on our son's face made it all the more special. Thank you to the entire Bash Movie team for making our little prince's 2nd birthday such a beautiful and cherished memory. We truly appreciate your effort and hospitality. We highly recommend this place for birthday parties and family celebrations, and we look forward to celebrating many more special occasions here! ❤️ 🎉 🎂",
    },
    {
      id: 3,
      author: 'Rajesh raju',
      occasion: 'Birthday Celebration & Party',
      branch: 'Electronic City',
      rating: 5,
      date: 'a month ago',
      avatar: '/images/celebration_3.webp',
      text: "Yesterday night we have celebrated birthday... 🎉 Really superb.. service's and I love your hospitality and prosperity.. 🤗 coming to the party hall and decor and snacks all such things are Really fabulous and our children had enjoyed and created thair own memories 🤩 🤩 You mad Hanish's day some more special 💖 ✨ He loved and got surprised 🥰 We were so happy about that 🫠 Thank you... Movie Bash for what you mad for us. 🤝",
    },
    {
      id: 4,
      author: 'Naveen Sudarshan',
      occasion: 'Birthday Party Experience',
      branch: 'Electronic City',
      rating: 5,
      date: 'a month ago',
      avatar: '/images/celebration_4.webp',
      text: "Had a really nice experience at Movie Bash, Bangalore! 😊 We celebrated a birthday here, and it was a lovely experience. The staff were very patient, friendly, and supportive throughout, and they made sure we felt comfortable. ❤️ The private theatre setup made the celebration feel extra special and gave us some wonderful memories. 🎂 🎬 It’s a great place to plan a birthday surprise or celebrate a special occasion with friends and family. Really appreciate the staff for their patience and support. Overall, we had a great time and would definitely recommend this place! ❤️ ✨",
    },
    {
      id: 5,
      author: "Nandu's Quest",
      occasion: 'Small Gathering & Ample Parking',
      branch: 'Electronic City',
      rating: 4,
      date: '3 months ago',
      avatar: '/images/couple_1.webp',
      text: 'This venue is good for small events, especially if food is not required. It has ample parking, which is a big advantage. They have two celebration rooms with nice decorations and screens, making them suitable for birthday parties and other small gatherings. However, it is not ideal for events that require food, as there is no dedicated dining area.',
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
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
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

                {/* Review Text: Compact ~60% size, high-aesthetic readable font */}
                <p className="font-playfair text-[10.5px] sm:text-[11.5px] font-medium italic text-stone-700 leading-relaxed max-h-[140px] overflow-y-auto pr-1">
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
