'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, Clock, Sparkles, Check, ArrowRight, Calendar, AlertCircle, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TheatresSlotsSection() {
  const router = useRouter();
  const [activeBranch, setActiveBranch] = useState<'electronic-city' | 'btm-stage-2'>('electronic-city');
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  const [availabilityMap, setAvailabilityMap] = useState<{ [key: number]: boolean }>({});
  const [loadingAvailability, setLoadingAvailability] = useState<boolean>(false);

  // Room Photos Modal Viewer
  const [viewingRoomPhotos, setViewingRoomPhotos] = useState<{
    name: string;
    category: string;
    photos: { src: string; title: string }[];
    currentIndex: number;
    theatreId: number;
    price: string;
  } | null>(null);

  const [activePackageTab, setActivePackageTab] = useState<{ [theatreId: number]: 'standard' | 'premium' | 'custom' }>({
    1: 'standard',
    2: 'standard',
    3: 'standard'
  });

  const roomPackagesInfo: { [key: number]: any } = {
    1: {
      standard: {
        name: 'Standard Package',
        price: '₹1,499',
        originalPrice: '₹1,890',
        badge: 'Most Popular',
        features: [
          '🎂 500g Cake Included',
          '🌫️ 1 Fog Entry (1 Pot)',
          '🔢 LED Number (Year/Age)',
          '🎈 Premium Decoration',
          '📽️ JBL 5.1 Dolby & Projector',
          '🪧 Name Board & 💡 HBD Neon'
        ]
      },
      premium: {
        name: 'Premium VIP',
        price: '₹2,800',
        originalPrice: '₹3,297',
        badge: 'VIP Grand',
        features: [
          '✨ Standard Package +',
          '🌫️ 2 Pots Fog Entry (Total 2)',
          '✨ Cold Pyro Sparkle Entry',
          '🌹 Rose Petals Heart & Candles',
          '🅰️ 1-Foot Personalized LED Name',
          '🫧 Bubbles Machine'
        ]
      },
      custom: {
        name: 'Custom (Room Only)',
        price: '₹899',
        badge: 'Build Your Own',
        features: [
          '🎬 2 Hours Private Screen Hall Only',
          '🎂 Add 500g Cake (₹499)',
          '🌫️ Fog Entry (1 Pot ₹399 / 2 Pots ₹750)',
          '✨ Cold Pyro (₹799) & 🌹 Decor (₹250)',
          '🅰️ LED Name (₹250) & 📸 Photography'
        ]
      }
    },
    2: {
      standard: {
        name: 'Standard Package',
        price: '₹2,200',
        originalPrice: '₹2,650',
        badge: 'Most Popular',
        features: [
          '🎂 500g Pastry Cake Included',
          '🌫️ Fog Entry – 1 Pot',
          '🔢 LED Number',
          '🎈 Premium Decoration',
          '📽️ JBL Pro Audio & 135" Screen',
          '🪧 Name Board & 💡 HBD Neon'
        ]
      },
      premium: {
        name: 'Premium VIP',
        price: '₹3,500',
        originalPrice: '₹4,200',
        badge: 'VIP Grand',
        features: [
          '✨ Standard Package +',
          '🌫️ 2 Pots Fog Entry (Total 2)',
          '✨ Cold Fire Pyro Sparkle 🎇',
          '🌹 Rose Table Decor with Candles',
          '🔤 1-Foot LED Name Letters',
          '🫧 Bubbles Machine'
        ]
      },
      custom: {
        name: 'Custom (Room Only)',
        price: '₹1,699',
        badge: 'Build Your Own',
        features: [
          '🎬 2 Hours Private Screen Hall Only',
          '🎂 Add Cake (₹499)',
          '🌫️ Fog Entry (1 Pot ₹399 / 2 Pots ₹750)',
          '✨ Cold Pyro (₹799) & 🌹 Decor (₹250)',
          '🔤 LED Name (₹250) & 📸 Photography'
        ]
      }
    },
    3: {
      standard: {
        name: 'Standard Package',
        price: '₹2,200',
        originalPrice: '₹2,650',
        badge: 'Most Popular',
        features: [
          '🎂 500g Pastry Cake Included',
          '🌫️ Fog Entry – 1 Pot',
          '🔢 LED Number (Age)',
          '🎈 Premium Decoration',
          '📽️ Dolby 7.1.2 & 150" Giant Screen',
          '🪧 Name Board & 💡 HBD Neon'
        ]
      },
      premium: {
        name: 'Premium VIP',
        price: '₹3,500',
        originalPrice: '₹4,200',
        badge: 'VIP Grand',
        features: [
          '✨ Standard Package +',
          '🌫️ 2 Pots Fog Entry (Total 2)',
          '✨ Cold Fire Pyro Sparkle 🎇',
          '🌹 Rose / HBD Table Decor & Candles',
          '🔤 1-Foot LED Name Letters',
          '🫧 Bubbles Machine'
        ]
      },
      custom: {
        name: 'Custom (Room Only)',
        price: '₹1,699',
        badge: 'Build Your Own',
        features: [
          '🎬 2 Hours Private Screen Hall Only',
          '🎂 Add Cake (₹499)',
          '🌫️ Fog Entry (1 Pot ₹399 / 2 Pots ₹750)',
          '✨ Cold Pyro (₹799) & 🌹 Decor (₹250)',
          '🔤 LED Name (₹250) & 📸 Photography'
        ]
      }
    }
  };

  // Fetch real-time availability whenever activeBranch or selectedDate changes
  useEffect(() => {
    async function loadAvailability() {
      setLoadingAvailability(true);
      try {
        const res = await fetch(`/api/availability?branch=${activeBranch}&date=${selectedDate}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const map: { [key: number]: boolean } = {};
          json.data.forEach((s: any) => {
            map[s.id] = s.is_booked;
          });
          setAvailabilityMap(map);
        }
      } catch (err) {
        console.error('Failed to load slots availability:', err);
      } finally {
        setLoadingAvailability(false);
      }
    }
    loadAvailability();
  }, [activeBranch, selectedDate]);

  const couplePhotos = [
    { src: '/images/couple_1.webp', title: 'Romantic Rose Petals & Fairy Lights Setup' },
    { src: '/images/couple_2.webp', title: 'Intimate Couple Screening Suite (4K Screen)' },
    { src: '/images/couple_3.webp', title: 'Candlelight Surprise Atmosphere & Flowers' },
    { src: '/images/couple_4.webp', title: 'Private Date Night Setup with Luxury Recliners' },
    { src: '/images/couple_5.webp', title: 'Couple Recliner Loungers & Ambient Glow' },
    { src: '/images/couple_6.webp', title: 'Romantic Heart & Rose Petal Walkway' },
    { src: '/images/couple_7.webp', title: 'Private Proposal Suite with Fairy Lights' },
    { src: '/images/couple_8.webp', title: 'Cozy Couple Screen Corner & Sound Setup' },
  ];

  const celebrationPhotos = [
    { src: '/images/celebration_1.webp', title: 'Grand Birthday Balloon Arch & 135" Screen' },
    { src: '/images/celebration_2.webp', title: 'Neon Milestone Backdrop & Cake Stage' },
    { src: '/images/celebration_3.webp', title: 'Party Ambient Glow Wall & Recliners' },
    { src: '/images/celebration_4.webp', title: 'Cake Cutting Celebration Stage with Lighting' },
    { src: '/images/celebration_5.webp', title: 'Celebration Lounge for 6-8 Friends' },
    { src: '/images/celebration_6.webp', title: 'LED Starry Ceiling & Acoustic Walls' },
    { src: '/images/celebration_7.webp', title: 'Celebration Truffle Cake & Party Decor' },
  ];

  const familyPhotos = [
    { src: '/images/ambience_2.webp', title: '150-inch Dolby Cinema Giant Screen' },
    { src: '/images/ambience_3.webp', title: 'Multi-tier Sofa Seating for 12-20 Guests' },
    { src: '/images/ambience_4.webp', title: 'Spacious Group Screening Hall View' },
    { src: '/images/ambience_5.webp', title: 'Wide Family Lounge Setup with 4K Projection' },
    { src: '/images/ambience_10.webp', title: 'Dolby Atmos Surround Audio Theatre Hall' },
    { src: '/images/ambience_11.webp', title: 'Family Lounge Party Stage with Balloons' },
    { src: '/images/ambience_1.webp', title: 'Grand Cinema Entrance & Red Carpet' },
  ];

  const theatresData = {
    'electronic-city': [
      {
        id: 1,
        name: 'Couple Room',
        category: 'Couple',
        emoji: '🎬',
        capacity: 'Up to 2 Guests',
        price: '₹1,499',
        tag: 'Standard ₹1,499 • Custom ₹899',
        image: '/images/couple_1.webp',
        galleryPhotos: couplePhotos,
        amenities: [
          'Ultra HD 4K Projection',
          'Private Recliner Sofas',
          'Dolby Atmos Surround Audio',
          'Intimate Ambient Lighting',
          'OTT Streaming Ready'
        ],
        slots: [
          { id: 1, time: '10:00 AM – 12:00 PM', midnight: false },
          { id: 2, time: '12:15 PM – 02:15 PM', midnight: false },
          { id: 3, time: '02:30 PM – 04:30 PM', midnight: false },
          { id: 4, time: '05:00 PM – 06:00 PM', midnight: false },
          { id: 5, time: '06:30 PM – 08:30 PM', midnight: false },
          { id: 6, time: '08:45 PM – 10:45 PM', midnight: false },
          { id: 7, time: '11:00 PM – 01:00 AM', midnight: true },
        ]
      },
      {
        id: 2,
        name: 'Celebration Room',
        category: 'Celebration',
        emoji: '🎉',
        capacity: 'Up to 6 Guests',
        price: '₹2,200',
        tag: 'Standard ₹2,200 • Custom ₹1,699',
        image: '/images/celebration_2.webp',
        galleryPhotos: celebrationPhotos,
        amenities: [
          '135-inch Giant Cinema Screen',
          'JBL High Fidelity Pro Audio',
          'Fairy Light Party Wall',
          'Fog & Cold Pyro Entry Space',
          'Cake Cutting Stage'
        ],
        slots: [
          { id: 8, time: '09:30 AM – 11:30 AM', midnight: false },
          { id: 9, time: '12:00 PM – 02:00 PM', midnight: false },
          { id: 10, time: '02:30 PM – 04:30 PM', midnight: false },
          { id: 11, time: '04:45 PM – 06:45 PM', midnight: false },
          { id: 12, time: '07:00 PM – 09:00 PM', midnight: false },
          { id: 13, time: '09:15 PM – 11:15 PM', midnight: false },
          { id: 14, time: '11:30 PM – 01:00 AM', midnight: true },
        ]
      },
      {
        id: 3,
        name: 'Family Room',
        category: 'Family',
        emoji: '👨‍👩‍👧‍👦',
        capacity: 'Up to 6 Guests',
        price: '₹2,200',
        tag: 'Standard ₹2,200 • Custom ₹1,699',
        image: '/images/ambience_2.webp',
        galleryPhotos: familyPhotos,
        amenities: [
          '150-inch Dolby Cinema Screen',
          'Multi-tier Luxury Lounge Seating',
          'Karaoke Wireless Microphones',
          'Outside Food Dining Area',
          'High Ceiling Grand Decor'
        ],
        slots: [
          { id: 15, time: '10:00 AM – 12:00 PM', midnight: false },
          { id: 16, time: '12:30 PM – 02:30 PM', midnight: false },
          { id: 17, time: '03:00 PM – 05:00 PM', midnight: false },
          { id: 18, time: '06:00 PM – 08:00 PM', midnight: false },
          { id: 19, time: '08:30 PM – 10:30 PM', midnight: false },
          { id: 20, time: '10:45 PM – 12:45 AM', midnight: true },
        ]
      }
    ],
    'btm-stage-2': [
      {
        id: 4,
        name: 'Couple Theater',
        category: 'Couple',
        emoji: '🎬',
        capacity: 'Up to 2 Guests',
        price: '₹899',
        tag: 'Cozy & Romantic',
        image: '/images/couple_2.webp',
        galleryPhotos: couplePhotos,
        amenities: [
          'Ultra HD 4K Projection',
          'Plush Recliner Loungers',
          'Dolby Sound System',
          'Fairy Lights Decor',
          'OTT Apps Ready'
        ],
        slots: [
          { id: 21, time: '10:00 AM – 12:00 PM', midnight: false },
          { id: 22, time: '12:15 PM – 02:15 PM', midnight: false },
          { id: 23, time: '02:30 PM – 04:30 PM', midnight: false },
          { id: 24, time: '05:00 PM – 06:00 PM', midnight: false },
          { id: 25, time: '06:30 PM – 08:30 PM', midnight: false },
          { id: 26, time: '08:45 PM – 10:45 PM', midnight: false },
          { id: 27, time: '11:00 PM – 01:00 AM', midnight: true },
        ]
      },
      {
        id: 5,
        name: 'Celebration Theater',
        category: 'Celebration',
        emoji: '🎉',
        capacity: 'Up to 6 Guests',
        price: '₹1,499',
        tag: 'Birthday & Party Favorite',
        image: '/images/celebration_3.webp',
        galleryPhotos: celebrationPhotos,
        amenities: [
          '135-inch Laser Projection',
          'JBL Pro Sound & Subwoofer',
          'Neon Milestone Lighting',
          'Fog Entry Special Effects',
          'Party Cake Stage'
        ],
        slots: [
          { id: 28, time: '09:30 AM – 11:30 AM', midnight: false },
          { id: 29, time: '12:00 PM – 02:00 PM', midnight: false },
          { id: 30, time: '02:30 PM – 04:30 PM', midnight: false },
          { id: 31, time: '04:45 PM – 06:45 PM', midnight: false },
          { id: 32, time: '07:00 PM – 09:00 PM', midnight: false },
          { id: 33, time: '09:15 PM – 11:15 PM', midnight: false },
          { id: 34, time: '11:30 PM – 01:00 AM', midnight: true },
        ]
      },
      {
        id: 6,
        name: 'Family Theater',
        category: 'Family',
        emoji: '👨‍👩‍👧‍👦',
        capacity: 'Up to 12-20 Guests',
        price: '₹1,699',
        tag: 'Large Family Gatherings',
        image: '/images/ambience_3.webp',
        galleryPhotos: familyPhotos,
        amenities: [
          '150-inch Curved Screen',
          'Spacious Recliners & Loungers',
          'Private Dining Tables',
          'Karaoke Mic & Sound',
          'Kids & Family Friendly'
        ],
        slots: [
          { id: 35, time: '10:00 AM – 12:00 PM', midnight: false },
          { id: 36, time: '12:30 PM – 02:30 PM', midnight: false },
          { id: 37, time: '03:00 PM – 05:00 PM', midnight: false },
          { id: 38, time: '06:00 PM – 08:00 PM', midnight: false },
          { id: 39, time: '08:30 PM – 10:30 PM', midnight: false },
          { id: 40, time: '10:45 PM – 12:45 AM', midnight: true },
        ]
      },
      {
        id: 7,
        name: 'VIP Celebration Suite',
        category: 'Celebration',
        emoji: '✨',
        capacity: 'Up to 8 Guests',
        price: '₹1,599',
        tag: 'Luxury VIP Party Hall',
        image: '/images/celebration_6.webp',
        galleryPhotos: celebrationPhotos,
        amenities: [
          '140-inch Laser 4K Cinema Screen',
          'Luxury Recliner Suite Seating',
          'Dolby Audio Pro Subwoofer',
          'Private Dining Table Space',
          'Fog & Cold Pyro Entry Space'
        ],
        slots: [
          { id: 41, time: '10:00 AM – 12:00 PM', midnight: false },
          { id: 42, time: '12:15 PM – 02:15 PM', midnight: false },
          { id: 43, time: '02:30 PM – 04:30 PM', midnight: false },
          { id: 44, time: '04:45 PM – 06:45 PM', midnight: false },
          { id: 45, time: '07:00 PM – 09:00 PM', midnight: false },
          { id: 46, time: '09:15 PM – 11:15 PM', midnight: false },
          { id: 47, time: '11:30 PM – 01:00 AM', midnight: true },
        ]
      }
    ]
  };

  const currentTheatres = theatresData[activeBranch];

  const handleSlotClick = (theatreId: number, slotId: number) => {
    const pkg = activePackageTab[theatreId] || 'standard';
    router.push(`/book-now?branch=${activeBranch}&theatre=${theatreId}&date=${selectedDate}&slot=${slotId}&package=${pkg}`);
  };

  return (
    <section className="py-10 sm:py-24 bg-sand-100/50 border-t border-sand-200" id="theatres-and-slots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-royal-700">
            Real-Time Screen Availability
          </span>
          <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 mt-2 tracking-tight">
            Theatres &amp; Time Slots
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            Booked slots update in real-time. Click any available slot to reserve your screening instantly.
          </p>

          {/* Branch Switcher Tabs */}
          <div className="mt-6 inline-flex p-1.5 rounded-full bg-sand-200 border border-sand-300 shadow-inner">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveBranch('electronic-city')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                activeBranch === 'electronic-city'
                  ? 'bg-royal-700 text-white shadow-royal-glow'
                  : 'text-royal-900 hover:text-royal-700'
              }`}
            >
              Electronic City Branch (3 Theatres)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setActiveBranch('btm-stage-2')}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeBranch === 'btm-stage-2'
                  ? 'bg-royal-700 text-white shadow-royal-glow'
                  : 'text-royal-900 hover:text-royal-700'
              }`}
            >
              <span>BTM 2nd Stage Branch (4 Theatres)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-royal-900 font-black">NEW</span>
            </button>
          </div>

          {/* BookMyShow Style 7-Day Date Ribbon */}
          <div className="mt-6 flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-2 no-scrollbar px-1">
            {Array.from({ length: 7 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() + i);
              const dateStr = d.toISOString().split('T')[0];
              const dayName = i === 0 ? 'TODAY' : i === 1 ? 'TOM' : d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
              const dayNum = d.toLocaleDateString('en-US', { day: '2-digit' });
              const monthName = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setSelectedDate(dateStr)}
                  className={`px-3 py-2 rounded-2xl flex flex-col items-center min-w-[62px] border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-royal-900 border-royal-900 text-white shadow-md scale-105'
                      : 'bg-white border-sand-300 text-slate-800 hover:border-royal-500'
                  }`}
                >
                  <span className="text-[10px] font-black tracking-wider opacity-80">{dayName}</span>
                  <span className="text-base font-black leading-none my-0.5">{dayNum}</span>
                  <span className="text-[9px] font-bold tracking-tight opacity-75">{monthName}</span>
                </button>
              );
            })}
            <div className="flex items-center pl-1">
              <input
                type="date"
                min={todayStr}
                suppressHydrationWarning
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-2 rounded-2xl text-xs font-bold bg-white border-2 border-sand-300 text-royal-900 cursor-pointer focus:outline-none focus:border-royal-700 h-[58px]"
                title="Choose custom date"
              />
            </div>
          </div>
        </div>

        {/* Theatres Grid (Responsive 3 or 4 columns) */}
        <div className={`grid grid-cols-1 ${currentTheatres.length === 4 ? 'lg:grid-cols-4 sm:grid-cols-2' : 'lg:grid-cols-3'} gap-4 sm:gap-6`}>
          {currentTheatres.map((theatre) => {
            // Count available vs booked for this theatre
            const bookedCount = theatre.slots.filter(s => availabilityMap[s.id]).length;
            const availableCount = theatre.slots.length - bookedCount;

            return (
              <React.Fragment key={theatre.id}>
                {/* 1. MOBILE COMPACT BOOKMYSHOW-STYLE CARD (sm:hidden) */}
                <div className="sm:hidden p-4 rounded-2xl bg-white border-2 border-sand-300 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 border-b border-sand-100 pb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div 
                        className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-sand-200 cursor-pointer"
                        onClick={() => setViewingRoomPhotos({
                          name: theatre.name,
                          category: theatre.category,
                          photos: theatre.galleryPhotos,
                          currentIndex: 0,
                          theatreId: theatre.id,
                          price: theatre.price,
                        })}
                      >
                        <Image src={theatre.image} alt={theatre.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-royal-950 flex items-center gap-1 truncate">
                          <span>{theatre.emoji}</span>
                          <span>{theatre.name}</span>
                        </h4>
                        <span className="text-[11px] text-slate-600 block">
                          {theatre.capacity} &bull; 4K Laser Cinema
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-royal-800 block">{theatre.price}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {availableCount} open
                      </span>
                    </div>
                  </div>

                  {/* Two-Column Grid for Instant Glance on Mobile (No Horizontal Scrolling) */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        Showtime Slots ({selectedDate}):
                      </span>
                      <span className="text-[10px] font-extrabold text-emerald-700">
                        {availableCount} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {theatre.slots.map((s) => {
                        const isBooked = availabilityMap[s.id];
                        if (isBooked) {
                          return (
                            <div
                              key={s.id}
                              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-center opacity-50 select-none flex flex-col justify-center items-center"
                            >
                              <span className="block text-[11px] font-bold text-slate-500 line-through leading-tight">
                                {s.time}
                              </span>
                              <span className="text-[9px] font-extrabold text-rose-600 block mt-0.5">Sold Out</span>
                            </div>
                          );
                        }
                        return (
                          <button
                            key={s.id}
                            type="button"
                            suppressHydrationWarning
                            onClick={() => handleSlotClick(theatre.id, s.id)}
                            className="p-2 rounded-xl bg-emerald-50/80 hover:bg-royal-800 border-2 border-emerald-500 hover:border-royal-800 text-slate-900 hover:text-white transition-all text-center active:scale-95 shadow-xs group/btn cursor-pointer flex flex-col justify-center items-center"
                          >
                            <span className="block text-xs font-black group-hover/btn:text-white leading-tight">
                              {s.time}
                            </span>
                            <span className="text-[10px] font-extrabold text-emerald-800 group-hover/btn:text-amber-300 block mt-0.5">
                              Available &bull; {theatre.price}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quick links footer */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-sand-100">
                    <button
                      type="button"
                      onClick={() => setViewingRoomPhotos({
                        name: theatre.name,
                        category: theatre.category,
                        photos: theatre.galleryPhotos,
                        currentIndex: 0,
                        theatreId: theatre.id,
                        price: theatre.price,
                      })}
                      className="text-royal-700 font-bold hover:underline flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3 text-royal-700" />
                      <span>View {theatre.galleryPhotos.length} Room Photos</span>
                    </button>
                    <Link
                      href={`/book-now?branch=${activeBranch}&theatre=${theatre.id}&date=${selectedDate}`}
                      className="text-emerald-700 font-black hover:underline"
                    >
                      Book Screen &rarr;
                    </Link>
                  </div>
                </div>

                {/* 2. DESKTOP / TABLET FULL LUXURY CARD (hidden sm:flex) */}
                <div
                  className="hidden sm:flex rounded-2xl sm:rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-elevated transition-all flex-col justify-between overflow-hidden group"
                >
                {/* Card Image with Direct Room Photos Click */}
                <div 
                  className="relative h-44 sm:h-56 w-full overflow-hidden cursor-pointer"
                  onClick={() => setViewingRoomPhotos({
                    name: theatre.name,
                    category: theatre.category,
                    photos: theatre.galleryPhotos,
                    currentIndex: 0,
                    theatreId: theatre.id,
                    price: theatre.price,
                  })}
                >
                  <Image
                    src={theatre.image}
                    alt={theatre.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-md text-[10px] sm:text-[11px] font-bold text-royal-900 shadow-sm flex items-center gap-1.5">
                      <span>{theatre.emoji}</span>
                      <span>{theatre.tag}</span>
                    </span>

                    {/* Quick View Photos Button */}
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingRoomPhotos({
                          name: theatre.name,
                          category: theatre.category,
                          photos: theatre.galleryPhotos,
                          currentIndex: 0,
                          theatreId: theatre.id,
                          price: theatre.price,
                        });
                      }}
                      className="px-2.5 py-1 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-white/20 transition-all flex items-center gap-1 shadow-md hover:scale-105 active:scale-95"
                    >
                      <Camera className="w-3 h-3 text-amber-400" />
                      <span>{theatre.galleryPhotos.length} Photos</span>
                    </button>
                  </div>

                  <div className="absolute bottom-2.5 left-3 right-3 sm:bottom-3 sm:left-4 sm:right-4 text-white flex items-end justify-between">
                    <div>
                      <h3 className="font-playfair text-lg sm:text-xl font-bold">{theatre.name}</h3>
                      <span className="text-[11px] sm:text-xs text-white/90 flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>{theatre.capacity}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-white/80 block">Starts at</span>
                      <span className="font-playfair text-xl sm:text-2xl font-black text-amber-300">{theatre.price}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3.5 sm:p-6 flex-1 flex flex-col justify-between space-y-3.5 sm:space-y-5">
                  
                  {/* Photo Preview Strip & Link */}
                  <div className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-sand-100 border border-sand-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Camera className="w-3.5 h-3.5 text-royal-700" />
                      <span>{theatre.name} Photos</span>
                    </div>
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => setViewingRoomPhotos({
                        name: theatre.name,
                        category: theatre.category,
                        photos: theatre.galleryPhotos,
                        currentIndex: 0,
                        theatreId: theatre.id,
                        price: theatre.price,
                      })}
                      className="text-xs font-black text-royal-700 hover:text-royal-900 underline"
                    >
                      Browse {theatre.galleryPhotos.length} Pictures &rarr;
                    </button>
                  </div>

                  {/* Package Selector & Included Amenities (Electronic City) */}
                  {roomPackagesInfo[theatre.id] ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] sm:text-xs font-black uppercase tracking-wider text-royal-900">
                          Package Options &amp; Inclusions
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">Click to preview</span>
                      </div>

                      {/* Package Pills */}
                      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-center">
                        {(['standard', 'premium', 'custom'] as const).map((pkgKey) => {
                          const isSelected = (activePackageTab[theatre.id] || 'standard') === pkgKey;
                          const pkg = roomPackagesInfo[theatre.id][pkgKey];
                          return (
                            <button
                              key={pkgKey}
                              type="button"
                              onClick={() => setActivePackageTab(prev => ({ ...prev, [theatre.id]: pkgKey }))}
                              className={`py-1.5 px-1 rounded-lg text-[10px] sm:text-[11px] font-black transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-royal-900 text-amber-300 shadow-xs'
                                  : 'text-slate-700 hover:text-royal-900 hover:bg-white/60'
                              }`}
                            >
                              <div className="leading-tight capitalize">{pkgKey}</div>
                              <div className={`text-[10px] font-extrabold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{pkg.price}</div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Selected Package Details Box */}
                      {(() => {
                        const currentPkgKey = activePackageTab[theatre.id] || 'standard';
                        const currentPkg = roomPackagesInfo[theatre.id][currentPkgKey];
                        return (
                          <div className="p-3 rounded-xl bg-royal-50/80 border border-royal-200 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-royal-950 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span>{currentPkg.name}</span>
                              </span>
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-xs font-black text-royal-900">{currentPkg.price}</span>
                                {currentPkg.originalPrice && (
                                  <span className="text-[10px] text-slate-400 line-through">{currentPkg.originalPrice}</span>
                                )}
                              </div>
                            </div>
                            <ul className="space-y-1">
                              {currentPkg.features.map((feat: string, fIdx: number) => (
                                <li key={fIdx} className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5 leading-snug">
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div>
                      <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-wider text-royal-700 mb-1.5 sm:mb-2">
                        Included Highlights
                      </span>
                      <ul className="space-y-1 sm:space-y-1.5">
                        {theatre.amenities.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-700">
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-royal-600 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Real-time Slots Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-royal-700" />
                        <span>Showtime Slots ({selectedDate})</span>
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {availableCount} Available
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {theatre.slots.map((s) => {
                        const isBooked = availabilityMap[s.id];

                        if (isBooked) {
                          return (
                            <div
                              key={s.id}
                              className="p-2 sm:p-2.5 rounded-xl border border-dashed border-rose-200 bg-rose-50 text-rose-700 text-center select-none opacity-60"
                            >
                              <span className="block text-[10px] sm:text-xs font-bold line-through">
                                {s.time}
                              </span>
                              <span className="text-[9px] font-semibold text-rose-600 block mt-0.5">
                                Sold Out
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={s.id}
                            type="button"
                            suppressHydrationWarning
                            onClick={() => handleSlotClick(theatre.id, s.id)}
                            className="p-2 sm:p-2.5 rounded-xl border border-sand-300 bg-sand-50 hover:bg-royal-700 hover:border-royal-700 text-slate-900 hover:text-white transition-all text-center group/btn active:scale-95 shadow-sm"
                          >
                            <span className="block text-[10px] sm:text-xs font-bold leading-tight">
                              {s.time}
                            </span>
                            <span className="text-[9px] font-semibold text-emerald-700 group-hover/btn:text-amber-300 block mt-0.5">
                              Available &bull; Book &rarr;
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bottom Book CTA */}
                  <div className="pt-2">
                    <button
                      type="button"
                      suppressHydrationWarning
                      onClick={() => router.push(`/book-now?branch=${activeBranch}&theatre=${theatre.id}&date=${selectedDate}`)}
                      className="w-full py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all flex items-center justify-center gap-1.5"
                    >
                      <span>Choose Slot for {theatre.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </div>
            </React.Fragment>
          );
        })}
        </div>

        {/* View Full Gallery Link Banner */}
        <div className="mt-12 text-center p-6 rounded-3xl bg-sand-200/70 border border-sand-300 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="text-left space-y-1">
            <h4 className="font-playfair text-lg font-bold text-slate-900">Want to see all Couple, Celebration &amp; Family Room photos?</h4>
            <p className="text-xs text-slate-600">Browse real unedited photographs, fairy lights setups, and birthday balloon arches.</p>
          </div>
          <Link
            href="/gallery"
            className="px-6 py-3 rounded-full text-xs sm:text-sm font-black text-slate-950 bg-amber-400 hover:bg-amber-300 shadow-md transition-all whitespace-nowrap"
          >
            Open Full Gallery (26 Photos) &rarr;
          </Link>
        </div>

      </div>

      {/* POPUP ROOM PHOTOS MODAL */}
      {viewingRoomPhotos && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-3 sm:p-6 backdrop-blur-md animate-in fade-in"
          onClick={() => setViewingRoomPhotos(null)}
        >
          {/* Close button */}
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => setViewingRoomPhotos(null)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            aria-label="Close Photos"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <div
            className="relative max-w-4xl w-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Room Header */}
            <div className="w-full flex items-center justify-between text-white pb-3 px-2">
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-amber-400 block">
                  {viewingRoomPhotos.category} Room Photos
                </span>
                <h3 className="font-playfair text-lg sm:text-2xl font-bold">
                  {viewingRoomPhotos.name} &bull; Photo {viewingRoomPhotos.currentIndex + 1} of {viewingRoomPhotos.photos.length}
                </h3>
              </div>
              <Link
                href={`/gallery?category=${viewingRoomPhotos.category}`}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white underline"
              >
                <span>Filter in Main Gallery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Main Active Image View with Prev/Next buttons */}
            <div className="relative w-full h-[55vh] sm:h-[65vh] rounded-2xl overflow-hidden bg-black/80 shadow-2xl border border-white/10">
              <Image
                src={viewingRoomPhotos.photos[viewingRoomPhotos.currentIndex].src}
                alt={viewingRoomPhotos.photos[viewingRoomPhotos.currentIndex].title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 900px"
                priority
              />

              {/* Prev Button */}
              {viewingRoomPhotos.currentIndex > 0 && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setViewingRoomPhotos(prev => prev ? ({ ...prev, currentIndex: prev.currentIndex - 1 }) : null)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all"
                  aria-label="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Next Button */}
              {viewingRoomPhotos.currentIndex < viewingRoomPhotos.photos.length - 1 && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setViewingRoomPhotos(prev => prev ? ({ ...prev, currentIndex: prev.currentIndex + 1 }) : null)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all"
                  aria-label="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Bottom Photo Caption */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 text-center">
                <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md">
                  {viewingRoomPhotos.photos[viewingRoomPhotos.currentIndex].title}
                </p>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="w-full flex items-center justify-center gap-2 pt-3 overflow-x-auto no-scrollbar py-2">
              {viewingRoomPhotos.photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setViewingRoomPhotos(prev => prev ? ({ ...prev, currentIndex: idx }) : null)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all block ${
                    viewingRoomPhotos.currentIndex === idx
                      ? 'border-amber-400 scale-105 shadow-md'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={p.src} alt={p.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/book-now?branch=${activeBranch}&theatre=${viewingRoomPhotos.theatreId}`}
                className="px-6 py-2.5 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all flex items-center gap-1.5"
              >
                <span>Book This {viewingRoomPhotos.name} ({viewingRoomPhotos.price})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                suppressHydrationWarning
                onClick={() => setViewingRoomPhotos(null)}
                className="px-5 py-2.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
              >
                Close Photos
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
