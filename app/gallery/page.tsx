'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import { Sparkles, X, CalendarDays, Heart, PartyPopper, Users, Sparkle, Cake, MapPin } from 'lucide-react';

function GalleryContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; title: string; category: string; branch?: string } | null>(null);

  useEffect(() => {
    if (categoryParam) {
      const match = ['BTM', 'Couple', 'Celebration', 'Family', 'Decor', 'Effects'].find(
        c => c.toLowerCase() === categoryParam.toLowerCase()
      );
      if (match) setActiveCategory(match);
    }
  }, [categoryParam]);

  const galleryItems = [
    // 🌟 Newly Added BTM 2nd Stage Theatres (Shown Prominently First)
    { id: 101, category: 'BTM', tags: ['BTM', 'Couple', 'Celebration'], branch: 'BTM 2nd Stage', title: 'Butterfly Blush – Signature Blush Glow & 4K Cinema', src: '/images/rooms/btm-butterfly-blush.webp' },
    { id: 102, category: 'BTM', tags: ['BTM', 'Celebration'], branch: 'BTM 2nd Stage', title: 'Lavender Mist – Aesthetic Hues & 135" Cinema Screen', src: '/images/rooms/btm-lavender-mist.webp' },
    { id: 103, category: 'BTM', tags: ['BTM', 'Couple', 'Celebration'], branch: 'BTM 2nd Stage', title: 'Scarlet Red – Romantic Rose Walkway & 150" Display', src: '/images/rooms/btm-scarlet-red.webp' },
    { id: 104, category: 'BTM', tags: ['BTM', 'Celebration'], branch: 'BTM 2nd Stage', title: 'Scarlet Red – Party Stage & Recliner Loungers', src: '/images/rooms/btm-scarlet-red-alt.webp' },
    { id: 105, category: 'BTM', tags: ['BTM', 'Celebration'], branch: 'BTM 2nd Stage', title: 'Shadow Suit – Stealth Laser Screening Lounge', src: '/images/rooms/btm-shadow-suit.webp' },

    // Couple Suite Photos
    { id: 1, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Romantic Rose Petals & Fairy Lights Setup', src: '/images/couple_1.webp' },
    { id: 2, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Intimate Couple Screening Suite (4K Screen)', src: '/images/couple_2.webp' },
    { id: 3, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Candlelight Surprise Atmosphere & Flowers', src: '/images/couple_3.webp' },
    { id: 4, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Private Date Night Setup with Luxury Recliners', src: '/images/couple_4.webp' },
    { id: 5, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Couple Recliner Loungers & Ambient Glow', src: '/images/couple_5.webp' },
    { id: 6, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Romantic Heart & Rose Petal Walkway', src: '/images/couple_6.webp' },
    { id: 7, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Private Proposal Suite with Fairy Lights', src: '/images/couple_7.webp' },
    { id: 8, category: 'Couple', tags: ['Couple'], branch: 'Electronic City', title: 'Cozy Couple Screen Corner & Sound Setup', src: '/images/couple_8.webp' },

    // Celebration Room Photos
    { id: 9, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Grand Birthday Balloon Arch & 135" Screen', src: '/images/celebration_1.webp' },
    { id: 10, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Neon Milestone Backdrop & Cake Stage', src: '/images/celebration_2.webp' },
    { id: 11, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Party Ambient Glow Wall & Recliners', src: '/images/celebration_3.webp' },
    { id: 12, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Cake Cutting Celebration Stage with Lighting', src: '/images/celebration_4.webp' },
    { id: 13, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Celebration Lounge for 6-8 Friends', src: '/images/celebration_5.webp' },
    { id: 14, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'LED Starry Ceiling & Acoustic Walls', src: '/images/celebration_6.webp' },
    { id: 15, category: 'Celebration', tags: ['Celebration'], branch: 'Electronic City', title: 'Celebration Truffle Cake & Party Decor', src: '/images/celebration_7.webp' },

    // Family Cinema Photos
    { id: 16, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: '150-inch Dolby Cinema Giant Screen', src: '/images/celebration_2.webp' },
    { id: 17, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Multi-tier Plush Cinema Hall Seating', src: '/images/celebration_4.webp' },
    { id: 18, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Spacious Group Screening Hall View', src: '/images/celebration_6.webp' },
    { id: 19, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Wide Family Lounge Setup with 4K Projection', src: '/images/ambience_5.webp' },
    { id: 20, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Grand Entrance Doorway & Balloon Arch', src: '/images/ambience_1.webp' },
    { id: 21, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Dolby Atmos Surround Audio Theatre Hall', src: '/images/ambience_10.webp' },
    { id: 22, category: 'Family', tags: ['Family'], branch: 'Electronic City', title: 'Family Lounge Party Stage with Balloons', src: '/images/ambience_11.webp' },

    // Special Effects & Decor
    { id: 23, category: 'Effects', tags: ['Effects'], branch: 'Electronic City', title: 'Magical Cloud Fog Walkway Entry', src: '/images/ambience_6.webp' },
    { id: 24, category: 'Effects', tags: ['Effects'], branch: 'Electronic City', title: 'Cold Fire Pyro Sparkler Show', src: '/images/ambience_7.webp' },
    { id: 25, category: 'Decor', tags: ['Decor'], branch: 'Electronic City', title: 'Illuminated Love Neon Lights & Backdrops', src: '/images/ambience_8.webp' },
    { id: 26, category: 'Decor', tags: ['Decor'], branch: 'Electronic City', title: 'Metallic Balloons & Celebration Cascades', src: '/images/ambience_9.webp' },
  ];

  const categories = [
    { label: 'All Photos', value: 'All', icon: Sparkles },
    { label: 'BTM 2nd Stage (New)', value: 'BTM', icon: Sparkles },
    { label: 'Couple Room', value: 'Couple', icon: Heart },
    { label: 'Celebration Room', value: 'Celebration', icon: PartyPopper },
    { label: 'Family Cinema', value: 'Family', icon: Users },
    { label: 'Special Decor', value: 'Decor', icon: Cake },
    { label: 'Fog & Pyro Effects', value: 'Effects', icon: Sparkle },
  ];

  const filteredItems = activeCategory === 'All'
    ? galleryItems
    : galleryItems.filter(item => 
        item.category === activeCategory || 
        (item.tags && item.tags.includes(activeCategory)) ||
        (activeCategory === 'BTM' && item.branch === 'BTM 2nd Stage')
      );

  return (
    <>
      {/* Header */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#F6FAFD] via-cream to-cream text-ink text-center relative overflow-hidden border-b border-sky-100">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f39a4b]" />
            <span>Captured Celebrations</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight text-ink">
            Celebration &amp; Room Gallery
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Real, unedited photos of our Couple Suites, Celebration Theatres, and Family Cinemas in Bengaluru.
          </p>

          {/* Category Filter Pills */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.value;
              return (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00A2E4] text-white font-black shadow-md scale-105 ring-2 ring-sky-300'
                      : 'bg-white text-ink hover:text-[#00A2E4] hover:bg-sky-50 border border-sky-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#00A2E4]'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 sm:py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-6 flex items-center justify-between">
            <div className="text-xs sm:text-sm font-bold text-slate-700">
              Showing <span className="text-[#00A2E4] font-black">{filteredItems.length} photos</span> in {activeCategory === 'All' ? 'All Galleries' : `${activeCategory} Category`}
            </div>
            {activeCategory !== 'All' && (
              <button
                onClick={() => setActiveCategory('All')}
                className="text-xs font-bold text-[#00A2E4] hover:underline cursor-pointer"
              >
                Show All Photos &rarr;
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxImage(item)}
                className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/5] bg-sky-50 shadow-soft cursor-pointer hover:shadow-[0_16px_50px_rgba(22,48,79,0.12)] transition-all hover:-translate-y-1 border border-sky-100"
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                
                <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                  {item.branch && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider backdrop-blur-md border ${
                      item.branch === 'BTM 2nd Stage'
                        ? 'bg-[#00A2E4]/90 text-white border-amber-300/40 shadow-xs'
                        : 'bg-black/60 text-slate-200 border-white/20'
                    }`}>
                      {item.branch}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-bold text-amber-300 border border-white/20">
                    {item.category === 'BTM' ? 'Private Suite' : `${item.category} Room`}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h4 className="text-xs sm:text-sm font-bold leading-snug drop-shadow-md">{item.title}</h4>
                  <span className="text-[10px] text-amber-300 font-semibold mt-1 block">Tap to expand &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/book-now"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-sm font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all hover:scale-105"
            >
              <CalendarDays className="w-4 h-4 text-amber-300" />
              <span>Book Your Screen for These Setups</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-[70vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={lightboxImage.src}
                alt={lightboxImage.title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="mt-4 text-center text-white space-y-1">
              <div className="flex items-center justify-center gap-2">
                {lightboxImage.branch && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#00A2E4] text-white">
                    {lightboxImage.branch}
                  </span>
                )}
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {lightboxImage.category} Room Photo
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold">{lightboxImage.title}</p>
              <div className="pt-2">
                <Link
                  href={lightboxImage.branch === 'BTM 2nd Stage' ? '/book-now/btm-stage-2' : '/book-now'}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-all"
                >
                  <span>Book This Room Now &rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function GalleryPage() {
  return (
    <main className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />
      <Suspense fallback={<div className="p-12 text-center text-sm font-bold text-royal-900">Loading Celebration Gallery...</div>}>
        <GalleryContent />
      </Suspense>
      <Footer />
      <FloatingContact />
    </main>
  );
}
