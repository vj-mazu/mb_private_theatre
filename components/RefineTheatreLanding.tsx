'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpeningWebsiteIntro from '@/components/OpeningWebsiteIntro';
import { GrandOccasionIcon, GrandAddonIcon } from '@/components/GrandIcons';
import { getTodayIST, getDaysAgoIST } from '@/lib/time';

const WHATSAPP_BASE = 'https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20would%20like%20to%20book%20a%20private%20theatre.';

type IconName =
  | 'arrow'
  | 'calendar'
  | 'cake'
  | 'camera'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'heart'
  | 'location'
  | 'menu'
  | 'music'
  | 'phone'
  | 'play'
  | 'sparkles'
  | 'star'
  | 'users'
  | 'whatsapp'
  | 'x';

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    calendar: <><path d="M6 2v4M18 2v4M3 9h18" /><rect x="3" y="4" width="18" height="17" rx="2" /></>,
    cake: <><path d="M4 14h16v7H4zM7 10h10a3 3 0 0 1 3 3v1H4v-1a3 3 0 0 1 3-3Z" /><path d="M12 2c2 2 2 4 0 5-2-1-2-3 0-5ZM12 7v3" /></>,
    camera: <><path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3Z" /><circle cx="12" cy="13" r="3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    music: <><path d="M9 18V5l10-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="16" r="3" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L9.1 10.8a16 16 0 0 0 4.1 4.1l1.2-1.2a2 2 0 0 1 2.1-.5 13 13 0 0 0 2.8.7 2 2 0 0 1 1.7 2Z" />,
    play: <path d="m9 7 8 5-8 5Z" />,
    sparkles: <><path d="m12 3 1.4 3.6L17 8l-3.6 1.4L12 13l-1.4-3.6L7 8l3.6-1.4Z" /><path d="m19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8ZM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8Z" /></>,
    star: <path d="m12 2 3 6 6.5 1-4.7 4.6 1.1 6.4-5.9-3-5.9 3 1.1-6.4L2.5 9 9 8Z" />,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    whatsapp: <><path d="M21 11.5a8.4 8.4 0 0 1-9 8.5 9 9 0 0 1-3.8-.9L3 21l1.7-5a8.5 8.5 0 1 1 16.3-4.5Z" /><path d="M8.5 8.2c.5 3 2.3 5 5.3 6.2l1.5-1.5" /></>,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

const occasionsList = [
  {
    slug: 'birthday-party',
    title: 'Birthday Party',
    tagline: 'Golden HBD arch, balloon aisle & a personalised cake table',
    badge: 'Birthday Favourite',
    type: 'birthday-party',
    image: '/images/celebration_6.webp',
    borderColor: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200/90 border border-amber-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.22)]',
    badgeColor: 'bg-amber-100/90 text-amber-800 border-amber-200',
    arrowColor: 'text-amber-600',
  },
  {
    slug: 'date-and-proposal',
    title: 'Romantic Proposal',
    tagline: 'Red heart backdrop, balloon aisle, rose petals & cold sparklers',
    badge: 'Dream Setup',
    type: 'date-and-proposal',
    image: '/images/couple_1.webp',
    borderColor: 'border-rose-300 hover:border-rose-500',
    bgGradient: 'bg-gradient-to-br from-rose-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-rose-100 to-rose-200/90 border border-rose-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(244,63,94,0.08)] hover:shadow-[0_12px_32px_rgba(244,63,94,0.22)]',
    badgeColor: 'bg-rose-100/90 text-rose-800 border-rose-200',
    arrowColor: 'text-rose-600',
  },
  {
    slug: 'anniversary',
    title: 'Anniversary Celebration',
    tagline: 'Happy Anniversary neon heart with fairy lights & fresh roses',
    badge: 'Romantic Pick',
    type: 'anniversary',
    image: '/images/couple_6.webp',
    borderColor: 'border-pink-300 hover:border-pink-500',
    bgGradient: 'bg-gradient-to-br from-pink-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-pink-100 to-pink-200/90 border border-pink-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(236,72,153,0.08)] hover:shadow-[0_12px_32px_rgba(236,72,153,0.22)]',
    badgeColor: 'bg-pink-100/90 text-pink-800 border-pink-200',
    arrowColor: 'text-pink-600',
  },
  {
    slug: 'couple-date',
    title: 'Couple Date Night',
    tagline: 'Private recliner lounge under a red heart canopy, your movie on screen',
    badge: 'Cozy Retreat',
    type: 'couple-date',
    image: '/images/couple_2.webp',
    borderColor: 'border-indigo-300 hover:border-indigo-500',
    bgGradient: 'bg-gradient-to-br from-indigo-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-indigo-100 to-indigo-200/90 border border-indigo-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(99,102,241,0.08)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.22)]',
    badgeColor: 'bg-indigo-100/90 text-indigo-800 border-indigo-200',
    arrowColor: 'text-indigo-600',
  },
  {
    slug: 'bachelorette-party',
    title: 'Bride-to-be / Bachelorette',
    tagline: 'Balloon-covered floor, tiara, sash & a private party lounge',
    badge: 'Girls Night',
    type: 'bachelorette-party',
    image: '/images/celebration_5.webp',
    borderColor: 'border-fuchsia-300 hover:border-fuchsia-500',
    bgGradient: 'bg-gradient-to-br from-fuchsia-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-fuchsia-100 to-fuchsia-200/90 border border-fuchsia-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(217,70,239,0.08)] hover:shadow-[0_12px_32px_rgba(217,70,239,0.22)]',
    badgeColor: 'bg-fuchsia-100/90 text-fuchsia-800 border-fuchsia-200',
    arrowColor: 'text-fuchsia-600',
  },
  {
    slug: 'kids-birthday',
    title: 'Kids Birthday Party',
    tagline: 'Golden peacock arch, balloon aisle & a family cake party',
    badge: 'Fun & Safe',
    type: 'kids-birthday',
    image: '/images/celebration_1.webp',
    borderColor: 'border-cyan-300 hover:border-cyan-500',
    bgGradient: 'bg-gradient-to-br from-cyan-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-cyan-100 to-cyan-200/90 border border-cyan-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(6,182,212,0.08)] hover:shadow-[0_12px_32px_rgba(6,182,212,0.22)]',
    badgeColor: 'bg-cyan-100/90 text-cyan-800 border-cyan-200',
    arrowColor: 'text-cyan-600',
  },
  {
    slug: 'baby-shower',
    title: 'Baby Shower / Mom-to-be',
    tagline: 'Balloon arch entrance, floral walkway & sweet memories',
    badge: 'Sweet Milestone',
    type: 'baby-shower',
    image: '/images/ambience_1.webp',
    borderColor: 'border-emerald-300 hover:border-emerald-500',
    bgGradient: 'bg-gradient-to-br from-emerald-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-emerald-100 to-emerald-200/90 border border-emerald-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(16,185,129,0.08)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.22)]',
    badgeColor: 'bg-emerald-100/90 text-emerald-800 border-emerald-200',
    arrowColor: 'text-emerald-600',
  },
  {
    slug: 'friends-party',
    title: 'Friends & Match Screening',
    tagline: 'Full celebration hall, big-screen match & room for the whole group',
    badge: 'Party Vibe',
    type: 'friends-party',
    image: '/images/celebration_7.webp',
    borderColor: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-amber-100 to-amber-200/90 border border-amber-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_32px_rgba(245,158,11,0.22)]',
    badgeColor: 'bg-amber-100/90 text-amber-900 border-amber-200',
    arrowColor: 'text-amber-600',
  },
  {
    slug: 'farewell',
    title: 'Farewell / Bon Voyage',
    tagline: 'Personalised letter lights, a memory montage on the 4K screen & roses',
    badge: 'Nostalgic',
    type: 'farewell',
    image: '/images/celebration_4.webp',
    borderColor: 'border-slate-200 hover:border-[#00A2E4]',
    bgGradient: 'bg-gradient-to-br from-[#F8F0E5]/40 via-white to-white',
    iconBg: 'bg-gradient-to-br from-[#F8F0E5] to-[#E6F3FB] border border-slate-200',
    shadow: 'shadow-[0_4px_20px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.22)]',
    badgeColor: 'bg-[#E6F3FB] text-[#082052] border-sky-200',
    arrowColor: 'text-[#00A2E4]',
  }
];

const celebrationAddonsList = [
  {
    category: 'Cakes',
    title: 'Fresh Pineapple Celebration Cake',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Light fluffy sponge layered with tropical whipped cream, juicy pineapple chunks & glazed cherries.',
    iconKey: 'pineapple',
    badge: 'Guest Favorite',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Cakes',
    title: 'Belgian Chocolate Truffle Cake',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Pure Dutch dark chocolate ganache with velvety cocoa sponge & custom chocolate name plaque.',
    iconKey: 'chocolate',
    badge: 'Bestseller',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Cakes',
    title: 'Classic Black Forest Cake',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Layers of moist chocolate sponge, sweet-tart cherries, and pillowy whipped cream with curls.',
    iconKey: 'black-forest',
    badge: 'Classic',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Cakes',
    title: 'Crunchy Butterscotch Cake',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Golden caramel butterscotch cream loaded with crunchy caramelized praline nuts.',
    iconKey: 'butterscotch',
    badge: 'Crunchy',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Cakes',
    title: 'Red Velvet Heart Cake',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Vibrant ruby cocoa sponge with authentic cream cheese frosting and edible rose petals.',
    iconKey: 'red-velvet',
    badge: 'Romantic Pick',
    cardBorder: 'border-rose-300 hover:border-rose-500',
    bgGradient: 'bg-gradient-to-br from-rose-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-rose-100 to-rose-200/80 border border-rose-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(244,63,94,0.08)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.2)]',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    category: 'Special FX',
    title: 'Magical Dry-Ice Fog Entry',
    price: 'From ₹399',
    desc: 'Enchanting dense ground smoke effect billowing at your feet for a dramatic cinematic walk-in.',
    iconKey: 'fog',
    badge: 'Hero Entry',
    cardBorder: 'border-slate-200 hover:border-[#00A2E4]',
    bgGradient: 'bg-gradient-to-br from-[#F8F0E5]/40 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-[#F8F0E5] to-[#E6F3FB] border border-slate-200',
    shadow: 'shadow-[0_4px_16px_rgba(8,32,82,0.08)] hover:shadow-[0_12px_28px_rgba(8,32,82,0.15)]',
    badgeColor: 'bg-[#E6F3FB] text-[#082052] border-sky-200'
  },
  {
    category: 'Special FX',
    title: 'Cold Fire Pyro Sparkler Entry (2 Pots)',
    price: '₹799',
    desc: 'Safe, indoor smokeless golden fountain sparklers shooting 6-foot celebratory sparks.',
    iconKey: 'pyro',
    badge: 'Crowd Stunner',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Special FX',
    title: 'Grand Bubble Machine Walk-in',
    price: '₹199',
    desc: 'Thousands of floating rainbow bubbles welcoming your loved ones through the theatre door.',
    iconKey: 'bubbles',
    badge: 'Magical Entry',
    cardBorder: 'border-purple-300 hover:border-purple-500',
    bgGradient: 'bg-gradient-to-br from-purple-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-purple-100 to-purple-200/80 border border-purple-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(168,85,247,0.08)] hover:shadow-[0_12px_28px_rgba(168,85,247,0.2)]',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200'
  },
  {
    category: 'Romantic Décor',
    title: 'Fresh Dutch Red Rose Bouquet',
    price: '₹399',
    desc: '15 hand-tied vibrant Dutch red roses in luxury wrapper with personalized card.',
    iconKey: 'roses',
    badge: 'Fresh Blooms',
    cardBorder: 'border-rose-300 hover:border-rose-500',
    bgGradient: 'bg-gradient-to-br from-rose-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-rose-100 to-rose-200/80 border border-rose-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(244,63,94,0.08)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.2)]',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    category: 'Romantic Décor',
    title: 'Candlelight & Rose Petal Pathway',
    price: '₹499',
    desc: 'Illuminated aisle with warm glowing lanterns, fairy candles and fragrant red rose petals.',
    iconKey: 'candles',
    badge: 'Ultra Romantic',
    cardBorder: 'border-rose-300 hover:border-rose-500',
    bgGradient: 'bg-gradient-to-br from-rose-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-rose-100 to-rose-200/80 border border-rose-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(244,63,94,0.08)] hover:shadow-[0_12px_28px_rgba(244,63,94,0.2)]',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200'
  },
  {
    category: 'Romantic Décor',
    title: 'Personalized Glowing LED Name / Numbers',
    price: '₹250',
    desc: '1-foot high glowing marquee LED letters spelling your partner’s name or milestone age.',
    iconKey: 'led-letters',
    badge: 'Customized',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    category: 'Photography',
    title: 'Professional DSLR Photography',
    price: '₹499 (30m) · ₹999 (1hr)',
    desc: 'Dedicated creative photographer capturing 30+ color-graded high-resolution photos.',
    iconKey: 'dslr',
    badge: 'HD Memories',
    cardBorder: 'border-violet-300 hover:border-violet-500',
    bgGradient: 'bg-gradient-to-br from-violet-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-violet-100 to-violet-200/80 border border-violet-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(139,92,246,0.08)] hover:shadow-[0_12px_28px_rgba(139,92,246,0.2)]',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  {
    category: 'Photography',
    title: 'iPhone Cinematic 4K Reel',
    price: '₹500',
    desc: '1-minute trending 4K Instagram reel edited with smooth transitions and your soundtrack.',
    iconKey: 'reel',
    badge: 'Insta Ready',
    cardBorder: 'border-violet-300 hover:border-violet-500',
    bgGradient: 'bg-gradient-to-br from-violet-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-violet-100 to-violet-200/80 border border-violet-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(139,92,246,0.08)] hover:shadow-[0_12px_28px_rgba(139,92,246,0.2)]',
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200'
  },
  {
    category: 'Photography',
    title: 'Dancing Teddy Mascot Surprise',
    price: '₹500',
    desc: '30-minute interactive live dancing giant Teddy mascot to surprise and cheer up guests.',
    iconKey: 'teddy',
    badge: 'Live Surprise',
    cardBorder: 'border-amber-300 hover:border-amber-500',
    bgGradient: 'bg-gradient-to-br from-amber-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-amber-100 to-amber-200/80 border border-amber-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(245,158,11,0.08)] hover:shadow-[0_12px_28px_rgba(245,158,11,0.2)]',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
  }
];

const addonDecks = [
  {
    id: 'deck-cakes',
    number: '01',
    category: 'Cakes',
    icon: '🎂',
    title: 'Artisan Pastry Cakes',
    tagline: '5 Handcrafted Varieties Baked Fresh Locally with Custom Name Board',
    badge: 'Included in Standard & Premium Packages (₹0)',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    cardBorder: 'border-amber-300',
    topOffset: 'top-20 sm:top-24',
    bgGradient: 'bg-gradient-to-br from-amber-50/40 via-white to-white',
    shadow: 'shadow-[0_20px_50px_rgba(245,158,11,0.12)]',
    items: celebrationAddonsList.filter(item => item.category === 'Cakes')
  },
  {
    id: 'deck-special-fx',
    number: '02',
    category: 'Special FX',
    icon: '💨',
    title: 'Atmospheric Special FX & Walk-ins',
    tagline: 'Cinematic Visuals & Stage Ambience for Grand Unforgettable Entries',
    badge: 'Crowd Favorite',
    badgeColor: 'bg-[#E6F3FB] text-[#082052] border-sky-200',
    cardBorder: 'border-[#00A2E4]/30',
    topOffset: 'top-24 sm:top-28',
    bgGradient: 'bg-gradient-to-br from-[#F6FAFD] via-[#FFF5EE] to-[#FFE8DA]',
    shadow: 'shadow-[0_20px_50px_rgba(8,32,82,0.12)]',
    items: celebrationAddonsList.filter(item => item.category === 'Special FX')
  },
  {
    id: 'deck-romantic',
    number: '03',
    category: 'Romantic Décor',
    icon: '🌹',
    title: 'Romantic Candlelight & LED Décor',
    tagline: 'Surprise Walkways, Marquee Lettering & Handcrafted Rose Bouquets',
    badge: 'Couples & Proposals',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-300',
    cardBorder: 'border-rose-300',
    topOffset: 'top-28 sm:top-32',
    bgGradient: 'bg-gradient-to-br from-rose-50/40 via-white to-white',
    shadow: 'shadow-[0_20px_50px_rgba(244,63,94,0.12)]',
    items: celebrationAddonsList.filter(item => item.category === 'Romantic Décor')
  },
  {
    id: 'deck-photography',
    number: '04',
    category: 'Photography',
    icon: '📸',
    title: 'Cinematic Photography & Live Mascot',
    tagline: 'High-Definition Memories Captured & Edited for Social Media Reels',
    badge: 'Insta Ready',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-300',
    cardBorder: 'border-violet-300',
    topOffset: 'top-32 sm:top-36',
    bgGradient: 'bg-gradient-to-br from-violet-50/40 via-white to-white',
    shadow: 'shadow-[0_20px_50px_rgba(139,92,246,0.12)]',
    items: celebrationAddonsList.filter(item => item.category === 'Photography')
  }
];

const heroBgPhotos = [
  {
    src: '/images/couple_1.webp',
    title: 'Couple Cinema',
    tabTitle: 'Couple Room',
    shortLabel: 'Couple',
    badge: 'Romantic Date',
    icon: '🎬',
    subtitle: 'Cozy private 4K cinema with intimate mood lighting & couple recliners',
    specs: ['4K Laser', 'JBL 5.1 Sound', 'Up to 2 Guests'],
    price: 'From ₹1,499',
    ctaText: 'View Couple Slots',
    theatreId: 1
  },
  {
    src: '/images/celebration_2.webp',
    title: 'Celebration VIP',
    tabTitle: 'Celebration',
    shortLabel: 'Celebration',
    badge: 'Party Lounge',
    icon: '✨',
    subtitle: 'Golden balloon arch backdrop, fairy lights & party seating for birthdays and anniversaries',
    specs: ['4K Laser', 'JBL Pro Sound', 'Up to 6 Guests'],
    price: 'From ₹2,200',
    ctaText: 'View Celebration Slots',
    theatreId: 2
  },
  {
    src: '/images/celebration_1.webp',
    title: 'Family 150″ Theatre',
    tabTitle: 'Family 150″',
    shortLabel: 'Family',
    badge: '150″ 4K Laser',
    icon: '🔊',
    subtitle: 'Massive 150″ wide screen with stadium recliners and Dolby Atmos surround acoustics',
    specs: ['150″ Laser', 'Dolby Atmos', 'Up to 12 Guests'],
    price: 'From ₹2,200',
    ctaText: 'View Family Slots',
    theatreId: 3
  },
  {
    src: '/images/celebration_6.webp',
    title: 'Fog & Pyro Entry',
    tabTitle: 'Fog & Pyro',
    shortLabel: 'Fog & Pyro',
    badge: 'Hero Entry FX',
    icon: '💨',
    subtitle: 'Enchanting dense ground fog billowing at your feet with cold non-heating stage sparklers',
    specs: ['Stage Ambience', 'Cold Sparklers', '100% Safe'],
    price: 'Add-on ₹499',
    ctaText: 'Explore Special FX',
    theatreId: 1
  },
  {
    src: '/images/couple_3.webp',
    title: 'Surprise Décor',
    tabTitle: 'Surprise Décor',
    shortLabel: 'Surprise',
    badge: 'Signature Décor',
    icon: '🎂',
    subtitle: 'Heart balloon arch pathway, customized LED neon board, candles & celebration cake',
    specs: ['Gourmet Cake', 'Neon Board', 'Rose Petals'],
    price: 'Free in Package',
    ctaText: 'Explore Décor Packages',
    theatreId: 1
  }
];

const defaultTheatres = [
  // Electronic City (Branch 1)
  {
    branch: 'Electronic City',
    branchId: 1,
    name: 'Couple Room',
    meta: 'Up to 2 guests · Private Cinema',
    price: '₹1,499',
    dealPrice: '₹899',
    image: '/images/couple_1.webp',
    description: 'An intimate private screen designed for quiet dates, proposals and anniversaries.',
    branchSlug: 'electronic-city',
    theatreId: 1,
    location: 'Electronic City, Bengaluru'
  },
  {
    branch: 'Electronic City',
    branchId: 1,
    name: 'Celebration Room',
    meta: 'Up to 6 guests · Private Cinema',
    price: '₹2,200',
    dealPrice: '₹1,699',
    image: '/images/celebration_2.webp',
    description: 'Your own celebration lounge with personalised décor, cinematic sound and space to party.',
    branchSlug: 'electronic-city',
    theatreId: 2,
    location: 'Electronic City, Bengaluru'
  },
  {
    branch: 'Electronic City',
    branchId: 1,
    name: 'Family Theatre',
    meta: 'Up to 12 guests · Private Cinema',
    price: '₹2,200',
    dealPrice: '₹1,699',
    image: '/images/celebration_1.webp',
    description: 'A big-screen experience for families and groups with Dolby sound and comfortable seating.',
    branchSlug: 'electronic-city',
    theatreId: 3,
    location: 'Electronic City, Bengaluru'
  },
  // BTM 2nd Stage (Branch 2)
  {
    branch: 'BTM 2nd Stage',
    branchId: 2,
    name: 'Butterfly Blush',
    meta: 'Up to 2 guests · Private Cinema',
    price: '₹1,499',
    dealPrice: '₹899',
    image: '/images/rooms/btm-butterfly-blush.webp',
    description: 'Signature Blush Glow, 4K Laser Projection, Dolby Atmos Surround, Luxury Recliner Loungers.',
    branchSlug: 'btm-stage-2',
    theatreId: 4,
    location: 'BTM 2nd Stage, Bengaluru'
  },
  {
    branch: 'BTM 2nd Stage',
    branchId: 2,
    name: 'Lavender Mist',
    meta: 'Up to 6 guests · Private Cinema',
    price: '₹2,200',
    dealPrice: '₹1,499',
    image: '/images/rooms/btm-lavender-mist.webp',
    description: 'Aesthetic Lavender Hues, 135-inch Cinema Display, High-Fidelity Audio, Fog Entry Compatible.',
    branchSlug: 'btm-stage-2',
    theatreId: 5,
    location: 'BTM 2nd Stage, Bengaluru'
  },
  {
    branch: 'BTM 2nd Stage',
    branchId: 2,
    name: 'Scarlet Red',
    meta: 'Up to 12 guests · Private Cinema',
    price: '₹2,400',
    dealPrice: '₹1,699',
    image: '/images/rooms/btm-scarlet-red.webp',
    description: 'Passionate Scarlet Theme, 150-inch 4K Cinema Screen, Recliners + Loungers, Private Dining Table.',
    branchSlug: 'btm-stage-2',
    theatreId: 6,
    location: 'BTM 2nd Stage, Bengaluru'
  },
  {
    branch: 'BTM 2nd Stage',
    branchId: 2,
    name: 'Shadow Suit',
    meta: 'Up to 8 guests · Private Cinema',
    price: '₹2,400',
    dealPrice: '₹1,599',
    image: '/images/rooms/btm-shadow-suit.webp',
    description: 'Stealth Cinema Suite, Deep Contrast Acoustic Walls, 140-inch Laser 4K Screen, Recliner Suite, Dolby Audio.',
    branchSlug: 'btm-stage-2',
    theatreId: 7,
    location: 'BTM 2nd Stage, Bengaluru'
  },
];

const defaultSlotRooms = [
  {
    branch: 'Electronic City',
    branchSlug: 'electronic-city',
    theatreId: 1,
    name: 'Couple Room',
    capacity: 'Up to 2 guests',
    spec: '4K Laser · JBL 5.1',
    price: '₹1,499',
    custom: '₹899',
    image: '/images/couple_1.webp',
    video: '/videos/btm-butterfly-blush.mp4',
    slots: [
      '10:00 AM – 12:00 PM',
      '12:15 PM – 02:15 PM',
      '02:30 PM – 04:30 PM',
      '05:00 PM – 06:00 PM',
      '06:30 PM – 08:30 PM',
      '08:45 PM – 10:45 PM',
      '11:00 PM – 01:00 AM'
    ],
  },
  {
    branch: 'Electronic City',
    branchSlug: 'electronic-city',
    theatreId: 2,
    name: 'Celebration Room',
    capacity: 'Up to 6 guests',
    spec: '4K Laser · JBL Pro',
    price: '₹2,200',
    custom: '₹1,699',
    image: '/images/celebration_2.webp',
    video: '/videos/btm-lavender-mist.mp4',
    slots: [
      '09:30 AM – 11:30 AM',
      '12:00 PM – 02:00 PM',
      '02:30 PM – 04:30 PM',
      '04:45 PM – 06:45 PM',
      '07:00 PM – 09:00 PM',
      '09:15 PM – 11:15 PM',
      '11:30 PM – 01:00 AM'
    ],
  },
  {
    branch: 'Electronic City',
    branchSlug: 'electronic-city',
    theatreId: 3,
    name: 'Family Room',
    capacity: 'Up to 12 guests',
    spec: '150″ Screen · Dolby 7.1.2',
    price: '₹2,200',
    custom: '₹1,699',
    image: '/images/celebration_1.webp',
    video: '/videos/btm-scarlet-red.mp4',
    slots: [
      '10:00 AM – 12:00 PM',
      '12:30 PM – 02:30 PM',
      '03:00 PM – 05:00 PM',
      '06:00 PM – 08:00 PM',
      '08:30 PM – 10:30 PM',
      '10:45 PM – 12:45 AM'
    ],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 4,
    name: 'Butterfly Blush',
    capacity: 'Up to 2 guests',
    spec: 'Signature Blush Glow · 4K Laser',
    price: '₹1,499',
    custom: '₹899',
    image: '/images/rooms/btm-butterfly-blush.webp',
    video: '/videos/btm-butterfly-blush.mp4',
    slots: [
      '10:00 AM – 12:00 PM',
      '12:30 PM – 02:30 PM',
      '03:00 PM – 05:00 PM',
      '05:30 PM – 07:30 PM',
      '08:00 PM – 10:00 PM',
      '11:00 PM – 01:00 AM'
    ],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 5,
    name: 'Lavender Mist',
    capacity: 'Up to 6 guests',
    spec: 'Lavender Hues · 135" Cinema Screen',
    price: '₹2,200',
    custom: '₹1,699',
    image: '/images/rooms/btm-lavender-mist.webp',
    video: '/videos/btm-lavender-mist.mp4',
    slots: [
      '10:30 AM – 12:30 PM',
      '01:00 PM – 03:00 PM',
      '03:30 PM – 05:30 PM',
      '06:00 PM – 08:00 PM',
      '08:30 PM – 10:30 PM',
      '11:00 PM – 01:00 AM'
    ],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 6,
    name: 'Scarlet Red',
    capacity: '12–20 guests',
    spec: 'Scarlet Glow · 150" 4K Screen',
    price: '₹2,600',
    custom: '₹1,699',
    image: '/images/rooms/btm-scarlet-red.webp',
    video: '/videos/btm-scarlet-red.mp4',
    slots: [
      '10:30 AM – 12:30 PM',
      '01:00 PM – 03:00 PM',
      '03:30 PM – 05:30 PM',
      '06:00 PM – 08:00 PM',
      '08:30 PM – 10:30 PM',
      '11:00 PM – 01:00 AM'
    ],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 7,
    name: 'Shadow Suit',
    capacity: 'Up to 8 guests',
    spec: 'Stealth Cinema · 140" Laser Screen',
    price: '₹2,400',
    custom: '₹1,599',
    image: '/images/rooms/btm-shadow-suit.webp',
    video: '/videos/btm-scarlet-red.mp4',
    slots: [
      '10:00 AM – 12:00 PM',
      '12:30 PM – 02:30 PM',
      '03:00 PM – 05:00 PM',
      '05:30 PM – 07:30 PM',
      '08:00 PM – 10:00 PM',
      '11:00 PM – 01:00 AM'
    ],
  },
];

const packageTiers = [
  {
    name: 'Custom',
    price: 'From ₹899',
    note: 'Build only what you need',
    features: ['Private theatre access', '4K screen & surround sound', 'Choose décor and add-ons', 'Dedicated support team'],
  },
  {
    name: 'Standard',
    price: 'From ₹1,499',
    note: 'Décor, cake and entries included',
    featured: true,
    features: ['500g celebration cake', 'Premium decoration', 'Fog entry — 1 pot', 'LED number & name board', 'HBD neon sign', 'Private 4K screening'],
  },
  {
    name: 'Premium',
    price: 'From ₹2,800',
    note: 'The complete surprise',
    features: ['Everything in Standard', 'Upgraded themed decoration', 'Grand entry experience', 'Premium cake selection', 'Priority celebration support'],
  },
];



const gallery = [
  ['/images/hero_8441.webp', 'Golden butterfly arch hall • BTM 2nd Stage'],
  ['/images/hero_8388.webp', 'Romantic rose heart suite • Electronic City'],
  ['/images/btm_wings_arch.webp', 'Grand illuminated celebration stage • BTM'],
  ['/images/btm_celebration_stage.webp', 'Private balloon canopy & 150″ cinema • BTM'],
  ['/images/ecity_rose_heart.webp', 'Floral welcome walkway & romantic décor'],
  ['/images/btm_golden_arch.webp', 'MOVIE BASH celebration hall • BTM 2nd Stage'],
];

// Official Movie Bash FAQ (copied from moviebash.in)
const faqs: [string, string][] = [
  ['How many screens do you have in Movie Bash?', 'Movie Bash has three private screens at Electronic City — Couple, Celebration and Family — and four themed private theatres at BTM 2nd Stage.'],
  ['What if we book and postpone the date of the event? What is the procedure?', 'Any postponement must be informed at least 72 hours before your scheduled slot. We will move your booking to another available date and time.'],
  ['Is alcohol served at Movie Bash, and is smoking permitted?', 'No. Alcohol consumption and smoking, including vapes, are strictly prohibited across all Movie Bash premises.'],
  ['Is there any specific age restriction for booking at Movie Bash?', 'Yes, guests must be 18 and above. Guests below 18 are allowed when accompanied by their family members or guardians.'],
  ['Is outside food allowed?', 'Yes. Outside food and beverages are allowed, and you can also order from Swiggy or Zomato directly to either branch.'],
  ['Is 2-wheeler and 4-wheeler parking available?', 'Yes, parking is available for both two-wheelers and four-wheelers at Electronic City and BTM 2nd Stage.'],
  ['Can we bring our own pet to Movie Bash?', 'No, pets are not allowed inside the private screening rooms.'],
  ['What if there is a technical issue during the event?', 'A partial refund is provided as per our terms and conditions, and our team will help you reschedule wherever possible.'],
  ['What type of decorations do you have, and how often do you change them?', 'We offer Love, Birthday, Anniversary and Celebration themes, along with neon lettering and balloon setups. We also customise the décor to your requirement.'],
  ['What type of add-ons do you have?', 'Cake, snacks, food, fog entry, cold fire, special decoration, baby cart entry and more. Add-ons and cake flavours are selected while booking.'],
  ['When can we book the add-ons?', 'You can book add-ons while reserving the room, or a day before the event.']
];

const guestReviews = [
  {
    quote: "Had the absolute best time celebrating our baby's birthday here! The team provided outstanding service and genuine cooperation throughout the event. The photos and videos turned out stunning—crisp, well-lit, and beautiful memory-keepers. The cake was a huge hit too! The design was exactly what we asked for, and it tasted amazing. Thank you for making our baby's day so memorable!",
    author: "Neha Sultana",
    occasion: "Baby's Birthday Celebration • Electronic City",
    stars: "★★★★★",
    tag: "Verified Google Review"
  },
  {
    quote: "We celebrated our son's 2nd birthday at Bash Movie yesterday, and it was an unforgettable experience! From the moment we arrived, everything was well organized and beautifully arranged. The decorations, lighting, and overall ambiance created a perfect setting for the celebration. The staff was extremely friendly, polite, and attentive. They took care of every little detail and made sure our event went smoothly without any stress. Our guests enjoyed the venue, and the kids had an amazing time. The service was excellent, and the entire team went above and beyond to make our special day memorable. Seeing the smiles on our son's face made it all the more special. Thank you to the entire Bash Movie team for making our little prince's 2nd birthday such a beautiful and cherished memory. We truly appreciate your effort and hospitality. We highly recommend this place for birthday parties and family celebrations, and we look forward to celebrating many more special occasions here! ❤️ 🎉 🎂",
    author: "Pavani Pandu",
    occasion: "Son's 2nd Birthday Party • Electronic City",
    stars: "★★★★★",
    tag: "Verified Google Review"
  },
  {
    quote: "Yesterday night we have celebrated birthday... 🎉 Really superb.. service's and I love your hospitality and prosperity.. 🤗 coming to the party hall and decor and snacks all such things are Really fabulous and our children had enjoyed and created thair own memories 🤩 🤩 You mad Hanish's day some more special 💖 ✨ He loved and got surprised 🥰 We were so happy about that 🫠 Thank you... Movie Bash for what you mad for us. 🤝",
    author: "Rajesh raju",
    occasion: "Birthday Celebration & Party • Electronic City",
    stars: "★★★★★",
    tag: "Verified Google Review"
  },
  {
    quote: "Had a really nice experience at Movie Bash, Bangalore! 😊 We celebrated a birthday here, and it was a lovely experience. The staff were very patient, friendly, and supportive throughout, and they made sure we felt comfortable. ❤️ The private theatre setup made the celebration feel extra special and gave us some wonderful memories. 🎂 🎬 It’s a great place to plan a birthday surprise or celebrate a special occasion with friends and family. Really appreciate the staff for their patience and support. Overall, we had a great time and would definitely recommend this place! ❤️ ✨",
    author: "Naveen Sudarshan",
    occasion: "Birthday Party Experience • Electronic City",
    stars: "★★★★★",
    tag: "Verified Google Review"
  },
  {
    quote: "This venue is good for small events, especially if food is not required. It has ample parking, which is a big advantage. They have two celebration rooms with nice decorations and screens, making them suitable for birthday parties and other small gatherings. However, it is not ideal for events that require food, as there is no dedicated dining area.",
    author: "Nandu's Quest",
    occasion: "Small Gathering & Celebration • Electronic City",
    stars: "★★★★☆",
    tag: "Google Local Guide (165 Reviews)"
  },
];

const heroPhotos = [
  '/images/rooms/btm-butterfly-blush.webp',
  '/images/rooms/btm-scarlet-red.webp',
  '/images/rooms/btm-lavender-mist.webp',
  '/images/rooms/btm-shadow-suit.webp',
  '/images/celebration_1.webp',
  '/images/couple_1.webp',
  '/images/celebration_2.webp',
  '/images/couple_2.webp',
  '/images/ambience_1.webp',
  '/images/celebration_3.webp'
];

// `addonId` matches the booking form's add-on record, so switching an add-on
// off in the admin panel removes it from this section automatically.
const addonTiles = [
  {
    addonId: 3,
    title: 'Fog Entry',
    price: 'From ₹399',
    desc: 'A pot of dry-ice fog rolling across the doorway as you walk in.',
    image: '/images/addons/fog-entry.webp',
    href: '/book-now',
  },
  {
    addonId: 4,
    title: 'Cold Pyro Sparklers',
    price: 'From ₹799',
    desc: 'Golden sparkler fountains beside the cake table for the big reveal.',
    image: '/images/addons/cold-pyro.webp',
    href: '/book-now',
  },
  {
    addonId: 9,
    title: 'Rose Petal Décor',
    price: 'From ₹250',
    desc: 'Fresh petals arranged as a heart on the table and along the aisle.',
    image: '/images/celebration_3.webp',
    href: '/book-now',
  },
  {
    addonId: 5,
    title: 'LED Name Board',
    price: 'From ₹250',
    desc: 'A warm lit board with your name or message on the celebration wall.',
    image: '/images/addons/led-name-board.webp',
    href: '/book-now',
  },
  {
    addonId: 7,
    title: 'Rose Bouquet',
    price: 'From ₹399',
    desc: 'A hand-tied red rose bouquet waiting on the table when you arrive.',
    image: '/images/addons/rose-bouquet.webp',
    href: '/book-now',
  },
  {
    addonId: 11,
    title: 'Bubble Entry',
    price: 'From ₹199',
    desc: 'A bubble machine filling the entry with floating bubbles for your walk-in.',
    image: '/images/addons/bubble-entry.webp',
    href: '/book-now',
  },
  {
    addonId: 8,
    title: 'DSLR Photography',
    price: 'From ₹499',
    desc: '30 minutes with a photographer, plus your photos shown on the big screen.',
    image: '/images/addons/dslr-photography.webp',
    href: '/book-now',
  },
  {
    addonId: 8,
    title: 'iPhone 4K Reel',
    price: '+₹500',
    desc: 'A 1-minute trending reel, shot on iPhone at your celebration and edited to your song.',
    image: '/images/addons/iphone-reel.webp',
    href: '/book-now',
  },
  {
    addonId: 10,
    title: 'Teddy Mascot Entry',
    price: 'From ₹500',
    desc: 'Our teddy mascot walks in with the cake for a 30-minute surprise.',
    image: '/images/addons/teddy-mascot.webp',
    href: '/book-now',
  },
];


export default function RefineTheatreLanding({ initialLiveTheatres }: { initialLiveTheatres?: any[] } = {}) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const slotBarRef = useRef<HTMLDivElement>(null);
  const heroSlotsModalRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroMarqueeRef = useRef<HTMLDivElement>(null);

  const [showHeroSlots, setShowHeroSlots] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState('/videos/btm-butterfly-blush.mp4');
  const [selectedVideoTitle, setSelectedVideoTitle] = useState('Butterfly Blush • BTM 2nd Stage');
  const [heroMediaMode, setHeroMediaMode] = useState<'video' | '8388' | '8441'>('8441');
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [isHeroCarouselPaused, setIsHeroCarouselPaused] = useState(false);
  const heroTouchStartX = useRef<number | null>(null);
  const heroTouchEndX = useRef<number | null>(null);
  const heroPillTrackRef = useRef<HTMLDivElement>(null);
  const heroMediaRef = useRef<HTMLDivElement>(null);
  const occasionsTimelineRef = useRef<HTMLDivElement>(null);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [heroRevealed, setHeroRevealed] = useState(false);

  // Active scroll continuation listener for "What are you celebrating?" timeline
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => {
      if (!occasionsTimelineRef.current) return;
      const rect = occasionsTimelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      const visibleOffset = windowHeight * 0.65 - rect.top;
      const progress = Math.min(1, Math.max(0, visibleOffset / (totalHeight + windowHeight * 0.1)));
      setTimelineProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // The logo loader hands over to a slow zoom-settle on the hero image, then the
  // same image keeps zooming in gently as the hero scrolls out of view.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealHero = () => setHeroRevealed(true);

    let introAlreadySeen = false;
    try {
      introAlreadySeen = !!sessionStorage.getItem('mb_intro_v2');
    } catch (_) {}
    if (introAlreadySeen || reduceMotion) revealHero();

    window.addEventListener('mb:intro-done', revealHero);
    const revealFallback = window.setTimeout(revealHero, 3300);

    return () => {
      window.removeEventListener('mb:intro-done', revealHero);
      window.clearTimeout(revealFallback);
    };
  }, []);

  useEffect(() => {
    const track = heroPillTrackRef.current;
    if (track && track.children[heroBgIndex]) {
      const activeEl = track.children[heroBgIndex] as HTMLElement;
      const targetScroll = activeEl.offsetLeft - (track.clientWidth / 2) + (activeEl.clientWidth / 2);
      track.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  }, [heroBgIndex]);

  const nextHeroSlide = () => {
    setHeroBgIndex((prev) => (prev + 1) % heroBgPhotos.length);
  };

  const prevHeroSlide = () => {
    setHeroBgIndex((prev) => (prev - 1 + heroBgPhotos.length) % heroBgPhotos.length);
  };

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    heroTouchStartX.current = e.touches[0].clientX;
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    heroTouchEndX.current = e.touches[0].clientX;
  };

  const handleHeroTouchEnd = () => {
    if (heroTouchStartX.current === null || heroTouchEndX.current === null) return;
    const diff = heroTouchStartX.current - heroTouchEndX.current;
    if (diff > 40) {
      nextHeroSlide();
    } else if (diff < -40) {
      prevHeroSlide();
    }
    heroTouchStartX.current = null;
    heroTouchEndX.current = null;
  };

  const theatreSectionRef = useRef<HTMLElement>(null);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTheatreScreenWheel = (e: React.WheelEvent) => {
    if (wheelTimeout.current) return;
    if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
      if (e.deltaY > 0 || e.deltaX > 0) {
        setActiveOccasion((prev) => (prev + 1) % occasionsList.length);
      } else {
        setActiveOccasion((prev) => (prev - 1 + occasionsList.length) % occasionsList.length);
      }
      wheelTimeout.current = setTimeout(() => {
        wheelTimeout.current = null;
      }, 350);
    }
  };

  const occTouchStartX = useRef<number | null>(null);
  const occTouchEndX = useRef<number | null>(null);

  const handleOccTouchStart = (e: React.TouchEvent) => {
    occTouchStartX.current = e.touches[0].clientX;
  };
  const handleOccTouchMove = (e: React.TouchEvent) => {
    occTouchEndX.current = e.touches[0].clientX;
  };
  const handleOccTouchEnd = () => {
    if (occTouchStartX.current === null || occTouchEndX.current === null) return;
    const diff = occTouchStartX.current - occTouchEndX.current;
    if (diff > 40) {
      setActiveOccasion((prev) => (prev + 1) % occasionsList.length);
    } else if (diff < -40) {
      setActiveOccasion((prev) => (prev - 1 + occasionsList.length) % occasionsList.length);
    }
    occTouchStartX.current = null;
    occTouchEndX.current = null;
  };

  const [activeOccasion, setActiveOccasion] = useState(0);
  const [isOccasionPaused, setIsOccasionPaused] = useState(false);
  const [activeMomentIdx, setActiveMomentIdx] = useState(0);
  const [isMomentPaused, setIsMomentPaused] = useState(false);
  const momentTouchStartX = useRef<number | null>(null);
  const momentTouchEndX = useRef<number | null>(null);

  useEffect(() => {
    if (isMomentPaused) return;
    const timer = setInterval(() => {
      setActiveMomentIdx(prev => (prev + 1) % gallery.length);
    }, 3800);
    return () => clearInterval(timer);
  }, [isMomentPaused]);

  const nextMoment = () => setActiveMomentIdx(prev => (prev + 1) % gallery.length);
  const prevMoment = () => setActiveMomentIdx(prev => (prev - 1 + gallery.length) % gallery.length);

  const handleMomentTouchStart = (e: React.TouchEvent) => {
    setIsMomentPaused(true);
    momentTouchStartX.current = e.touches[0].clientX;
    momentTouchEndX.current = null;
  };

  const handleMomentTouchMove = (e: React.TouchEvent) => {
    momentTouchEndX.current = e.touches[0].clientX;
  };

  const handleMomentTouchEnd = () => {
    if (momentTouchStartX.current !== null && momentTouchEndX.current !== null) {
      const diff = momentTouchStartX.current - momentTouchEndX.current;
      if (diff > 35) nextMoment();
      else if (diff < -35) prevMoment();
    }
    momentTouchStartX.current = null;
    momentTouchEndX.current = null;
    setTimeout(() => setIsMomentPaused(false), 2200);
  };
  const [openFaq, setOpenFaq] = useState(0);
  const [branch, setBranch] = useState('Electronic City');
  const [date, setDate] = useState(getTodayIST());
  const [slotBranch, setSlotBranch] = useState('Electronic City');
  const [activeDay, setActiveDay] = useState(0);
  const [addonCategory, setAddonCategory] = useState<string>('All');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [ctaBranch, setCtaBranch] = useState('electronic-city');
  const [ctaDate, setCtaDate] = useState(() => getTodayIST());
  const [slotFlashMessage, setSlotFlashMessage] = useState<string | null>(null);
  const [liveAvailability, setLiveAvailability] = useState<Record<number, any[]>>({});
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount_value: number } | null>(null);
  const [activeAddonIds, setActiveAddonIds] = useState<number[] | null>(null);

  const [theatres, setTheatres] = useState(() => {
    if (!initialLiveTheatres || !initialLiveTheatres.length) return defaultTheatres;
    return defaultTheatres.map(th => {
      const match = initialLiveTheatres.find((t: any) => t.id === th.theatreId);
      if (match) {
        return {
          ...th,
          image: match.image_url || th.image,
          price: match.standard_price ? `₹${Number(match.standard_price).toLocaleString('en-IN')}` : th.price,
          dealPrice: match.custom_price ? `₹${Number(match.custom_price).toLocaleString('en-IN')}` : th.dealPrice
        };
      }
      return th;
    });
  });

  const [slotRooms, setSlotRooms] = useState(() => {
    if (!initialLiveTheatres || !initialLiveTheatres.length) return defaultSlotRooms;
    return defaultSlotRooms.map(sr => {
      const match = initialLiveTheatres.find((t: any) => t.id === sr.theatreId);
      if (match) {
        return {
          ...sr,
          image: match.image_url || sr.image,
          price: match.standard_price ? `₹${Number(match.standard_price).toLocaleString('en-IN')}` : sr.price,
          custom: match.custom_price ? `₹${Number(match.custom_price).toLocaleString('en-IN')}` : sr.custom
        };
      }
      return sr;
    });
  });

  useEffect(() => {
    fetch('/api/theatres')
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          const apiTheatres = json.data;

          setSlotRooms((prev) =>
            prev.map((sr) => {
              const matched = apiTheatres.find((t: any) => t.id === sr.theatreId);
              if (matched) {
                return {
                  ...sr,
                  image: matched.image_url || sr.image,
                  price: matched.standard_price ? `₹${Number(matched.standard_price).toLocaleString('en-IN')}` : sr.price,
                  custom: matched.custom_price ? `₹${Number(matched.custom_price).toLocaleString('en-IN')}` : sr.custom
                };
              }
              return sr;
            })
          );

          setTheatres((prev) =>
            prev.map((th) => {
              const matched = apiTheatres.find((t: any) => t.id === th.theatreId);
              if (matched) {
                return {
                  ...th,
                  image: matched.image_url || th.image,
                  price: matched.standard_price ? `₹${Number(matched.standard_price).toLocaleString('en-IN')}` : th.price,
                  dealPrice: matched.custom_price ? `₹${Number(matched.custom_price).toLocaleString('en-IN')}` : th.dealPrice
                };
              }
              return th;
            })
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/coupons/featured')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data?.code) {
          setActiveCoupon({
            code: j.data.code,
            discount_value: Number(j.data.discount_value) || 0,
          });
        } else {
          setActiveCoupon(null);
        }
      })
      .catch(() => setActiveCoupon(null));
  }, []);

  // Only add-ons that are active in the admin panel are shown on the landing page.
  useEffect(() => {
    fetch('/api/addons')
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) {
          setActiveAddonIds(j.data.map((a: any) => Number(a.id)));
        } else {
          setActiveAddonIds(null);
        }
      })
      .catch(() => setActiveAddonIds(null));
  }, []);

  const days = Array.from({ length: 6 }, (_, index) => {
    const isoDate = getDaysAgoIST(-index);
    const day = new Date(`${isoDate}T12:00:00+05:30`);
    return {
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: day.getDate(),
      month: day.toLocaleDateString('en-IN', { month: 'short' }),
      full: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      iso: isoDate
    };
  });

  const handleCtaSubmit = () => {
    const targetBranch = ctaBranch.includes('btm') ? 'BTM 2nd Stage' : 'Electronic City';
    setSlotBranch(targetBranch);
    setBranch(targetBranch);
    const dayIdx = days.findIndex((d) => d.iso === ctaDate);
    if (dayIdx !== -1) {
      setActiveDay(dayIdx);
    } else {
      setActiveDay(0);
    }
    setSlotFlashMessage(`Showing live slots for ${targetBranch}`);
    setTimeout(() => setSlotFlashMessage(null), 4000);
    const slotsEl = document.getElementById('slots');
    if (slotsEl) {
      slotsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const checkAvailability = () => {
    const targetBranch = branch.includes('BTM') ? 'BTM 2nd Stage' : 'Electronic City';
    setSlotBranch(targetBranch);
    const dayIdx = days.findIndex((d) => d.iso === date);
    if (dayIdx !== -1) {
      setActiveDay(dayIdx);
    } else {
      setActiveDay(0);
    }
    setSlotFlashMessage(`Showing live slots for ${targetBranch}`);
    setTimeout(() => setSlotFlashMessage(null), 4000);
    // Directly reveal the slots right there in the hero!
    setShowHeroSlots(true);
  };

  // Auto-advance reviews, hero background & celebrations
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % guestReviews.length);
    }, 4500);
    const bgTimer = setInterval(() => {
      if (!isHeroCarouselPaused) {
        setHeroBgIndex((prev) => (prev + 1) % heroBgPhotos.length);
      }
    }, 4500);
    const occTimer = setInterval(() => {
      if (!isOccasionPaused) {
        setActiveOccasion((prev) => (prev + 1) % occasionsList.length);
      }
    }, 4200);
    return () => {
      clearInterval(timer);
      clearInterval(bgTimer);
      clearInterval(occTimer);
    };
  }, [isOccasionPaused]);

  // GSAP Animations — loaded on demand so the first paint is not blocked.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

    // 1. Dynamic Headline Font-Weight Hover Interaction
    const hero = heroRef.current;
    const headline = heroHeadlineRef.current;
    let headlineCleanup: (() => void) | undefined;
    if (headline && hero) {
      const chars = headline.querySelectorAll<HTMLElement>('.hero-headline-char');
      let mouseRafId: number | null = null;
      const handleMoveChars = (e: MouseEvent) => {
        if (mouseRafId) return;
        mouseRafId = requestAnimationFrame(() => {
          mouseRafId = null;
          const mx = e.clientX;
          const my = e.clientY;
          chars.forEach((char) => {
            const rect = char.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dist = Math.hypot(mx - cx, my - cy);
            const isSerif = char.getAttribute('data-serif') === 'true';

            if (dist < 400) {
              const factor = 1 - dist / 400;
              if (isSerif) {
                const w = Math.round(300 + factor * 550);
                char.style.fontVariationSettings = `"wght" ${w}, "wdth" 87.5, "opsz" 120`;
                char.style.fontWeight = `${w}`;
              } else {
                const w = Math.round(700 - factor * 480);
                char.style.fontVariationSettings = `"wght" ${w}, "wdth" 72`;
                char.style.fontWeight = `${w}`;
              }
            } else {
              if (isSerif) {
                char.style.fontVariationSettings = `"wght" 300, "wdth" 87.5, "opsz" 120`;
                char.style.fontWeight = '300';
              } else {
                char.style.fontVariationSettings = `"wght" 700, "wdth" 72`;
                char.style.fontWeight = '700';
              }
            }
          });
        });
      };

      const handleLeaveChars = () => {
        chars.forEach((char) => {
          const isSerif = char.getAttribute('data-serif') === 'true';
          if (isSerif) {
            char.style.fontVariationSettings = `"wght" 300, "wdth" 87.5, "opsz" 120`;
            char.style.fontWeight = '300';
          } else {
            char.style.fontVariationSettings = `"wght" 700, "wdth" 72`;
            char.style.fontWeight = '700';
          }
        });
      };

      hero.addEventListener('mousemove', handleMoveChars);
      hero.addEventListener('mouseleave', handleLeaveChars);

      headlineCleanup = () => {
        hero.removeEventListener('mousemove', handleMoveChars);
        hero.removeEventListener('mouseleave', handleLeaveChars);
      };
    }

    // 2. Hero Marquee Reversal on Scroll Direction
    const marquee = heroMarqueeRef.current;
    let marqueeCleanup: (() => void) | undefined;
    if (marquee) {
      const tracks = marquee.querySelectorAll<HTMLElement>('.hero-marquee-track');
      if (tracks.length) {
        const tween = gsap.to(tracks, {
          xPercent: -50,
          repeat: -1,
          duration: 30,
          ease: 'none',
        });

        const st = ScrollTrigger.create({
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          onUpdate: (self) => {
            const dir = self.direction; // 1 = down, -1 = up
            gsap.to(tween, { timeScale: dir === 1 ? -1 : 1, duration: 0.3, overwrite: 'auto' });
          }
        });

        marqueeCleanup = () => {
          tween.kill();
          st.kill();
        };
      }
    }

    // 3. ScrollTrigger to dynamically switch cinema celebration screen as user scrolls
    let theatreScrollCleanup: (() => void) | undefined;
    if (theatreSectionRef.current) {
      const st = ScrollTrigger.create({
        trigger: theatreSectionRef.current,
        start: 'top 70%',
        end: 'bottom 25%',
        onUpdate: (self) => {
          const index = Math.min(
            occasionsList.length - 1,
            Math.max(0, Math.floor(self.progress * occasionsList.length))
          );
          setActiveOccasion(index);
        }
      });
      theatreScrollCleanup = () => st.kill();
    }

      cleanup = () => {
        headlineCleanup?.();
        marqueeCleanup?.();
        theatreScrollCleanup?.();
      };
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  const nextReview = () => setReviewIndex((prev) => (prev + 1) % guestReviews.length);
  const prevReview = () => setReviewIndex((prev) => (prev - 1 + guestReviews.length) % guestReviews.length);

  // Fetch dynamic availability whenever branch or selected day changes
  useEffect(() => {
    const branchSlug = slotBranch === 'BTM 2nd Stage' ? 'btm-stage-2' : 'electronic-city';
    const targetDate = days[activeDay]?.iso || getTodayIST();

    let isSubscribed = true;
    fetch(`/api/availability?branch=${branchSlug}&date=${targetDate}`)
      .then((res) => res.json())
      .then((json) => {
        if (isSubscribed && json.success && Array.isArray(json.data)) {
          const grouped: Record<number, any[]> = {};
          json.data.forEach((slot: any) => {
            if (!grouped[slot.theatre_id]) grouped[slot.theatre_id] = [];
            grouped[slot.theatre_id].push(slot);
          });
          setLiveAvailability(grouped);
        }
      })
      .catch((err) => console.error('Availability fetch error:', err));

    return () => {
      isSubscribed = false;
    };
  }, [slotBranch, activeDay]);

  const handleSlotClick = (room: typeof slotRooms[0], time: string, isSold: boolean, slotId?: number) => {
    if (isSold) return;
    const selectedIsoDate = days[activeDay].iso;
    const slotParam = slotId ? `&slot=${slotId}` : '';
    router.push(`/book-now/${room.branchSlug}?date=${selectedIsoDate}&theatre=${room.theatreId}${slotParam}`);
  };

  return (
    <div className="min-h-screen overflow-x-clip bg-cream text-ink select-none">
      {/* 0. AUTHENTIC CINEMA OPENING INTRO ANIMATION */}
      <OpeningWebsiteIntro />
      
      {/* 1. TOP OFFER BAR — only rendered while the admin keeps a coupon active */}
      {activeCoupon && (
        <div className="offer-bar">
          <span>Opening offer</span>
          <p>Flat ₹{activeCoupon.discount_value} off your first celebration with code <strong>{activeCoupon.code}</strong></p>
          <a href="#slots">Explore <Icon name="arrow" size={16} /></a>
        </div>
      )}

      {/* 2. REAL SITE NAVBAR */}
      <Navbar />

      <main>
        {/* 3. HERO SECTION (THE BINGE TOWN ARCHITECTURE & ALIGNMENT + OUR ETOILE LUXURY COLOR PALETTE) */}
        <section 
          ref={heroRef}
          className="relative flex flex-col justify-between items-center overflow-hidden w-full pt-6 sm:pt-14 pb-0 bg-[#082052]" 
          id="home"
        >
          {/* Ambient Real BTM Celebration Hall Background - Crisp, Vibrant & Natural */}
          <div ref={heroMediaRef} className="hero-media absolute inset-0 z-0 overflow-hidden">
            <div className="w-full h-full relative">
              <Image
                src="/images/hero_8441.webp"
                alt="Movie Bash BTM 2nd Stage Celebration Hall"
                fill
                priority
                className="object-cover object-[center_20%]"
                sizes="100vw"
              />
            </div>
            {/* Subtle soft transparent scrim only for text contrast without muting photo colors */}
            <div className="absolute inset-0 bg-black/15 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/35 pointer-events-none" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
            

            {/* H1 Headline (Binge Town Style, Centered, Crisp White) */}
            <h1 
              ref={heroHeadlineRef}
              className="text-[26px] min-[400px]:text-3xl sm:text-5xl md:text-6xl font-['Playfair_Display'] font-black text-white tracking-tight leading-[1.12] max-w-4xl mx-auto drop-shadow-[0_3px_22px_rgba(4,18,36,0.75)] text-center" 
            >
              Bengaluru&apos;s Best Private Theatre Venue for Celebrations
            </h1>

            {/* Subheadline */}
            <p className="mt-3.5 sm:mt-4 text-sm sm:text-lg md:text-xl text-[#F8F0E5] font-normal max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_14px_rgba(4,18,36,0.8)] text-center">
              Book Your Perfect Celebration: Birthdays, Anniversaries, Date Nights &amp; Private Screenings!
            </p>

            {/* ─── FLOATING QUICK BOOKING WIDGET (EXACT BINGE TOWN ARCHITECTURE) ─── */}
            <div className="w-full max-w-3xl mt-5 sm:mt-7 bg-white rounded-3xl p-4 min-[400px]:p-5 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.35)] border border-slate-200 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
                
                {/* Field 1: Branch */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#082052] mb-1.5">
                    Location / Branch
                  </label>
                  <select
                    value={branch}
                    onChange={(e) => {
                      setBranch(e.target.value);
                      if (showHeroSlots) {
                        const target = e.target.value.includes('BTM') ? 'BTM 2nd Stage' : 'Electronic City';
                        setSlotBranch(target);
                      }
                    }}
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#F8F0E5]/40 border border-slate-200 font-bold text-sm text-[#082052] focus:border-[#00A2E4] focus:outline-none cursor-pointer"
                  >
                    <option value="Electronic City">📍 Electronic City (3 Screens)</option>
                    <option value="BTM 2nd Stage">📍 BTM 2nd Stage (4 Screens)</option>
                  </select>
                </div>

                {/* Field 2: Occasion */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#082052] mb-1.5">
                    Occasion
                  </label>
                  <select
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#F8F0E5]/40 border border-slate-200 font-bold text-sm text-[#082052] focus:border-[#00A2E4] focus:outline-none cursor-pointer"
                  >
                    <option value="birthday">🎂 Birthday Party</option>
                    <option value="date">💍 Romantic Date / Proposal</option>
                    <option value="anniversary">💖 Anniversary Celebration</option>
                    <option value="bride">👰 Bride-to-Be / Bachelorette</option>
                    <option value="family">🍿 Family &amp; Friends Movie Night</option>
                  </select>
                </div>

                {/* Field 3: Date */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-[#082052] mb-1.5">
                    Showtime Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    min={getTodayIST()}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-2xl bg-[#F8F0E5]/40 border border-slate-200 font-bold text-sm text-[#082052] focus:border-[#00A2E4] focus:outline-none cursor-pointer"
                  />
                </div>

              </div>

              {/* CTAs: "Book Now" + "Book On Call" (Binge Town Exact Alignment) */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={checkAvailability}
                  className="w-full sm:flex-1 py-3.5 sm:py-4 px-6 rounded-2xl bg-[#082052] hover:bg-[#0B2238] text-white font-['Archivo'] font-black text-sm uppercase tracking-wider shadow-lg shadow-[#082052]/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Check Slots</span>
                  <Icon name="arrow" size={16} />
                </button>

                <a
                  href="tel:+919902923656"
                  className="w-full sm:w-auto py-3.5 sm:py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-[#082052] font-bold text-sm border-2 border-[#082052] transition-all flex items-center justify-center gap-2 cursor-pointer hover:border-[#00A2E4]"
                >
                  <Icon name="phone" size={16} />
                  <span>Book On Call</span>
                </a>
              </div>

              {/* Trust badges & Video Tour Link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 font-bold">
                  <span>✨ 3,500+ celebrations completed</span>
                  <span className="text-amber-500 font-black">★ 5.0 Rating</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedVideo('/videos/btm-butterfly-blush.mp4');
                    setSelectedVideoTitle('Butterfly Blush • BTM 2nd Stage');
                    setVideoModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#082052]/5 hover:bg-[#00A2E4]/10 text-[#082052] hover:text-[#00A2E4] font-black border border-slate-200 hover:border-[#00A2E4] transition-all cursor-pointer"
                >
                  <span className="w-4 h-4 rounded-full bg-[#00A2E4] text-white flex items-center justify-center text-[8px] font-black">▶</span>
                  <span>Watch Video Tour (BTM)</span>
                </button>
              </div>

            </div>

          </div>

        {/* IN-PLACE LIVE SLOTS VIEWER (3 VERTICAL COLUMNS AS REQUESTED) */}
          {showHeroSlots && (
            <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 pb-6">
              <div 
                ref={heroSlotsModalRef}
                className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(20,17,16,0.14)] border-2 border-[#00A2E4]/30 text-left animate-in fade-in slide-in-from-top-4 duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-200 mb-5">
                  <div>
                    <h3 className="font-playfair text-xl sm:text-2xl font-black text-[#0B2238]">
                      Available Showtime Slots &bull; {branch}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Showing live schedule for <strong className="text-[#00A2E4]">{date}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Live Slots Open
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHeroSlots(false)}
                      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
                      title="Close slots view"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* 3 Vertical Columns Side-by-Side (Like Reference Image) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {slotRooms
                    .filter((room) => room.branch === (branch.includes('BTM') ? 'BTM 2nd Stage' : 'Electronic City'))
                    .map((room) => {
                      const roomSlots = liveAvailability[room.theatreId] || [];
                      const openCount = roomSlots.length > 0 
                        ? roomSlots.filter((s: any) => !s.is_booked).length 
                        : room.slots.length;

                      return (
                        <div
                          key={room.name}
                          className="bg-[#F6FAFD] rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-[#00A2E4]/60 transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Real Room Photo Banner + Play Video Overlay */}
                            <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3.5 border border-slate-200 group bg-slate-900 shadow-xs">
                              <Image
                                src={room.image}
                                alt={room.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 320px"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />
                              
                              {/* Top Badge: Capacity */}
                              <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5 pointer-events-none">
                                <span className="px-2 py-0.5 rounded-full bg-white/95 text-[#082052] font-black text-[10px] shadow-sm flex items-center gap-1">
                                  <Icon name="users" size={11} />
                                  {room.capacity}
                                </span>
                              </div>

                              {/* Watch Room Video Button */}
                              {room.video && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedVideo(room.video);
                                    setSelectedVideoTitle(`${room.name} • ${room.branch}`);
                                    setVideoModalOpen(true);
                                  }}
                                  className="absolute top-2 right-2 z-10 px-2.5 py-1 rounded-full bg-black/70 hover:bg-[#00A2E4] text-white text-[10px] font-black tracking-wide flex items-center gap-1 border border-white/20 transition-all cursor-pointer shadow-md hover:scale-105 active:scale-95"
                                >
                                  <span>▶</span> Watch Video
                                </button>
                              )}

                              {/* Bottom Info: Spec + Room Name + Price */}
                              <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-end justify-between text-white pointer-events-none">
                                <div>
                                  <span className="text-[10px] font-semibold text-white/80 block uppercase tracking-wider">{room.spec}</span>
                                  <h4 className="font-playfair text-lg font-black text-white leading-tight drop-shadow-sm">
                                    {room.name}
                                  </h4>
                                </div>
                                <div className="text-right">
                                  <span className="text-[9px] text-white/70 block uppercase font-bold">Starts from</span>
                                  <span className="font-playfair text-xl font-black text-amber-300 drop-shadow-sm block">
                                    {room.custom || room.price}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Live Slot Status Bar */}
                            <div className="flex items-center justify-between text-xs text-slate-600 font-bold mb-3">
                              <span className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400">
                                SELECT SHOWTIME:
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {openCount} Open Slots
                              </span>
                            </div>

                            {/* 2-Column Slot Grid */}
                            <div className="grid grid-cols-2 gap-2">
                              {(roomSlots.length > 0 
                                ? roomSlots 
                                : room.slots.map((t, idx) => ({ id: idx, time: t, is_booked: false }))
                              ).map((slotItem: any) => {
                                const displayTime = slotItem.time || slotItem;
                                const isBooked = slotItem.is_booked;

                                if (isBooked) {
                                  return (
                                    <div
                                      key={slotItem.id || displayTime}
                                      className="p-2 sm:p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center cursor-not-allowed opacity-50 flex flex-col items-center justify-center select-none"
                                      title="Already booked"
                                    >
                                      <span className="text-[11px] font-bold text-slate-500 line-through truncate w-full">{displayTime}</span>
                                      <span className="text-[9px] font-black uppercase text-rose-600 mt-0.5">Sold Out</span>
                                    </div>
                                  );
                                }

                                return (
                                  <button
                                    key={slotItem.id || displayTime}
                                    type="button"
                                    onClick={() => {
                                      const slotParam = slotItem.id ? `&slot=${slotItem.id}` : '';
                                      router.push(`/book-now/${room.branchSlug}?date=${date}&theatre=${room.theatreId}${slotParam}`);
                                    }}
                                    className="p-2 sm:p-2.5 rounded-xl border border-emerald-300/80 bg-white hover:border-[#00A2E4] hover:bg-[#F6FAFD] text-center transition-all cursor-pointer shadow-2xs group flex flex-col items-center justify-center active:scale-95"
                                    title={`Reserve ${room.name} at ${displayTime}`}
                                  >
                                    <strong className="text-[11px] sm:text-xs font-black text-[#0B2238] group-hover:text-[#00A2E4] truncate w-full">
                                      {displayTime}
                                    </strong>
                                    <span className="text-[10px] font-extrabold text-[#059669] flex items-center justify-center gap-0.5 mt-0.5">
                                      Book ↗
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Bottom Action Button */}
                          <button
                            type="button"
                            onClick={() => {
                              router.push(`/book-now/${room.branchSlug}?date=${date}&theatre=${room.theatreId}`);
                            }}
                            className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-black text-white bg-[#082052] hover:bg-[#00A2E4] shadow-md transition-all block mt-4 cursor-pointer"
                          >
                            Book {room.name} &rarr;
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Footer Links */}
                <div className="mt-5 pt-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <a href="#slots" className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#00A2E4]">
                    Explore Hall Amenities &amp; Room Photos Below &darr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const targetBranch = branch.includes('BTM') ? 'btm-stage-2' : 'electronic-city';
                      router.push(`/book-now/${targetBranch}?date=${date}`);
                    }}
                    className="font-bold text-[#00A2E4] hover:underline cursor-pointer"
                  >
                    Go to Full Booking Page &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reversible Feature Marquee - PINNED DIRECTLY TO BOTTOM OF HERO */}
          <div 
            ref={heroMarqueeRef}
            className="w-full overflow-hidden flex relative z-10 py-3.5 border-t border-b border-[#00A2E4]/20 bg-[#F6FAFD] mt-6 sm:mt-10 mb-0"
          >
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#00A2E4]">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">⭐ 5.0★ RATED (3,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🎂 HANDCRAFTED GOURMET CAKES</span>
            </div>
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#00A2E4]">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">⭐ 5.0★ RATED (3,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#00A2E4]/30 shadow-2xs">🎂 HANDCRAFTED GOURMET CAKES</span>
            </div>
          </div>
        </section>

        {/* 4. INTRO STATS STRIP - FULL WIDTH WHITE CONTAINER DIRECTLY CONNECTED TO MARQUEE */}
        <div className="w-full bg-white border-b border-slate-200 m-0 p-0">
          <section className="intro-strip bg-white" aria-label="Movie Bash highlights">
            <div><Icon name="users" /><strong>3,500+</strong><span>happy celebrations</span></div>
            <div><Icon name="star" /><strong>5.0 / 5</strong><span>guest rating</span></div>
            <div><Icon name="location" /><strong>2 locations</strong><span>across Bengaluru</span></div>
            <div><Icon name="sparkles" /><strong>100% private</strong><span>zero interruptions</span></div>
          </section>
        </div>

        {/* 5. INTERACTIVE AVAILABILITY & SLOTS SECTION */}
        <section className="availability-section" id="slots">
          <div className="section slot-shell">
            <div className="section-heading centered">
              <div className="eyebrow"><span /> Real-time screen availability <span /></div>
              <h2>Choose your theatre.<br /><em>See every open slot.</em></h2>
              <p>Pick a branch and date, then reserve an available time directly. Weekend slots usually fill 48 hours in advance.</p>
            </div>

            {slotFlashMessage && (
              <div className="mb-6 flex justify-center">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00A2E4] text-white text-xs sm:text-sm font-black shadow-lg shadow-[#00A2E4]/25 animate-pulse">
                  <Icon name="check" size={16} />
                  <span>{slotFlashMessage} &bull; {days[activeDay].full}</span>
                </div>
              </div>
            )}

            {/* Branch Switcher Tabs */}
            <div className="branch-tabs" role="tablist" aria-label="Choose Movie Bash branch">
              {['Electronic City', 'BTM 2nd Stage'].map((name) => (
                <button 
                  className={slotBranch === name ? 'active cursor-pointer' : 'cursor-pointer'} 
                  onClick={() => setSlotBranch(name)} 
                  key={name}
                >
                  <Icon name="location" size={17} />
                  <span>{name}<small>{name === 'Electronic City' ? '3 private theatres' : '4 private theatres · New'}</small></span>
                </button>
              ))}
            </div>

            {/* 6-Day Interactive Date Calendar Strip */}
            <div className="date-strip">
              {days.map((item, index) => (
                <button 
                  className={activeDay === index ? 'active cursor-pointer' : 'cursor-pointer'} 
                  onClick={() => setActiveDay(index)} 
                  key={item.full}
                >
                  <small>{item.label}</small>
                  <strong>{item.day}</strong>
                  <span>{item.month}</span>
                </button>
              ))}
            </div>

            <div className="availability-note">
              <span className="live-dot" />
              Showing open times for <strong>{days[activeDay].full}</strong>
              <span>Times update after WhatsApp confirmation</span>
            </div>

            {/* Slot Room List */}
            <div className="slot-room-list">
              {slotRooms.filter((room) => room.branch === slotBranch).map((room, idx) => (
                <article className="slot-room" key={room.name}>
                  <div className="slot-room-media relative w-full aspect-[4/3] sm:aspect-auto sm:h-full overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none bg-slate-900">
                    <Image 
                      src={room.image} 
                      alt={`${room.name} at Movie Bash ${slotBranch}`} 
                      fill 
                      className="object-cover object-center" 
                      sizes="(max-width: 800px) 100vw, 280px"
                    />
                  </div>

                  <div className="slot-room-info">
                    <div className="room-heading">
                      <div>
                        <h3>{room.name}</h3>
                        <p><Icon name="users" size={14} /> {room.capacity} <span /> {room.spec}</p>
                      </div>
                      <div>
                        <small>Standard from</small>
                        <strong>{room.price}</strong>
                      </div>
                    </div>

                    <div className="room-package-line">
                      <span>Custom {room.custom}</span>
                      <span>Standard {room.price}</span>
                      <a href="#packages">Compare packages</a>
                    </div>

                    {/* Slots Grid with Dynamic Availability (Zero Shifted Badges) */}
                    <div className="slot-grid">
                      {((liveAvailability[room.theatreId] && liveAvailability[room.theatreId].length > 0)
                        ? liveAvailability[room.theatreId]
                        : room.slots.map((t: string, i: number) => ({ id: i, time: t, is_booked: false }))
                      ).map((slotItem: any) => {
                        const displayTime = slotItem.time || slotItem;
                        const isBooked = slotItem.is_booked;

                        if (isBooked) {
                          return (
                            <div
                              key={slotItem.id || displayTime}
                              className="slot cursor-not-allowed opacity-45 bg-slate-100 border-slate-300 select-none flex flex-col items-center justify-center text-center"
                              title="Already reserved"
                            >
                              <strong className="line-through text-slate-500">{displayTime}</strong>
                              <span className="text-rose-600 font-extrabold text-[10px] uppercase text-center mt-0.5">Booked</span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={slotItem.id || displayTime}
                            onClick={() => handleSlotClick(room, displayTime, false, slotItem.id)}
                            className="slot cursor-pointer hover:border-[#00A2E4] flex flex-col items-center justify-center text-center"
                            title={`Reserve ${room.name} at ${displayTime}`}
                          >
                            <strong className="text-center">{displayTime}</strong>
                            <span className="text-[#059669] font-bold text-center mt-0.5">Available</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="slot-disclaimer">
              Availability is confirmed instantly by our team. A ₹500 advance locks your preferred theatre and time.
            </p>
          </div>
        </section>

        {/* 6. WHAT ARE YOU CELEBRATING? (4 PRIMARY CELEBRATIONS WITH SCROLL-CONNECTED CONTINUATION LINE) */}
        <section className="section occasions relative py-16 sm:py-24 bg-[#FAFAF8] overflow-hidden" id="experiences">
          {/* Subtle Background Ambience */}
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />
          <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-[#00A2E4]/5 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#082052]/5 border border-[#082052]/15 text-[#082052] text-xs font-black uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00A2E4] animate-pulse" />
                <span>Moments Worth Making Special</span>
              </div>
              <h2 className="font-playfair text-3xl sm:text-5xl font-black text-[#082052] tracking-tight">
                What are you <em className="italic text-[#00A2E4] font-normal">celebrating?</em>
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Step into a handcrafted cinema setting designed exclusively for your special milestone. We take care of décor, screening, lighting, and surprise cakes.
              </p>
            </div>

            {/* Vertical Scroll-Connected Timeline with Dynamic Filling Glow Line */}
            <div ref={occasionsTimelineRef} className="relative">
              {/* Background Base Line (Desktop Center) */}
              <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 bg-slate-200/80 rounded-full pointer-events-none" />
              {/* Dynamic Scroll Fill Line (Desktop Center) */}
              <div 
                className="hidden md:block absolute left-1/2 top-10 w-1 -translate-x-1/2 bg-gradient-to-b from-[#00A2E4] via-[#00A2E4] to-[#082052] rounded-full pointer-events-none shadow-[0_0_14px_rgba(0,162,228,0.9)] transition-all duration-150 ease-out"
                style={{ height: `${Math.min(100, Math.max(0, timelineProgress * 100))}%` }}
              />

              {/* Background Base Line (Mobile Left) */}
              <div className="md:hidden absolute left-5 top-8 bottom-8 w-1 bg-slate-200/80 rounded-full pointer-events-none" />
              {/* Dynamic Scroll Fill Line (Mobile Left) */}
              <div 
                className="md:hidden absolute left-5 top-8 w-1 bg-gradient-to-b from-[#00A2E4] via-[#00A2E4] to-[#082052] rounded-full pointer-events-none shadow-[0_0_14px_rgba(0,162,228,0.9)] transition-all duration-150 ease-out"
                style={{ height: `${Math.min(100, Math.max(0, timelineProgress * 100))}%` }}
              />

              {/* 4 Primary Occasions */}
              <div className="space-y-14 sm:space-y-24">
                {[
                  {
                    step: '01',
                    slug: 'birthday-party',
                    title: 'Grand Birthday Party',
                    tagline: 'Golden balloon arch backdrop, custom name neon lights, fog entry, and special cake-cutting moment with Dolby sound.',
                    badge: 'Top Pick for Birthdays',
                    image: '/images/celebration_2.webp',
                    inclusions: ['🎂 500g Cake Included', '🌫️ Dry Ice Fog Entry', '🎈 Signature Balloon Décor', '✨ Personalized Neon LED Name', '🎬 4K Laser Screening'],
                    alt: 'Birthday celebration at Movie Bash private theatre',
                    threshold: 0.1
                  },
                  {
                    step: '02',
                    slug: 'date-and-proposal',
                    title: 'Romantic Proposal & Date Night',
                    tagline: 'An intimate candlelit ambience with rose petals, private couple recliners, heart pathway, and cold pyros for a proposal they will remember forever.',
                    badge: 'Most Popular for Couples',
                    image: '/images/couple_1.webp',
                    inclusions: ['🌹 Rose Petal Heart Pathway', '🕯️ Ambient Candle Décor', '🎆 Cold Spark Pyros', '💑 Cozy Couple Recliners', '🍿 Gourmet Popcorn & Drinks'],
                    alt: 'Romantic proposal setup at Movie Bash',
                    threshold: 0.35
                  },
                  {
                    step: '03',
                    slug: 'anniversary',
                    title: 'Milestone Anniversary Celebration',
                    tagline: 'Celebrate years of togetherness with nostalgic photo slideshow on 150″ 4K cinema screen, fairy lights, and your couple song on Dolby Atmos.',
                    badge: 'Memories to Cherish',
                    image: '/images/couple_6.webp',
                    inclusions: ['🎞️ Memory Slideshow on 150″', '🥂 Anniversary Special Setup', '🎂 Celebration Cake', '🎶 Custom Spotify Playlist', '📸 Photo & Video Assist'],
                    alt: 'Anniversary celebration at Movie Bash private theatre',
                    threshold: 0.60
                  },
                  {
                    step: '04',
                    slug: 'bachelorette-party',
                    title: 'Bride-to-Be & Bachelorette Party',
                    tagline: 'The ultimate girl squad private bash with bridal photo booth, party props, music dance floor, signature sash, and full private cinema.',
                    badge: 'Girls Night Out',
                    image: '/images/celebration_5.webp',
                    inclusions: ['👰 Bride-to-Be Sash & Tiara', '📸 Insta-Worthy Photo Booth', '🎉 Party Props & Poppers', '🔊 Dance Playlist Sound', '✨ Custom Neon Backdrop'],
                    alt: 'Bachelorette party at Movie Bash',
                    threshold: 0.85
                  }
                ].map((item, index) => {
                  const isEven = index % 2 === 1;
                  const isPassed = timelineProgress >= item.threshold;

                  return (
                    <div 
                      key={item.slug} 
                      className="relative grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 items-center group pl-12 md:pl-0"
                    >
                      {/* Milestone Number Badge (Timeline Node) with Dynamic Highlight */}
                      <div className={`absolute left-0 md:left-1/2 top-4 md:top-1/2 -translate-y-1/2 -translate-x-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full flex items-center justify-center font-playfair font-black text-sm sm:text-base transition-all duration-500 ${
                        isPassed 
                          ? 'bg-[#00A2E4] text-white ring-4 ring-[#00A2E4]/30 scale-110 shadow-lg shadow-[#00A2E4]/40' 
                          : 'bg-white border-2 border-slate-300 text-slate-500 shadow-md'
                      }`}>
                        {item.step}
                      </div>

                      {/* Photo Card */}
                      <div className={`w-full ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                        <div className={`relative w-full h-[240px] sm:h-[320px] rounded-3xl overflow-hidden border transition-all duration-500 bg-slate-900 ${
                          isPassed 
                            ? 'shadow-2xl border-[#00A2E4]/40 ring-1 ring-[#00A2E4]/20' 
                            : 'shadow-xl border-slate-200'
                        }`}>
                          <Image
                            src={item.image}
                            alt={item.alt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 500px"
                          />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className={`space-y-4 ${isEven ? 'md:order-1 md:text-right' : 'md:order-2 md:text-left'}`}>
                        <div className={`flex items-center gap-2 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                            isPassed ? 'text-[#00A2E4]' : 'text-slate-400'
                          }`}>
                            Celebration Option {item.step}
                          </span>
                        </div>

                        <h3 className="font-playfair text-2xl sm:text-3xl font-black text-[#082052] leading-tight">
                          {item.title}
                        </h3>

                        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                          {item.tagline}
                        </p>

                        {/* Inclusions Chips */}
                        <div className={`flex flex-wrap gap-2 pt-1 ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          {item.inclusions.map((inc) => (
                            <span 
                              key={inc} 
                              className={`px-3 py-1.5 rounded-xl bg-white border text-slate-700 text-xs font-bold shadow-2xs transition-colors ${
                                isPassed ? 'border-[#00A2E4]/40' : 'border-slate-200'
                              }`}
                            >
                              {inc}
                            </span>
                          ))}
                        </div>

                        {/* CTA Button */}
                        <div className={`pt-2 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}>
                          <button
                            type="button"
                            onClick={() => {
                              const occasionParam = encodeURIComponent(item.title);
                              router.push(`/book-now/btm-stage-2?occasion=${occasionParam}`);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#082052] hover:bg-[#00A2E4] text-white font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#082052]/20 hover:shadow-[#00A2E4]/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                          >
                            <span>Book {item.title}</span>
                            <span>&rarr;</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Section Reassurance */}
            <div className="mt-16 text-center">
              <div className="inline-flex flex-wrap items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-xs text-xs font-bold text-slate-700">
                <span className="text-emerald-600 flex items-center gap-1 font-black">✓ No Advance Loss on Rescheduling</span>
                <span className="text-slate-300">•</span>
                <span>🎂 Custom Flavors Available</span>
                <span className="text-slate-300">•</span>
                <span>✨ 100% Private Venue For Your Group</span>
              </div>
            </div>
          </div>
        </section>

        
        {/* ─── WHY CELEBRATE AT MOVIEBASH? (EXACT BINGE TOWN VALUE PROPOSITION SECTION) ─── */}
        <section className="py-14 sm:py-20 bg-white border-y border-slate-200/80 relative overflow-hidden" id="why-celebrate">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E6F3FB] border border-[#00A2E4]/30 text-[#00A2E4] text-xs font-black uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00A2E4] animate-pulse" />
                <span>The MovieBash Advantage</span>
              </div>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-black text-[#082052] tracking-tight">
                Why Celebrate at MovieBash?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 font-normal max-w-2xl mx-auto">
                Discover what makes our private cinema celebrations unmatched across Bengaluru.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  🔒
                </div>
                <h3 className="text-lg font-black text-[#082052]">100% Privacy &amp; Soundproofing</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Zero strangers, zero disturbances. Enjoy exclusive, soundproof private screening rooms reserved only for your loved ones. Complete privacy guaranteed with strict no-camera policy.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ 100% Private Screening</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  ✨
                </div>
                <h3 className="text-lg font-black text-[#082052]">Stunning Free Surprise Decor</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Every booking includes free themed balloon setup, glowing LED neon signs (&ldquo;Happy Birthday&rdquo;, &ldquo;Marry Me&rdquo;, &ldquo;Love&rdquo;), and personalized display screen messages.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ Free Decor Included</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  🎬
                </div>
                <h3 className="text-lg font-black text-[#082052]">4K Laser Screen &amp; Dolby Sound</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Huge 135&Prime; to 180&Prime; projection displays paired with 1000W 5.1/7.1 Dolby Atmos and JBL surround sound setups for an authentic blockbuster theater feel.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ 4K Laser + JBL Sound</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  🍕
                </div>
                <h3 className="text-lg font-black text-[#082052]">Food &amp; Outside Snacks Welcome</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Order your favorite foods from Swiggy or Zomato directly to your screening suite, bring home-cooked food, or choose from our in-house gourmet snacks menu. Zero corkage!
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ Outside Food Allowed</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  💨
                </div>
                <h3 className="text-lg font-black text-[#082052]">Fog Entry &amp; Cold Pyro Sparklers</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Make your entrance unforgettable with magical dry-ice fog billowing across the room and safe, smokeless indoor cold fire fireworks for jaw-dropping photo &amp; video moments.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ Cinematic Special FX</span>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-3xl bg-[#F8F0E5]/35 border border-slate-200 hover:border-[#00A2E4] hover:shadow-lg transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#082052] text-[#00A2E4] flex items-center justify-center text-2xl shadow-md">
                  💳
                </div>
                <h3 className="text-lg font-black text-[#082052]">Pay Only ₹500 Advance</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  Zero risk booking. Secure your exclusive private theatre date and showtime with just a ₹500 token advance. The remaining balance is easily payable at the venue upon arrival.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span>✓ Only ₹500 to Reserve</span>
                </div>
              </div>
            </div>

            {/* Quick Action Bar (Binge Town Style) */}
            <div className="mt-10 p-5 rounded-2xl bg-[#082052] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <span className="text-sm font-bold block">Ready to surprise your special someone?</span>
                <span className="text-xs text-[#F8F0E5]/80">Talk to our celebration planner now or lock your slot online.</span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="tel:+919902923656"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#082052] font-black text-xs transition-colors flex items-center gap-1.5"
                >
                  <Icon name="phone" size={14} />
                  <span>Call +91 99029 23656</span>
                </a>
                <a
                  href="#slots"
                  className="px-5 py-2.5 rounded-xl bg-[#00A2E4] hover:bg-[#0072AE] text-white font-black text-xs transition-colors"
                >
                  <span>Check Slots →</span>
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* 6B. CELEBRATION ADD-ONS — SIMPLE IMAGE TILES */}
        {(!activeAddonIds || activeAddonIds.length > 0) && (
          <section className="section addons-section" id="addons">
            <div className="section-heading centered">
              <div className="eyebrow"><span /> Celebration add-ons <span /></div>
              <h2>Make it <em>yours.</em></h2>
              <p>Optional extras you can add while booking, priced exactly as they appear in the booking form. Only the add-ons that are currently available are shown.</p>
            </div>

            <div className="addon-card-grid">
              {addonTiles
                .filter((tile) => !activeAddonIds || activeAddonIds.includes(tile.addonId))
                .map((tile) => (
                <Link href={tile.href} key={tile.title} className="addon-card">
                  <Image
                    src={tile.image}
                    alt={tile.title}
                    fill
                    sizes="(max-width: 480px) 92vw, (max-width: 760px) 46vw, (max-width: 1024px) 31vw, 23vw"
                    className="addon-card-img"
                  />
                  <span className="addon-card-veil" aria-hidden="true" />
                  <span className="addon-card-price">{tile.price}</span>
                  <div className="addon-card-body">
                    <h3>{tile.title}</h3>
                    <p>{tile.desc}</p>
                  </div>
                  <span className="addon-card-cta" aria-hidden="true">
                    <Icon name="arrow" size={16} />
                  </span>
                </Link>
              ))}
            </div>
            <p className="addons-note">Cake flavours and add-ons are chosen while booking. Anything switched off by our team is hidden automatically.</p>
          </section>
        )}

        {/* 7. SIGNATURE CELEBRATION PACKAGE BANNER (LUXURY BLACK CARD MATCHING FIGMA & USER DESIGN) */}
        <section className="section package-section" id="signature-celebration">
          <div className="package-card">
            <div className="package-copy">
              <div className="eyebrow light"><span /> The signature celebration</div>
              <h2>One room.<br />Everything <em>included.</em></h2>
              <p>We bring the theatre, décor and little details together so your celebration feels effortless from the moment you arrive.</p>
              
              <div className="package-price">
                <small>Complete celebration packages from</small>
                <strong>₹1,499</strong>
              </div>

              <Link href="/book-now?package=standard" className="button cream-button">
                Explore the package <Icon name="arrow" size={18} />
              </Link>
            </div>

            <div className="package-includes">
              {[
                ['Private theatre', 'play'],
                ['Premium decoration', 'sparkles'],
                ['Celebration cake', 'cake'],
                ['Fog entry', 'music'],
                ['Name board', 'heart'],
                ['Photos & memories', 'camera'],
              ].map(([label, icon]) => (
                <div key={label}>
                  <span><Icon name={icon as IconName} /></span>
                  {label}
                  <Icon name="check" size={17} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. 3-TIER PRICING & ADD-ONS (TARGET OF NAVBAR 'PACKAGES' LINK) */}
        <section className="section package-pricing scroll-mt-24" id="packages">
          <div className="section-heading centered">
            <div className="eyebrow"><span /> Clear package options <span /></div>
            <h2>Everything included.<br /><em>No last-minute surprises.</em></h2>
            <p>Choose a ready-made experience or build your own. Final price depends on your theatre and selected add-ons.</p>
          </div>

          <div className="pricing-grid">
            {packageTiers.map((tier) => (
              <article className={tier.featured ? 'pricing-card featured' : 'pricing-card'} key={tier.name}>
                <p>{tier.name} package</p>
                <h3>{tier.price}</h3>
                <small>{tier.note}</small>
                
                <div>
                  {tier.features.map((feature) => (
                    <span key={feature}><Icon name="check" size={15} /> {feature}</span>
                  ))}
                </div>

                <Link href={`/book-now?package=${tier.name.toLowerCase()}`} className="cursor-pointer">
                  Choose {tier.name} <Icon name="arrow" size={17} />
                </Link>
              </article>
            ))}
          </div>

        </section>

        {/* 9. PICK YOUR PRIVATE THEATRE */}
        <section className="section theatres" id="theatres">
          <div className="section-heading heading-row mb-6 sm:mb-8">
            <div>
              <div className="eyebrow"><span /> Your space, your way</div>
              <h2>Choose your <em>private theatre</em></h2>
            </div>
            <p>From an intimate date for two to a full family celebration, there’s a room waiting for your story.</p>
          </div>

          {/* Interactive Branch Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-8">
            <button
              type="button"
              onClick={() => {
                setBranch('Electronic City');
                if (showHeroSlots) setSlotBranch('Electronic City');
              }}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                branch === 'Electronic City'
                  ? 'bg-[#00A2E4] text-white shadow-md shadow-[#00A2E4]/25 ring-2 ring-[#00A2E4]/30 scale-[1.02]'
                  : 'bg-white hover:bg-[#F8F0E5]/60 text-stone-700 border border-stone-200'
              }`}
            >
              <span>📍 Electronic City (3 Theatres)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setBranch('BTM 2nd Stage');
                if (showHeroSlots) setSlotBranch('BTM 2nd Stage');
              }}
              className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5 shadow-xs ${
                branch === 'BTM 2nd Stage'
                  ? 'bg-[#00A2E4] text-white shadow-md shadow-[#00A2E4]/25 ring-2 ring-[#00A2E4]/30 scale-[1.02]'
                  : 'bg-white hover:bg-[#F8F0E5]/60 text-stone-700 border border-stone-200'
              }`}
            >
              <span>📍 BTM 2nd Stage (4 Theatres)</span>
            </button>
          </div>

          {/* Dynamic 3-Column Theatre Cards Grid (Clean 3 on Top + 4th Centered on Next Row for BTM) */}
          {(() => {
            const currentTheatres = theatres.filter(t => 
              branch === 'BTM 2nd Stage' 
                ? (t.branch === 'BTM 2nd Stage' || t.branchSlug === 'btm-stage-2' || t.theatreId >= 4)
                : (t.branch === 'Electronic City' || t.branchSlug === 'electronic-city' || t.theatreId <= 3)
            );

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-6">
                {currentTheatres.map((theatre, i) => {
                  const isFourthCard = currentTheatres.length === 4 && i === 3;
                  return (
                    <article 
                      className={`theatre-card group flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#082052]/10 shadow-[0_1px_2px_rgba(8,32,82,0.04)] hover:shadow-[0_18px_40px_rgba(8,32,82,0.10)] hover:-translate-y-1 transition-all ${
                        isFourthCard ? 'md:col-start-2' : ''
                      }`} 
                      key={theatre.name}
                    >
                      <div className="theatre-image relative w-full aspect-[4/3] bg-stone-900 overflow-hidden">
                        <Image 
                          src={theatre.image} 
                          alt={`${theatre.name} private cinema`} 
                          fill 
                          loading="lazy"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-500" 
                          sizes="(max-width: 800px) 100vw, 33vw"
                        />
                        {theatre.meta && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#082052] text-[9.5px] font-black uppercase tracking-wider shadow-sm border border-[#082052]/10 whitespace-nowrap">
                              {theatre.meta}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-col justify-between flex-1 space-y-3.5 text-left">
                        <div>
                          <h3 className="text-lg sm:text-xl font-black text-[#082052] tracking-tight">{theatre.name}</h3>
                          <p className="text-[11px] sm:text-xs text-slate-500 font-bold mt-0.5">
                            📍 {theatre.location || (theatre.branchSlug === 'btm-stage-2' ? 'BTM 2nd Stage' : 'Electronic City')}
                          </p>
                        </div>

                        <p className="text-[12px] font-semibold text-slate-600 leading-relaxed">
                          {(theatre as any).capacity || (theatre.theatreId === 1 || theatre.theatreId === 4 ? 'Up to 4 guests' : theatre.theatreId === 2 || theatre.theatreId === 5 ? 'Up to 6 guests' : theatre.theatreId === 3 ? 'Up to 10 guests' : 'Up to 8 guests')}
                          <span className="text-slate-300 mx-1">·</span> 4K laser screen
                          <span className="text-slate-300 mx-1">·</span> Dolby Atmos
                          <span className="text-slate-300 mx-1">·</span> soundproof
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">Starts from</span>
                            <span className="text-lg font-black text-[#082052] leading-none">
                              {theatre.dealPrice}
                              <span className="text-[11px] text-slate-500 font-medium ml-1">/ 3 hrs</span>
                            </span>
                          </div>
                          <Link
                            href={`/book-now/${theatre.branchSlug}?theatre=${theatre.theatreId}`}
                            className="py-2.5 px-5 rounded-full bg-[#082052] hover:bg-[#0B2238] text-white font-black text-xs transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
                          >
                            Book this room →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            );
          })()}
        </section>

        {/* ─── HOW IT WORKS IN 4 STEPS (BINGE TOWN ARCHITECTURE + LABAN SPOT ELEGANCE) ─── */}
        <section className="py-12 sm:py-20 bg-[#F6FAFD] border-t border-sky-100/80 relative overflow-hidden" id="how-it-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00A2E4]/10 border border-[#00A2E4]/30 text-[#0072AE] text-xs font-black uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00A2E4] animate-pulse" />
                <span>Seamless 4-Step Booking</span>
              </div>
              <h2 className="font-['Playfair_Display'] text-3xl sm:text-5xl font-black text-[#0B2238] tracking-tight">
                How It Works.<br />
                <em className="italic text-[#00A2E4] font-normal">From slot booking to celebration.</em>
              </h2>
              <p className="mt-3 text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                Planning your private celebration at Movie Bash takes less than 2 minutes with instant confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  step: '01',
                  title: 'Select Screen & Branch',
                  desc: 'Pick from 7 private theatres across Electronic City and BTM 2nd Stage tailored for 2 to 20 guests.',
                  tag: 'Couple or Group',
                  icon: '🎬'
                },
                {
                  step: '02',
                  title: 'Choose Date & Time Slot',
                  desc: 'View live real-time open slots for morning, afternoon, sunset golden hour, or midnight shows.',
                  tag: 'Live Availability',
                  icon: '⏰'
                },
                {
                  step: '03',
                  title: 'Customize Decor & Add-ons',
                  desc: 'Select cake flavour, dramatic fog entry, cold pyro sparklers, LED letters, and pro photography.',
                  tag: 'Personalized Setup',
                  icon: '🎂'
                },
                {
                  step: '04',
                  title: 'Walk In & Celebrate',
                  desc: 'Your private cinema suite is fully air-conditioned, decorated, soundproofed, and ready when you arrive.',
                  tag: 'Zero Stress',
                  icon: '✨'
                }
              ].map((s) => (
                <div 
                  key={s.step}
                  className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-[0_12px_32px_rgba(11,34,56,0.06)] hover:shadow-[0_20px_48px_rgba(0,162,228,0.14)] hover:-translate-y-1 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-11 h-11 rounded-2xl bg-[#00A2E4]/10 text-[#0072AE] font-black text-sm flex items-center justify-center font-mono group-hover:bg-[#00A2E4] group-hover:text-white transition-colors">
                        {s.step}
                      </span>
                      <span className="text-2xl">{s.icon}</span>
                    </div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0072AE] mb-1">
                      {s.tag}
                    </span>
                    <h3 className="font-['Playfair_Display'] text-lg sm:text-xl font-bold text-[#0B2238] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW CONTENT STREAMING WORKS (OFFICIAL OTT LOGOS & ENTERTAINMENT HUB) ─── */}
        <section className="py-14 sm:py-20 bg-white border-t border-sky-100/80 relative overflow-hidden" id="how-streaming-works">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#00A2E4]/10 border border-[#00A2E4]/30 text-[#0072AE] text-xs font-black uppercase tracking-wider mb-3">
                <span className="w-2 h-2 rounded-full bg-[#00A2E4] animate-pulse" />
                <span>Unlimited Entertainment Freedom</span>
              </div>
              <h2 className="font-playfair text-3xl sm:text-5xl font-black text-[#082052] tracking-tight">
                Stream Anything You Love.<br />
                <em className="italic text-[#00A2E4] font-normal">On a giant 150-inch 4K laser cinema screen.</em>
              </h2>
              <p className="mt-3 text-xs sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
                You control the screen! Watch movies, binge favorite series, show personal surprise videos, or play games with full privacy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              
              {/* Card 1: Official OTT Streaming Apps */}
              <div className="bg-[#F6FAFD] rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-[0_8px_24px_rgba(11,34,56,0.04)] hover:shadow-[0_16px_40px_rgba(0,162,228,0.10)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center justify-center text-xl mb-4">
                    <span>🍿</span>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-[#082052] mb-2 min-h-[28px] flex items-center">
                    All OTT Apps Ready
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 min-h-[42px]">
                    Log in directly to your personal accounts on our 4K Smart Cinema setup with 150″ laser display:
                  </p>
                </div>

                {/* Official Brand Badges In Bottom (Clean, Bold, Aesthetic Badges) */}
                <div className="pt-4 border-t border-slate-200/60 mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                    Official Streaming Supported
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-600 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-rose-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                      Netflix 4K
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-[#00A8E1] font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-sky-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#00A8E1]" />
                      Prime Video
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-[#113CCF] font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-blue-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#113CCF]" />
                      Disney+ Hotstar
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-red-200 text-[#FF0000] font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-red-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#FF0000]" />
                      YouTube 4K
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-900 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-slate-500 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-slate-900" />
                      Apple TV+
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-amber-200 text-amber-700 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-amber-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-amber-600" />
                      SonyLIV
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-purple-200 text-[#8230C6] font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-purple-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#8230C6]" />
                      Zee5
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-orange-200 text-[#FF6700] font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-orange-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-[#FF6700]" />
                      Aha Video
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Plug & Play Personal Videos (HDMI) */}
              <div className="bg-[#F6FAFD] rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-[0_8px_24px_rgba(11,34,56,0.04)] hover:shadow-[0_16px_40px_rgba(0,162,228,0.10)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center justify-center text-xl mb-4">
                    <span>💻</span>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-[#082052] mb-2 min-h-[28px] flex items-center">
                    Plug &amp; Play HDMI / Phone
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 min-h-[42px]">
                    Connect your Laptop, iPhone, Android, or Pen Drive via our high-speed 4K HDMI &amp; Type-C cables:
                  </p>
                </div>

                {/* Compatibility Badges In Bottom */}
                <div className="pt-4 border-t border-slate-200/60 mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                    Supported Connections
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                      💻 MacBook &amp; Windows HDMI
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                      📱 iPhone 15/16 Type-C / Lightning
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                      ⚡ Android Screen Mirroring
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                      💾 USB Pen Drive Videos
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs flex items-center gap-1.5">
                      🎞️ Custom Photo Slideshows
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 3: Bluetooth Music & Console Gaming */}
              <div className="bg-[#F6FAFD] rounded-3xl p-6 sm:p-7 border border-sky-100 shadow-[0_8px_24px_rgba(11,34,56,0.04)] hover:shadow-[0_16px_40px_rgba(0,162,228,0.10)] transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white border border-sky-100 shadow-xs flex items-center justify-center text-xl mb-4">
                    <span>🎵</span>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-[#082052] mb-2 min-h-[28px] flex items-center">
                    Bluetooth Music &amp; Gaming
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4 min-h-[42px]">
                    Stream your favorite Spotify playlist during cake cutting, or hook up your gaming console:
                  </p>
                </div>

                {/* Badges In Bottom */}
                <div className="pt-4 border-t border-slate-200/60 mt-auto">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2.5">
                    Audio &amp; Console Features
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-700 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-emerald-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Spotify Hi-Fi Audio
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-extrabold text-xs shadow-2xs flex items-center gap-1.5 hover:border-indigo-400 transition-colors">
                      <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      PS5 &amp; Xbox Console Ready
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs">
                      🔊 Dolby 7.1 Surround Sound
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs">
                      🎂 Cake-Cutting Playlists
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-bold text-xs shadow-2xs">
                      🎮 Ultra-Low Latency Mode
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 10. LOCATIONS */}
        <section className="section locations" id="locations">
          <div className="location-image relative">
            <Image 
              src="/images/ambience_8.webp" 
              alt="Movie Bash BTM 2nd Stage private theatre" 
              fill 
              className="object-cover" 
              sizes="(max-width: 800px) 100vw, 50vw"
            />
            <div className="experience-note">
              <span>4K</span>
              <p>Crystal-clear projection and immersive Dolby sound</p>
            </div>
          </div>

          <div className="location-copy">
            <div className="eyebrow"><span /> Close to your celebration</div>
            <h2>Two beautiful spaces<br /><em>in Bengaluru.</em></h2>
            <p>Easy to reach, private from start to finish, and prepared with care before you arrive.</p>

            <div className="location-list">
              <div>
                <span>01</span>
                <div>
                  <strong>Electronic City</strong>
                  <p>Beside Sri Vishnu Grand · 3 private theatres</p>
                </div>
                <a 
                  href="https://maps.google.com/?q=Movie+Bash+Electronic+City+Bengaluru" 
                  target="_blank" 
                  rel="noreferrer"
                  title="View on Google Maps"
                >
                  <Icon name="arrow" />
                </a>
              </div>

              <div>
                <span>02</span>
                <div>
                  <strong>BTM 2nd Stage</strong>
                  <p>Near Udupi Garden Signal · 4 private theatres</p>
                </div>
                <a 
                  href="https://maps.google.com/?q=Movie+Bash+BTM+2nd+Stage+Bengaluru" 
                  target="_blank" 
                  rel="noreferrer"
                  title="View on Google Maps"
                >
                  <Icon name="arrow" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 11. REAL GUEST MOMENTS PHOTO GALLERY */}
        <section className="gallery-section py-8 sm:py-16 overflow-hidden">
          <div className="section max-w-7xl mx-auto px-4 sm:px-6">
            <div className="section-heading centered max-w-2xl mx-auto text-center mb-8 sm:mb-12">
              <div className="eyebrow flex items-center justify-center gap-1.5 text-xs font-bold text-[#00A2E4] uppercase tracking-wider mb-2.5">
                <span className="w-2 h-2 rounded-full bg-[#00A2E4] animate-pulse" /> Real Movie Bash celebrations
              </div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Playfair_Display'] font-black text-[#0B2238] tracking-tight">
                See How Moments <em className="italic text-[#00A2E4] font-normal">Come to Life.</em>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto mt-2.5 leading-relaxed">
                Real, unedited setups from birthdays, anniversaries, proposals, baby showers and private movie nights.
              </p>
            </div>

            {/* Desktop View: Classic 4-Column Editorial Masonry Grid */}
            <div className="hidden md:grid gallery-grid">
              {gallery.map(([image, label], index) => (
                <figure className={index === 0 || index === 5 ? 'wide relative' : 'relative'} key={image}>
                  <Image 
                    src={image} 
                    alt={label} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 800px) 50vw, 25vw"
                  />
                  <figcaption>{label}</figcaption>
                </figure>
              ))}
            </div>

            {/* Mobile View: Exclusive 3D Kinetic Card Stage (Zero Duplicate Images, Zero Vertical Stacking) */}
            <div 
              className="block md:hidden relative pt-2 pb-4 select-none"
              onTouchStart={handleMomentTouchStart}
              onTouchMove={handleMomentTouchMove}
              onTouchEnd={handleMomentTouchEnd}
            >
              {/* Stage Container: Shows 1 Centered Active Hero Card with Peeking Adjacent Cards */}
              <div className="relative w-full h-[230px] flex items-center justify-center overflow-hidden">
                {gallery.map(([image, label], index) => {
                  const total = gallery.length;
                  // Compute circular offset (-1 = prev, 0 = active, 1 = next, others hidden)
                  let offset = (index - activeMomentIdx + total) % total;
                  if (offset > total / 2) offset -= total;

                  const isActive = offset === 0;
                  const isPrev = offset === -1;
                  const isNext = offset === 1;
                  const isVisible = isActive || isPrev || isNext;

                  if (!isVisible) return null;

                  let transformStyle = '';
                  let zIndex = 10;
                  let opacity = 'opacity-100';

                  if (isActive) {
                    transformStyle = 'translateX(0%) scale(1)';
                    zIndex = 20;
                  } else if (isPrev) {
                    transformStyle = 'translateX(-78%) scale(0.85) rotate(-3deg)';
                    zIndex = 10;
                    opacity = 'opacity-40';
                  } else if (isNext) {
                    transformStyle = 'translateX(78%) scale(0.85) rotate(3deg)';
                    zIndex = 10;
                    opacity = 'opacity-40';
                  }

                  return (
                    <div
                      key={image}
                      onClick={() => {
                        if (isPrev) prevMoment();
                        if (isNext) nextMoment();
                      }}
                      style={{ transform: transformStyle }}
                      className={`absolute w-[82vw] max-w-[320px] h-[220px] rounded-3xl overflow-hidden transition-all duration-500 ease-out cursor-pointer ${
                        isActive
                          ? 'ring-2 ring-[#00A2E4] shadow-[0_20px_45px_rgba(0,162,228,0.22)]'
                          : 'border border-stone-200/80 shadow-md'
                      } ${opacity}`}
                    >
                      <Image
                        src={image}
                        alt={label}
                        fill
                        priority={isActive}
                        className={`object-cover object-center transition-transform duration-700 ${
                          isActive ? 'scale-105' : 'scale-100'
                        }`}
                        sizes="320px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                      {/* Top Badge: Counter + Live Celebration Label */}
                      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
                        <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[#ffd46e] text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#00A2E4] animate-pulse" />
                          <span>Real Celebration</span>
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-black tracking-widest">
                          0{index + 1} / 0{total}
                        </span>
                      </div>

                      {/* Bottom Caption */}
                      <div className="absolute inset-x-0 bottom-0 p-4 z-10 text-left">
                        <h4 className="text-white font-['Playfair_Display'] text-base font-bold capitalize leading-snug drop-shadow-md">
                          {label}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Interactive Bar: Prev/Next Controls + 6 Active Indicator Pills */}
              <div className="flex items-center justify-between px-3 mt-4 max-w-xs mx-auto">
                <button
                  type="button"
                  onClick={prevMoment}
                  aria-label="Previous moment"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#00A2E4] text-stone-700 hover:text-white border border-stone-200 shadow-sm flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-sm"
                >
                  ←
                </button>

                {/* 6 Clickable Dynamic Progress Pills (Exactly 6 Unique Items) */}
                <div className="flex items-center gap-1.5">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveMomentIdx(i)}
                      aria-label={`Go to moment ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === activeMomentIdx
                          ? 'w-7 bg-[#00A2E4] shadow-xs'
                          : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextMoment}
                  aria-label="Next moment"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#00A2E4] text-stone-700 hover:text-white border border-stone-200 shadow-sm flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-sm"
                >
                  →
                </button>
              </div>

              {/* Gesture Hint */}
              <p className="text-center text-[10px] text-stone-500 font-medium mt-2">
                Swipe left or right to explore setups &bull; Auto-plays smoothly
              </p>
            </div>
          </div>
        </section>

        {/* 12. DYNAMIC AUTO-ROTATING GUEST REVIEWS */}
        <section className="testimonial relative overflow-hidden group">
          <div className="quote-mark select-none pointer-events-none">“</div>
          
          {/* Previous / Next Arrow Controls */}
          <button
            type="button"
            onClick={prevReview}
            aria-label="Previous review"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#00A2E4]/25 bg-white/95 hover:bg-[#00A2E4] hover:text-white hover:border-[#00A2E4] text-stone-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
          >
            <span className="text-xl font-bold leading-none -mt-0.5">&lsaquo;</span>
          </button>

          <button
            type="button"
            onClick={nextReview}
            aria-label="Next review"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#00A2E4]/25 bg-white/95 hover:bg-[#00A2E4] hover:text-white hover:border-[#00A2E4] text-stone-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
          >
            <span className="text-xl font-bold leading-none -mt-0.5">&rsaquo;</span>
          </button>

          <div className="max-w-3xl mx-auto px-6 sm:px-10 relative z-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="stars large text-amber-400 tracking-widest">{guestReviews[reviewIndex].stars}</div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                {guestReviews[reviewIndex].tag}
              </span>
            </div>

            <blockquote key={reviewIndex} className="transition-all duration-500 min-h-[90px] flex items-center justify-center font-['Playfair_Display'] text-xs sm:text-[13px] md:text-sm font-medium italic text-stone-700 leading-relaxed max-w-2xl mx-auto px-4 text-center">
              &ldquo;{guestReviews[reviewIndex].quote}&rdquo;
            </blockquote>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <strong className="text-ink font-bold">{guestReviews[reviewIndex].author}</strong>
              <span className="w-4 h-0.5 bg-[#00A2E4] rounded-full inline-block" />
              <span className="text-slate-600 font-medium">{guestReviews[reviewIndex].occasion}</span>
            </p>

            {/* Clickable Dots Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {guestReviews.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setReviewIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === reviewIndex ? 'w-7 bg-[#00A2E4]' : 'w-2 bg-stone-300 hover:bg-stone-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* 13. FAQ ACCORDION */}
        <section className="section faq-section" id="faq">
          <div className="faq-intro">
            <div className="eyebrow"><span /> Good to know</div>
            <h2>Questions, <em>answered.</em></h2>
            <p>Still wondering about something?</p>
            <a href={WHATSAPP_BASE} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" /> Chat with our team
            </a>
          </div>

          <div className="faq-list">
            {faqs.map(([question, answer], i) => (
              <button 
                className={openFaq === i ? 'faq-item open cursor-pointer' : 'faq-item cursor-pointer'} 
                key={question} 
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)} 
                aria-expanded={openFaq === i}
              >
                <span>{question}</span>
                <i>{openFaq === i ? '−' : '+'}</i>
                <p>{answer}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 14. FIGMA CORAL BOOKING CTA SECTION (EXACT MATCH TO IMAGE 3) */}
        <section className="relative py-20 sm:py-28 bg-gradient-to-br from-[#082052] via-[#0B2238] to-[#041224] text-white overflow-hidden" id="check-slots">
          {/* Floating 3D Soft Spheres matching Image 3 */}
          <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-gradient-to-b from-[#00A2E4]/30 to-transparent blur-xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-amber-400/20 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute top-1/2 right-6 w-32 h-32 rounded-full bg-white/10 blur-md pointer-events-none hidden sm:block" />
          
          {/* Subtle Grid Lines Overlay matching Figma */}
          <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#fff_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading, Subtitle & Trust Points */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-block text-[11px] font-black uppercase tracking-[0.25em] text-white/90 border border-white/25 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-xs">
                YOUR SCREEN IS READY
              </span>

              <h2 className="font-playfair text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08]">
                Let’s make it <br />
                <span className="text-white">a great one.</span>
              </h2>

              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-md">
                Pick a place and date. We’ll open WhatsApp with your details ready to confirm.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-bold text-white/95">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                  <span>No payment to check</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</span>
                  <span>Instant confirmation</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating White Booking Card (Exact Match to Image 3) */}
            <div className="lg:col-span-6">
              <div className="bg-[#FFFDFB] rounded-[28px] p-6 sm:p-9 shadow-[0_30px_70px_rgba(0,0,0,0.22)] border border-white/80 space-y-5 text-slate-900">
                
                {/* Card Top Strip */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    CHECK AVAILABLE SLOTS
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live availability
                  </span>
                </div>

                {/* Field 01: Location */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    01 &middot; CHOOSE LOCATION
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00A2E4]">
                      <Icon name="location" size={18} />
                    </div>
                    <select
                      value={ctaBranch}
                      onChange={(e) => setCtaBranch(e.target.value)}
                      className="w-full bg-[#FBF8F5] border border-slate-200 hover:border-[#00A2E4] focus:border-[#00A2E4] focus:ring-2 focus:ring-[#00A2E4]/20 rounded-2xl py-3.5 pl-11 pr-10 text-xs sm:text-sm font-bold text-slate-900 appearance-none transition-all cursor-pointer"
                    >
                      <option value="electronic-city">Electronic City Branch</option>
                      <option value="btm-stage-2">BTM 2nd Stage Branch (NEW)</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 font-bold text-lg">
                      &rsaquo;
                    </div>
                  </div>
                </div>

                {/* Field 02: Date */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    02 &middot; CHOOSE YOUR DATE
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00A2E4]">
                      <Icon name="calendar" size={18} />
                    </div>
                    <input
                      type="date"
                      value={ctaDate}
                      min={getTodayIST()}
                      onChange={(e) => setCtaDate(e.target.value)}
                      className="w-full bg-[#FBF8F5] border border-slate-200 hover:border-[#00A2E4] focus:border-[#00A2E4] focus:ring-2 focus:ring-[#00A2E4]/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Action Button - Solid Luxury Black */}
                <button
                  type="button"
                  onClick={handleCtaSubmit}
                  className="w-full py-4 rounded-2xl bg-[#0B2238] hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <span>Show me the slots</span>
                  <span className="text-base">&rarr;</span>
                </button>

                <div className="text-center pt-1">
                  <span className="text-[11px] font-medium text-slate-500 flex items-center justify-center gap-1.5">
                    <Icon name="clock" size={13} />
                    <span>Takes less than a minute</span>
                  </span>
                </div>

              </div>
            </div>

          </div>
        </section>
      </main>

      {/* 15. BRAND FOOTER */}
      <Footer />

      {/* 16. FLOATING WHATSAPP BUTTON */}
      <a 
        className="whatsapp-float" 
        href={WHATSAPP_BASE} 
        target="_blank" 
        rel="noreferrer" 
        aria-label="Chat on WhatsApp"
      >
        <Icon name="whatsapp" size={24} />
      </a>

      {/* 17. REAL THEATRES HD VIDEO TOUR MODAL */}
      {videoModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setVideoModalOpen(false)}
        >
          <div 
            className="relative w-full max-w-4xl bg-[#082052] rounded-3xl overflow-hidden shadow-2xl border border-white/20 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-[#05173B] border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-playfair text-base sm:text-lg font-black text-white">
                  {selectedVideoTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold flex items-center justify-center transition-all cursor-pointer"
                title="Close video"
              >
                ✕
              </button>
            </div>

            {/* Room Video Switcher Tabs */}
            <div className="flex items-center gap-2 px-5 sm:px-6 py-3 bg-[#082052] border-b border-white/10 overflow-x-auto text-xs font-bold">
              {[
                { name: 'Butterfly Blush', branch: 'BTM 2nd Stage', file: '/videos/btm-butterfly-blush.mp4' },
                { name: 'Lavender Mist', branch: 'BTM 2nd Stage', file: '/videos/btm-lavender-mist.mp4' },
                { name: 'Scarlet Red', branch: 'BTM 2nd Stage', file: '/videos/btm-scarlet-red.mp4' }
              ].map((v) => (
                <button
                  key={v.file}
                  type="button"
                  onClick={() => {
                    setSelectedVideo(v.file);
                    setSelectedVideoTitle(`${v.name} • ${v.branch}`);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedVideo === v.file
                      ? 'bg-[#00A2E4] text-white shadow-md'
                      : 'bg-white/10 text-white/80 hover:bg-white/15'
                  }`}
                >
                  <span>▶</span>
                  <span>{v.name}</span>
                </button>
              ))}
            </div>

            {/* Video Player (100% Unobstructed, Crystal Clear, Native Controls) */}
            <div className="relative w-full aspect-video bg-black flex items-center justify-center">
              <video
                key={selectedVideo}
                src={selectedVideo}
                autoPlay
                controls
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 sm:px-6 py-4 bg-[#05173B] border-t border-white/10">
              <div className="text-xs text-white/70">
                ✨ 100% authentic video tour of Movie Bash private screening theatres.
              </div>
              <button
                type="button"
                onClick={() => {
                  setVideoModalOpen(false);
                  router.push('/book-now/btm-stage-2');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#00A2E4] hover:bg-[#008bc4] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Book This Theatre &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
