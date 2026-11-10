'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Phone, CalendarDays, ExternalLink, Sparkles } from 'lucide-react';

export default function VenuesSection() {
  const venues = [
    {
      id: 1,
      slug: 'electronic-city',
      name: 'Movie Bash – Electronic City',
      tagline: 'Flagship Destination',
      address: 'MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100',
      phone: '+91 99029 23656',
      screensCount: '3 Private Theatres (1 Screen Each)',
      screens: ['Couple Room (Up to 2 Guests)', 'Celebration Room (Up to 6 Guests)', 'Family Room (Up to 6 Guests)'],
      startingPrice: '₹899',
      image: '/images/ambience_1.webp',
      mapUrl: 'https://maps.google.com/?q=Movie+Bash+Electronic+City',
      isNew: false,
    },
    {
      id: 2,
      slug: 'btm-stage-2',
      name: 'Movie Bash – BTM 2nd Stage',
      tagline: 'Newly Launched',
      address: 'MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076',
      phone: '+91 99029 23656',
      screensCount: '4 Private Theatres (1 Screen Each)',
      screens: ['Couple Theater (1 Screen • 2 Guests)', 'Celebration Theater (1 Screen • 6 Guests)', 'VIP Celebration Suite (1 Screen • 8 Guests)', 'Family Theater (1 Screen • 12-20 Guests)'],
      startingPrice: '₹899',
      image: '/images/ambience_8.webp',
      mapUrl: 'https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru',
      isNew: true,
    },
  ];

  return (
    <section id="venues" className="py-10 sm:py-24 bg-sand-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-700">
            Convenient Locations
          </span>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 mt-2 tracking-tight">
            Our Private Theatres Across Bengaluru
          </h2>
          <p className="mt-4 text-base text-ink/75">
            Two prime venues equipped with high-definition screens, luxury recliners, and private party spaces.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-12">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="rounded-2xl sm:rounded-3xl bg-white border border-sand-200 overflow-hidden shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
            >
              {/* Image banner with upright framing */}
              <div className="relative h-48 sm:h-72 w-full overflow-hidden bg-slate-900">
                <Image
                  src={venue.image}
                  alt={venue.name}
                  fill
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 1024px) 100vw, 600px"
                  priority={venue.id === 1}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                    venue.isNew ? 'bg-amber-400 text-royal-900' : 'bg-royal-700 text-white'
                  }`}>
                    {venue.tagline}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 text-white">
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold leading-tight">
                    {venue.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 sm:mt-1 flex items-center gap-1.5 sm:gap-2">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300" />
                    <span>{venue.screensCount} &bull; Starting from {venue.startingPrice}</span>
                  </p>
                </div>
              </div>

              {/* Details Content */}
              <div className="p-4 sm:p-8 flex-1 flex flex-col justify-between space-y-4 sm:space-y-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-royal-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-royal-900">Address</span>
                      <p className="text-xs sm:text-sm text-ink/75 leading-relaxed">{venue.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-royal-700 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-royal-900">{venue.phone}</span>
                    <a
                      href={venue.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-royal-600 hover:text-royal-900 underline"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </a>
                  </div>

                  {/* Screens Chips */}
                  <div className="pt-2">
                    <span className="block text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">Available Screens</span>
                    <div className="flex flex-wrap gap-2">
                      {venue.screens.map((s, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-sand-100 text-royal-900 text-xs font-medium border border-sand-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions - High Contrast */}
                <div className="pt-4 border-t border-sand-200 flex flex-col sm:flex-row items-center gap-3">
                  <Link
                    href={`/venues/${venue.slug}`}
                    className="w-full sm:flex-1 text-center py-3 rounded-full text-xs sm:text-sm font-extrabold text-royal-900 bg-white hover:bg-royal-50 border-2 border-royal-700 transition-colors shadow-sm"
                  >
                    View Theatres &amp; Slots
                  </Link>
                  <Link
                    href={`/book-now?branch=${venue.slug}`}
                    className="w-full sm:flex-1 text-center py-3 rounded-full text-xs sm:text-sm font-extrabold text-white bg-royal-700 hover:bg-royal-800 shadow-royal-glow transition-all"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
