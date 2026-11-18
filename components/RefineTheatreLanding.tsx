'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
    tagline: 'Grand balloons, personalized cake table & HBD neon lighting',
    badge: 'Most Popular',
    type: 'birthday-party',
    image: '/images/celebration_2.webp',
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
    tagline: 'Will You Marry Me neon, candle aisle, rose carpet & cold sparklers',
    badge: 'Dream Setup',
    type: 'date-and-proposal',
    image: '/images/couple_3.webp',
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
    tagline: 'Fairy lights, handcrafted red roses & romantic heart arch',
    badge: 'Romantic Pick',
    type: 'anniversary',
    image: '/images/couple_1.webp',
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
    tagline: 'Ultra-private cinema lounge, cozy recliner sofa & movie streaming',
    badge: 'Cozy Retreat',
    type: 'couple-date',
    image: '/images/ambience_1.webp',
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
    tagline: 'Tiara, celebration sash, champagne balloons & hilarious party props',
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
    tagline: 'Colorful cartoon themes, superhero balloons & family cake party',
    badge: 'Fun & Safe',
    type: 'kids-birthday',
    image: '/images/ambience_5.webp',
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
    tagline: 'Pastel balloons, fairy buggy walk-in & sweet memories',
    badge: 'Sweet Milestone',
    type: 'baby-shower',
    image: '/images/celebration_6.webp',
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
    tagline: 'Live sports match, karaoke microphones & group snacks',
    badge: 'Party Vibe',
    type: 'friends-party',
    image: '/images/ambience_5.webp',
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
    tagline: 'Emotional memory montage on giant 4K cinema screen',
    badge: 'Nostalgic',
    type: 'farewell',
    image: '/images/celebration_4.webp',
    borderColor: 'border-orange-300 hover:border-orange-500',
    bgGradient: 'bg-gradient-to-br from-orange-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-orange-100 to-orange-200/90 border border-orange-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(249,115,22,0.08)] hover:shadow-[0_12px_32px_rgba(249,115,22,0.22)]',
    badgeColor: 'bg-orange-100/90 text-orange-800 border-orange-200',
    arrowColor: 'text-orange-600',
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
    cardBorder: 'border-orange-300 hover:border-orange-500',
    bgGradient: 'bg-gradient-to-br from-orange-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-orange-100 to-orange-200/80 border border-orange-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(239,74,35,0.08)] hover:shadow-[0_12px_28px_rgba(239,74,35,0.2)]',
    badgeColor: 'bg-orange-100 text-orange-900 border-orange-200'
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
    badgeColor: 'bg-orange-100 text-orange-950 border-orange-300',
    cardBorder: 'border-[#ef4a23]/30',
    topOffset: 'top-24 sm:top-28',
    bgGradient: 'bg-gradient-to-br from-[#FFFDF9] via-[#FFF5EE] to-[#FFE8DA]',
    shadow: 'shadow-[0_20px_50px_rgba(239,74,35,0.12)]',
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
    dealPrice: '₹1,499',
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
    custom: '₹1,499',
    image: '/images/celebration_2.webp',
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
    custom: '₹1,499',
    image: '/images/rooms/btm-lavender-mist.webp',
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
    note: 'Most popular for celebrations',
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
  ['/images/celebration_1.webp', 'Grand birthday surprise'],
  ['/images/couple_3.webp', 'Dream date and proposal'],
  ['/images/celebration_5.webp', 'Bride-to-be celebration'],
  ['/images/celebration_6.webp', 'Pastel baby shower'],
  ['/images/ambience_10.webp', '150″ Dolby Atmos cinema experience'],
  ['/images/couple_5.webp', 'Floral romantic arrangement'],
];

const faqs = [
  ['Can I bring my own movie?', 'Yes. You can bring your preferred movie or stream from your own account. Our team will help you connect and get everything ready.'],
  ['Is decoration included?', 'Every room includes a simple celebration setup. Premium themes, cakes, fog entry, rose pathways and photography can be added to your booking.'],
  ['Can I reschedule my booking?', 'Yes. We offer one reschedule when requested at least 24 hours before your reserved slot, subject to availability.'],
  ['Are outside food and cakes allowed?', 'You may bring a cake and selected snacks or order via Swiggy/Zomato. We provide plates, glasses, and zero corkage fee.'],
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

const addonSlides = [
  {
    number: '01',
    category: 'Gourmet Cakes',
    title: 'Artisan Pastry & Celebration Cakes',
    price: '₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Pure Dutch chocolate ganache, tropical pineapple cream, and ruby red velvet hearts freshly prepared for your screening.',
    badge: 'Included in Packages (₹0)',
    bg: 'from-[#FFFDF9] via-[#FFF8EF] to-[#FFEED9]',
    cardBorder: 'border-[#ef4a23]/30 hover:border-[#ef4a23]',
    tagColor: 'bg-[#ef4a23]/10 text-[#ef4a23] border-[#ef4a23]/30',
    accent: '#ef4a23',
    items: [
      {
        iconKey: 'pineapple',
        title: 'Fresh Pineapple Celebration Cake',
        price: '₹499 / ₹899',
        desc: 'Light fluffy sponge with tropical pineapple chunks & glazed cherries.'
      },
      {
        iconKey: 'chocolate',
        title: 'Belgian Chocolate Truffle Cake',
        price: '₹499 / ₹899',
        desc: 'Dutch dark chocolate ganache with velvety cocoa sponge & custom plaque.'
      },
      {
        iconKey: 'red-velvet',
        title: 'Red Velvet Heart Cake',
        price: '₹499 / ₹899',
        desc: 'Ruby cocoa sponge with authentic cream cheese frosting & rose petals.'
      },
      {
        iconKey: 'black-forest',
        title: 'Classic Black Forest Cake',
        price: '₹499 / ₹899',
        desc: 'Moist chocolate sponge with sweet-tart cherries & chocolate shavings.'
      }
    ]
  },
  {
    number: '02',
    category: 'Atmospheric Special FX',
    title: 'Cinematic Visuals & Grand Walk-ins',
    price: 'From ₹199 to ₹799',
    desc: 'Dense cold mist billowing at your feet, indoor smokeless golden fountain sparklers, and floating rainbow bubbles.',
    badge: 'Hero Entry FX',
    bg: 'from-[#FFFDF9] via-[#FFF5EE] to-[#FFE8DA]',
    cardBorder: 'border-[#ef4a23]/30 hover:border-[#ef4a23]',
    tagColor: 'bg-[#ef4a23]/10 text-[#ef4a23] border-[#ef4a23]/30',
    accent: '#ef4a23',
    items: [
      {
        iconKey: 'fog',
        title: 'Magical Dry-Ice Ground Fog Entry',
        price: 'From ₹399',
        desc: 'Enchanting dense low-lying cold smoke effect for dramatic cinematic walk-in.'
      },
      {
        iconKey: 'pyro',
        title: 'Cold Fire Pyro Sparkler Entry (2 Pots)',
        price: '₹799',
        desc: '100% safe indoor smokeless golden fountain sparklers shooting 6-ft celebratory sparks.'
      },
      {
        iconKey: 'bubbles',
        title: 'Grand Bubble Machine Walk-in',
        price: '₹199',
        desc: 'Thousands of floating rainbow bubbles welcoming your loved ones through the door.'
      }
    ]
  },
  {
    number: '03',
    category: 'Romantic Décor',
    title: 'Candlelight & Fresh Rose Setups',
    price: 'From ₹250 to ₹899',
    desc: 'Hand-tied Dutch red roses, glowing Will-You-Marry-Me LED neon, candlelit petal carpet & romantic heart arch.',
    badge: 'Couples & Proposals',
    bg: 'from-[#FFFDF9] via-[#FFF1F5] to-[#FFE2EB]',
    cardBorder: 'border-rose-300/80 hover:border-rose-500',
    tagColor: 'bg-rose-500/10 text-rose-900 border-rose-300',
    accent: '#db2777',
    items: [
      {
        iconKey: 'roses',
        title: 'Fresh Dutch Red Rose Bouquet',
        price: '₹399',
        desc: '15 hand-tied vibrant Dutch red roses in luxury wrapper with personalized card.'
      },
      {
        iconKey: 'candles',
        title: 'Candlelight & Rose Petal Pathway',
        price: '₹499',
        desc: 'Illuminated aisle with warm glowing lanterns, fairy candles & rose petals.'
      },
      {
        iconKey: 'neon',
        title: 'Will You Marry Me / Love LED Neon',
        price: '₹499',
        desc: 'Glowing illuminated marquee romantic neon centerpiece backdrop.'
      },
      {
        iconKey: 'heart-arch',
        title: 'Romantic Fairy Light Canopy Heart Arch',
        price: '₹899',
        desc: 'Handcrafted red roses & warm glowing heart arch frame for photos.'
      }
    ]
  },
  {
    number: '04',
    category: 'Photography & Media',
    title: '4K Memory Screen & Professional Reels',
    price: 'From ₹599 to ₹1,499',
    desc: 'Turn personal childhood photos and couple videos into a dramatic 4K cinema memory montage on the 150″ screen.',
    badge: 'Insta Ready',
    bg: 'from-[#FFFDF9] via-[#F7F2FE] to-[#ECE2FD]',
    cardBorder: 'border-purple-300/80 hover:border-purple-500',
    tagColor: 'bg-purple-500/10 text-purple-900 border-purple-300',
    accent: '#7c3aed',
    items: [
      {
        iconKey: 'montage',
        title: 'Personal 4K Screen Video Montage',
        price: '₹599',
        desc: 'Your photos and clips edited into a movie trailer projected on the 150″ screen.'
      },
      {
        iconKey: 'photography',
        title: 'Dedicated Photographer & 30s Reel Shoot',
        price: '₹1,199',
        desc: 'Professional portrait photos & cinematic 4K reel edited for Instagram.'
      },
      {
        iconKey: 'teddy',
        title: 'Dancing Teddy Mascot Surprise',
        price: '₹500',
        desc: '30-minute interactive live dancing giant Teddy mascot to cheer up guests.'
      }
    ]
  },
  {
    number: '05',
    category: 'Cinema Bites',
    title: 'Theatre Butter Popcorn & Snack Bar',
    price: 'From ₹149 · Zero Corkage',
    desc: 'Piping hot golden butter popcorn, loaded Mexican cheese nachos with jalapeños, and chilled fruit mocktails.',
    badge: 'Party Binge',
    bg: 'from-[#FFFDF9] via-[#FFF9EA] to-[#FFF1CD]',
    cardBorder: 'border-amber-300/80 hover:border-amber-500',
    tagColor: 'bg-amber-500/10 text-amber-900 border-amber-300',
    accent: '#d97706',
    items: [
      {
        iconKey: 'popcorn',
        title: 'Jumbo Theatre Butter Popcorn Tub',
        price: '₹199',
        desc: 'Freshly popped warm golden corn tossed in rich movie theatre butter.'
      },
      {
        iconKey: 'nachos',
        title: 'Loaded Crispy Cheese Nachos',
        price: '₹179',
        desc: 'Crispy corn tortilla chips with warm melted cheese sauce and salsa.'
      },
      {
        iconKey: 'drinks',
        title: 'Sparkling Tropical Fruit Mocktails',
        price: '₹149',
        desc: 'Chilled bubbly fruit coolers (Virgin Mojito, Blue Curacao, Peach Sunrise).'
      }
    ]
  }
];

export default function RefineTheatreLanding({ initialLiveTheatres }: { initialLiveTheatres?: any[] } = {}) {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const slotBarRef = useRef<HTMLDivElement>(null);
  const heroSlotsModalRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroMarqueeRef = useRef<HTMLDivElement>(null);

  const [showHeroSlots, setShowHeroSlots] = useState(false);
  const [heroBgIndex, setHeroBgIndex] = useState(0);
  const [isHeroCarouselPaused, setIsHeroCarouselPaused] = useState(false);
  const heroTouchStartX = useRef<number | null>(null);
  const heroTouchEndX = useRef<number | null>(null);
  const heroPillTrackRef = useRef<HTMLDivElement>(null);

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
  const [activeCoupon, setActiveCoupon] = useState<{ code: string; discount_value: number }>({
    code: 'MOVIEBASH300',
    discount_value: 300,
  });

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
            discount_value: Number(j.data.discount_value) || 300,
          });
        }
      })
      .catch(() => {});
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

  // GSAP Animations: Hero Cursor, Font-Weight Tracking, Reversible Marquee, 3D Card Stack
  useEffect(() => {
    if (typeof window === 'undefined') return;
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

    return () => {
      headlineCleanup?.();
      marqueeCleanup?.();
      theatreScrollCleanup?.();
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
      
      {/* 1. TOP OFFER BAR (Dynamically reading active database promo) */}
      <div className="offer-bar">
        <span>Opening offer</span>
        <p>Flat ₹{activeCoupon.discount_value} off your first celebration with code <strong>{activeCoupon.code}</strong></p>
        <a href="#slots">Explore <Icon name="arrow" size={16} /></a>
      </div>

      {/* 2. REAL SITE NAVBAR */}
      <Navbar />

      <main>
        {/* 3. SPLIT-LAYOUT HERO SECTION — TEXT LEFT, GALLERY RIGHT (swadesiruchulu.com STYLE) */}
        <section 
          ref={heroRef}
          className="relative overflow-x-clip bg-[#FAF3E4] w-full" 
          id="home"
        >
          {/* Warm Luxury Glow Backdrop */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-[#ef4a23]/12 to-transparent blur-3xl rounded-full" />
            <div className="absolute top-1/4 left-0 w-[350px] h-[350px] bg-gradient-to-br from-amber-200/15 to-transparent blur-3xl rounded-full" />
            <div className="absolute top-1/3 right-0 w-[350px] h-[350px] bg-gradient-to-bl from-orange-200/15 to-transparent blur-3xl rounded-full" />
          </div>

          {/* ──── SPLIT GRID: LEFT TEXT + RIGHT GALLERY (RESPONSIVE STACK ON MOBILE, 2-COLS ON DESKTOP) ──── */}
          <div className="relative z-10 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 items-center min-h-[auto] lg:min-h-[80vh] px-3.5 sm:px-8 md:px-12 py-4 sm:py-8 lg:py-0">
            
            {/* ═══ LEFT COLUMN: Text, CTA, Slot Bar ═══ */}
            <div className="flex flex-col justify-center space-y-3 sm:space-y-4 lg:space-y-5 order-1 max-w-xl lg:max-w-none mx-auto lg:mx-0 w-full">
              
              {/* Eyebrow Badge */}
              <div className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#ef4a23]/10 border border-[#ef4a23]/30 text-[#ef4a23] text-[9px] sm:text-xs font-black uppercase tracking-wider sm:tracking-widest shadow-2xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4a23] animate-pulse" />
                <span>Bengaluru&apos;s #1 Private Cinema</span>
              </div>

              {/* Dynamic Font-Weight Headline */}
              <h1 
                ref={heroHeadlineRef}
                className="text-[#141110] font-['Archivo'] uppercase tracking-tight leading-[1.05] text-xl sm:text-3xl md:text-5xl lg:text-[56px] cursor-default select-none"
              >
                <div className="block">
                  {"YOUR MOMENT.".split('').map((c, i) => (
                    <span key={`l1-${i}`} className="hero-headline-char font-bold" data-serif="false">
                      {c === ' ' ? '\u00A0' : c}
                    </span>
                  ))}
                </div>
                <div className="block text-[#ef4a23] font-['Playfair'] italic normal-case tracking-normal my-0.5 sm:my-1.5 font-normal">
                  {"*Your Movie.*".split('').map((c, i) => (
                    <span key={`l2-${i}`} className="hero-headline-char" data-serif="true">
                      {c === ' ' ? '\u00A0' : c}
                    </span>
                  ))}
                </div>
                <div className="block">
                  {"YOUR THEATRE.".split('').map((c, i) => (
                    <span key={`l3-${i}`} className="hero-headline-char font-bold" data-serif="false">
                      {c === ' ' ? '\u00A0' : c}
                    </span>
                  ))}
                </div>
              </h1>

              {/* Subtitle */}
              <p className="text-[11px] sm:text-sm md:text-base text-slate-700 font-medium max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-none">
                Fully private 4K laser cinema screening, custom celebrations, fog entry, and handcrafted cakes for couples &amp; groups.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">
                <a 
                  href="#slots" 
                  className="inline-flex items-center gap-1.5 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-['Archivo'] font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-wider shadow-md shadow-orange-600/25 hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  <span>Plan Celebration</span>
                  <Icon name="arrow" size={14} />
                </a>
                <a 
                  href="#theatres" 
                  className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-3 rounded-full bg-white hover:bg-orange-50 text-[#141110] font-bold text-[11px] sm:text-xs md:text-sm border border-[#ef4a23]/30 shadow-2xs transition-all whitespace-nowrap"
                >
                  <Icon name="play" size={12} />
                  <span>Explore Theatres</span>
                </a>
              </div>

              {/* Desktop Quick Slot Booking Bar & Trust Pill (Hidden on mobile, visible on desktop) */}
              <div className="hidden lg:flex flex-col space-y-3 sm:space-y-4">
                <div 
                  ref={slotBarRef}
                  className="w-full max-w-md bg-white/95 rounded-2xl sm:rounded-full p-1.5 sm:p-2 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 shadow-[0_12px_36px_rgba(239,74,35,0.09)] border border-[#ef4a23]/25 mt-1 sm:mt-2"
                >
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 w-full sm:w-auto">
                    <span className="text-[#ef4a23]"><Icon name="location" size={14} /></span>
                    <select 
                      value={branch} 
                      onChange={(e) => {
                        setBranch(e.target.value);
                        if (showHeroSlots) {
                          const target = e.target.value.includes('BTM') ? 'BTM 2nd Stage' : 'Electronic City';
                          setSlotBranch(target);
                        }
                      }}
                      className="bg-transparent text-[#141110] font-bold text-[11px] sm:text-xs focus:outline-none cursor-pointer w-full"
                    >
                      <option value="Electronic City">Electronic City</option>
                      <option value="BTM 2nd Stage">BTM 2nd Stage</option>
                    </select>
                  </div>
                  <div className="hidden sm:block w-px h-6 bg-slate-200" />
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 w-full sm:w-auto">
                    <span className="text-[#ef4a23]"><Icon name="calendar" size={14} /></span>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={(e) => setDate(e.target.value)}
                      min={getTodayIST()}
                      className="bg-transparent text-[#141110] font-bold text-[11px] sm:text-xs focus:outline-none cursor-pointer w-full"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={checkAvailability}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-black text-[11px] sm:text-xs shadow-md shadow-orange-600/30 hover:scale-105 transition-all flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>Check Slots</span>
                    <Icon name="arrow" size={12} />
                  </button>
                </div>

                {/* Trust Reviews Pill */}
                <div className="flex items-center gap-2 text-slate-700 text-[10px] sm:text-[11px] font-semibold pt-0.5">
                  <div className="flex -space-x-1.5">
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-white">RS</span>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-orange-400 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-white">AK</span>
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-400 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-white">NM</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#ef4a23] font-bold">★★★★★</span>
                    <span className="truncate">Loved by 12,500+ guests in Bengaluru</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN: Cinematic Arch Gallery ═══ */}
            <div 
              className="order-2 flex flex-col items-center w-full max-w-xl mx-auto lg:max-w-none mt-2 sm:mt-0"
              onMouseEnter={() => setIsHeroCarouselPaused(true)}
              onMouseLeave={() => setIsHeroCarouselPaused(false)}
            >
              {/* Gallery Container */}
              <div className="w-full bg-white/80 backdrop-blur-md rounded-[20px] sm:rounded-[28px] p-3 sm:p-4 border border-white/90 shadow-[0_16px_40px_rgba(20,17,16,0.06)]">
                {/* Header: Title + Counter + Controls */}
                <div className="flex items-center justify-between px-1 pb-2 mb-2 border-b border-orange-200/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#ef4a23] animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#141110]">
                      Cinematic Arch Gallery
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-wider text-[#ef4a23]">
                      0{heroBgIndex + 1} <span className="text-slate-400 font-normal">/ 0{heroBgPhotos.length}</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={prevHeroSlide}
                        aria-label="Previous suite"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-[#ef4a23] text-slate-700 hover:text-white border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-xs"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        onClick={nextHeroSlide}
                        aria-label="Next suite"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white hover:bg-[#ef4a23] text-slate-700 hover:text-white border border-slate-200 shadow-2xs flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-xs"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5 Arch-Shaped Frames */}
                <div 
                  className="relative h-[200px] sm:h-[260px] md:h-[300px] lg:h-[340px] w-full flex items-end justify-center gap-1.5 sm:gap-2 select-none"
                  onWheel={(e) => {
                    if (Math.abs(e.deltaY) > 20 || Math.abs(e.deltaX) > 20) {
                      if (e.deltaY > 0 || e.deltaX > 0) nextHeroSlide();
                      else prevHeroSlide();
                    }
                  }}
                  onTouchStart={handleHeroTouchStart}
                  onTouchMove={handleHeroTouchMove}
                  onTouchEnd={handleHeroTouchEnd}
                >
                  {[
                    (heroBgIndex - 2 + heroBgPhotos.length) % heroBgPhotos.length,
                    (heroBgIndex - 1 + heroBgPhotos.length) % heroBgPhotos.length,
                    heroBgIndex,
                    (heroBgIndex + 1) % heroBgPhotos.length,
                    (heroBgIndex + 2) % heroBgPhotos.length,
                  ].map((photoIdx, posIdx) => {
                    const photo = heroBgPhotos[photoIdx];
                    const isCenter = posIdx === 2;
                    const isInner = posIdx === 1 || posIdx === 3;

                    let widthClass = 'w-[15%] sm:w-[15%]';
                    let heightClass = 'h-[72%] sm:h-[76%]';
                    let roundClass = 'rounded-t-[28px] sm:rounded-t-[50px] md:rounded-t-[80px] rounded-b-lg sm:rounded-b-xl';
                    let containerStyle = 'opacity-75 hover:opacity-95 hover:scale-[1.02] cursor-pointer';

                    if (isCenter) {
                      widthClass = 'w-[32%] sm:w-[32%]';
                      heightClass = 'h-full';
                      roundClass = 'rounded-t-[44px] sm:rounded-t-[80px] md:rounded-t-[110px] rounded-b-lg sm:rounded-b-xl';
                      containerStyle = 'ring-2 sm:ring-3 ring-[#ef4a23] shadow-2xl cursor-default z-10';
                    } else if (isInner) {
                      widthClass = 'w-[19%] sm:w-[19%]';
                      heightClass = 'h-[84%] sm:h-[86%]';
                      roundClass = 'rounded-t-[34px] sm:rounded-t-[65px] md:rounded-t-[90px] rounded-b-lg sm:rounded-b-xl';
                      containerStyle = 'opacity-85 hover:opacity-100 hover:scale-[1.02] cursor-pointer shadow-md';
                    }

                    return (
                      <div
                        key={`${photo.title}-${posIdx}`}
                        onClick={() => { if (!isCenter) setHeroBgIndex(photoIdx); }}
                        className={`relative overflow-hidden transition-all duration-500 ease-out ${widthClass} ${heightClass} ${roundClass} ${containerStyle}`}
                      >
                        <Image
                          src={photo.src}
                          alt={photo.title}
                          fill
                          priority={isCenter}
                          className="object-cover object-center transition-transform duration-700 hover:scale-105"
                          sizes="(max-width: 768px) 30vw, 300px"
                        />
                        <div className={`absolute inset-0 transition-opacity duration-300 ${
                          isCenter 
                            ? 'bg-gradient-to-t from-black/80 via-black/30 to-black/10'
                            : 'bg-gradient-to-t from-black/75 via-black/20 to-transparent'
                        }`} />

                        {isCenter && (
                          <div className="absolute top-10 sm:top-12 md:top-14 inset-x-0 z-20 flex flex-col items-center justify-center gap-1 sm:gap-1.5 pointer-events-none px-2 sm:px-3">
                            <span className="inline-block max-w-[85%] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-black/90 backdrop-blur-md border border-white/30 text-[#ffd46e] text-[8px] sm:text-[10px] md:text-[11px] font-black uppercase tracking-normal sm:tracking-wider shadow-lg truncate text-center">
                              {photo.badge}
                            </span>
                            <span className="inline-block max-w-[85%] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-[#ef4a23] text-white text-[8px] sm:text-[10px] md:text-[11px] font-black shadow-lg truncate text-center">
                              {photo.price}
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-x-0 bottom-0 z-20 p-1.5 sm:p-2.5 text-left">
                          {isCenter ? (
                            <>
                              <h3 className="text-white font-['Archivo'] font-black text-[11px] sm:text-sm md:text-base leading-snug drop-shadow-sm line-clamp-2">
                                {photo.title}
                              </h3>
                              <p className="text-white/80 text-[8px] sm:text-[10px] md:text-xs font-medium mt-0.5 drop-shadow-xs line-clamp-1 hidden sm:block">
                                {photo.subtitle}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                {photo.specs.slice(0, 2).map((spec, si) => (
                                  <span key={si} className="text-[7px] sm:text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/25">
                                    {spec}
                                  </span>
                                ))}
                              </div>
                            </>
                          ) : (
                            <div className="text-center w-full px-0.5 pb-0.5">
                              <span className="text-white text-[7.5px] sm:text-[9px] md:text-[10px] font-black drop-shadow-md block leading-tight text-center">
                                {isInner ? photo.tabTitle : (photo.shortLabel || photo.tabTitle)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Suite Selector Pills: All 5 always visible, perfectly balanced */}
                <div className="mt-2.5 w-full">
                  <div className="grid grid-cols-5 gap-1 sm:gap-1.5 w-full">
                    {heroBgPhotos.map((photo, idx) => {
                      const isActive = idx === heroBgIndex;
                      return (
                        <button
                          key={photo.title}
                          type="button"
                          onClick={() => setHeroBgIndex(idx)}
                          className={`w-full py-1.5 px-0.5 sm:px-1.5 rounded-lg text-[8.5px] sm:text-[10px] md:text-[11px] font-black transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 shadow-2xs text-center leading-tight ${
                            isActive
                              ? 'bg-[#141110] text-[#ffd46e] border border-[#141110] shadow-sm ring-1 ring-[#ef4a23]'
                              : 'bg-white hover:bg-orange-50 text-slate-700 border border-slate-200 hover:border-[#ef4a23]'
                          }`}
                          title={photo.title}
                        >
                          <span className="text-xs sm:text-sm">{photo.icon}</span>
                          <span className="truncate">{photo.shortLabel || photo.tabTitle}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4a23] animate-pulse hidden sm:inline-block ml-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Quick Slot Booking Bar & Trust Reviews (Positioned cleanly below Cinematic Arch Gallery on mobile) */}
          <div className="block lg:hidden w-full max-w-xl mx-auto mt-4 px-1 space-y-3">
            <div 
              className="w-full bg-white/95 rounded-2xl p-2.5 flex flex-col items-center justify-between gap-2 shadow-[0_12px_36px_rgba(239,74,35,0.09)] border border-[#ef4a23]/25"
            >
              <div className="flex items-center gap-2 px-2 w-full">
                <span className="text-[#ef4a23]"><Icon name="location" size={16} /></span>
                <select 
                  value={branch} 
                  onChange={(e) => {
                    setBranch(e.target.value);
                    if (showHeroSlots) {
                      const target = e.target.value.includes('BTM') ? 'BTM 2nd Stage' : 'Electronic City';
                      setSlotBranch(target);
                    }
                  }}
                  className="bg-transparent text-[#141110] font-bold text-xs focus:outline-none cursor-pointer w-full py-1"
                >
                  <option value="Electronic City">Electronic City</option>
                  <option value="BTM 2nd Stage">BTM 2nd Stage</option>
                </select>
              </div>

              <div className="w-full h-px bg-slate-100" />

              <div className="flex items-center gap-2 px-2 w-full">
                <span className="text-[#ef4a23]"><Icon name="calendar" size={16} /></span>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  min={getTodayIST()}
                  className="bg-transparent text-[#141110] font-bold text-xs focus:outline-none cursor-pointer w-full py-1"
                />
              </div>

              <button 
                type="button" 
                onClick={checkAvailability}
                className="w-full px-5 py-2.5 rounded-full bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-black text-xs shadow-md shadow-orange-600/30 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Check Slots</span>
                <Icon name="arrow" size={14} />
              </button>
            </div>

            {/* Trust Reviews Pill for Mobile */}
            <div className="flex items-center justify-center gap-2 text-slate-700 text-[11px] font-semibold pt-1">
              <div className="flex -space-x-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-black text-[9px] flex items-center justify-center border border-white">RS</span>
                <span className="w-5 h-5 rounded-full bg-orange-400 text-white font-black text-[9px] flex items-center justify-center border border-white">AK</span>
                <span className="w-5 h-5 rounded-full bg-rose-400 text-white font-black text-[9px] flex items-center justify-center border border-white">NM</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[#ef4a23] font-bold">★★★★★</span>
                <span className="truncate">Loved by 12,500+ guests in Bengaluru</span>
              </div>
            </div>
          </div>

          {/* IN-PLACE LIVE SLOTS VIEWER (3 VERTICAL COLUMNS AS REQUESTED) */}
          {showHeroSlots && (
            <div className="relative z-30 max-w-6xl mx-auto px-4 sm:px-6 pb-6">
              <div 
                ref={heroSlotsModalRef}
                className="w-full bg-white rounded-3xl p-5 sm:p-7 shadow-[0_25px_60px_rgba(20,17,16,0.14)] border-2 border-[#ef4a23]/30 text-left animate-in fade-in slide-in-from-top-4 duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-4 border-b border-orange-100 mb-5">
                  <div>
                    <h3 className="font-playfair text-xl sm:text-2xl font-black text-[#141110]">
                      Available Showtime Slots &bull; {branch}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Showing live schedule for <strong className="text-[#ef4a23]">{date}</strong>
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

                      const emoji = room.theatreId === 1 || room.theatreId === 4 
                        ? '🎬' 
                        : room.theatreId === 2 || room.theatreId === 5 
                        ? '🎉' 
                        : room.theatreId === 3 || room.theatreId === 6 
                        ? '🧑‍🧑‍🧒‍🧒' 
                        : '✨';

                      return (
                        <div
                          key={room.name}
                          className="bg-[#FFFDF9] rounded-2xl border border-orange-200/80 p-4 sm:p-5 shadow-xs hover:border-[#ef4a23]/60 transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Top: Emoji + Price */}
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-3xl p-1.5 rounded-xl bg-white border border-orange-100 shadow-2xs">{emoji}</span>
                              <div className="text-right">
                                <span className="font-playfair text-xl sm:text-2xl font-black text-[#141110] block">
                                  {room.custom || room.price}
                                </span>
                              </div>
                            </div>

                            {/* Title & Capacity */}
                            <h4 className="font-playfair text-lg sm:text-xl font-black text-[#141110]">
                              {room.name}
                            </h4>
                            <div className="flex items-center justify-between text-xs text-slate-600 font-bold mt-1 mb-3">
                              <span className="flex items-center gap-1 text-slate-500">
                                <Icon name="users" size={13} />
                                {room.capacity}
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {openCount} Open Slots
                              </span>
                            </div>

                            {/* Divider Title */}
                            <div className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 mb-2">
                              CLICK A SLOT TO RESERVE:
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
                                    className="p-2 sm:p-2.5 rounded-xl border border-emerald-300/80 bg-white hover:border-[#ef4a23] hover:bg-[#fff9f4] text-center transition-all cursor-pointer shadow-2xs group flex flex-col items-center justify-center active:scale-95"
                                    title={`Reserve ${room.name} at ${displayTime}`}
                                  >
                                    <strong className="text-[11px] sm:text-xs font-black text-[#141110] group-hover:text-[#ef4a23] truncate w-full">
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
                            className="w-full py-2.5 px-4 rounded-xl text-center text-xs font-black text-white bg-[#ef4a23] hover:bg-[#d83f1a] shadow-md transition-all block mt-4 cursor-pointer"
                          >
                            Book {room.name} &rarr;
                          </button>
                        </div>
                      );
                    })}
                </div>

                {/* Footer Links */}
                <div className="mt-5 pt-3.5 border-t border-orange-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
                  <a href="#slots" className="flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#ef4a23]">
                    Explore Hall Amenities &amp; Room Photos Below &darr;
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      const targetBranch = branch.includes('BTM') ? 'btm-stage-2' : 'electronic-city';
                      router.push(`/book-now/${targetBranch}?date=${date}`);
                    }}
                    className="font-bold text-[#ef4a23] hover:underline cursor-pointer"
                  >
                    Go to Full Booking Page &rarr;
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reversible Feature Marquee */}
          <div 
            ref={heroMarqueeRef}
            className="w-full overflow-hidden flex relative z-10 py-4 border-t border-[#ef4a23]/15 bg-[#FAF3E4]"
          >
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#ef4a23]">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">⭐ 4.9★ RATED (12,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🎂 HANDCRAFTED GOURMET CAKES</span>
            </div>
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-[#ef4a23]">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">⭐ 4.9★ RATED (12,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#ef4a23]/30 shadow-2xs">🎂 HANDCRAFTED GOURMET CAKES</span>
            </div>
          </div>
        </section>

{/* 4. INTRO STATS STRIP */}
        <section className="intro-strip" aria-label="Movie Bash highlights">
          <div><Icon name="users" /><strong>12,500+</strong><span>happy celebrations</span></div>
          <div><Icon name="star" /><strong>4.9 / 5</strong><span>guest rating</span></div>
          <div><Icon name="location" /><strong>2 locations</strong><span>across Bengaluru</span></div>
          <div><Icon name="sparkles" /><strong>100% private</strong><span>zero interruptions</span></div>
        </section>

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
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#ef4a23] text-white text-xs sm:text-sm font-black shadow-lg shadow-orange-500/30 animate-pulse">
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
                            className="slot cursor-pointer hover:border-[#ef4a23] flex flex-col items-center justify-center text-center"
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

        {/* 6. WHAT ARE YOU CELEBRATING? (DYNAMIC SPOTLIGHT STAGE + ANIMATED OCCASIONS DECK) */}
        <section className="section occasions" id="experiences">
          <div className="section-heading centered">
            <div className="eyebrow"><span /> Moments worth making special <span /></div>
            <h2>What are you <em>celebrating?</em></h2>
            <p>Whatever the occasion, we set the stage with magical lighting, romantic setups, and 4K cinema. You simply walk in and enjoy your moment.</p>
          </div>

          <div 
            className="max-w-6xl mx-auto px-4 mt-8"
            onMouseEnter={() => setIsOccasionPaused(true)}
            onMouseLeave={() => setIsOccasionPaused(false)}
          >

            {/* CELEBRATIONS HORIZONTAL CARD CAROUSEL WITH SMOOTH ANIMATIONS */}
            {(() => {
              const prevOcc = () => setActiveOccasion((prev) => (prev - 1 + occasionsList.length) % occasionsList.length);
              const nextOcc = () => setActiveOccasion((prev) => (prev + 1) % occasionsList.length);
              const currentOcc = occasionsList[activeOccasion];

              return (
                <div className="relative mb-8 sm:mb-10 select-none">
                  {/* Main Feature Card (Full-Width with Split Layout) */}
                  <div 
                    className="relative rounded-[24px] sm:rounded-[32px] bg-white border-2 border-[#ef4a23]/20 shadow-[0_16px_40px_rgba(239,74,35,0.08)] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(239,74,35,0.12)]"
                    onTouchStart={handleOccTouchStart}
                    onTouchMove={handleOccTouchMove}
                    onTouchEnd={handleOccTouchEnd}
                    onWheel={handleTheatreScreenWheel}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                      
                      {/* Left: Large Image */}
                      <div className="relative w-full h-[220px] sm:h-[280px] lg:h-[380px] overflow-hidden group transition-all duration-500">
                        <Image
                          key={currentOcc.slug}
                          src={currentOcc.image}
                          alt={currentOcc.title}
                          fill
                          loading="lazy"
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-105 animate-[fadeIn_0.6s_ease-out]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
                        
                        {/* Navigation Arrows on Image */}
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-3 sm:px-5 z-20">
                          <button
                            type="button"
                            onClick={prevOcc}
                            aria-label="Previous celebration"
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#141110] shadow-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 backdrop-blur-sm"
                          >
                            <span className="text-lg font-bold">←</span>
                          </button>
                          <button
                            type="button"
                            onClick={nextOcc}
                            aria-label="Next celebration"
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-[#141110] shadow-lg flex items-center justify-center transition-all cursor-pointer active:scale-90 backdrop-blur-sm"
                          >
                            <span className="text-lg font-bold">→</span>
                          </button>
                        </div>
                        
                        {/* Bottom Image Overlay Info */}
                        <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] sm:text-xs font-black uppercase tracking-wider border border-white/20">
                            {currentOcc.badge}
                          </span>
                          <span className="px-3 py-1 rounded-full bg-[#ef4a23] text-white text-[10px] sm:text-xs font-black shadow-sm">
                            {activeOccasion + 1} of {occasionsList.length}
                          </span>
                        </div>
                      </div>
                      
                      {/* Right: Info, Inclusions, CTA */}
                      <div className="p-5 sm:p-7 md:p-8 flex flex-col justify-center space-y-4 animate-[slideInRight_0.5s_ease-out]" key={currentOcc.slug + '-info'}>
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <div className={`w-9 h-9 rounded-xl ${currentOcc.iconBg} flex items-center justify-center p-1.5 shrink-0 shadow-2xs`}>
                            <GrandOccasionIcon type={currentOcc.type} className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-[#ef4a23]/10 text-[#ef4a23] text-[10px] sm:text-xs font-black uppercase border border-[#ef4a23]/20">
                            100% Private
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-['Playfair'] font-bold text-2xl sm:text-3xl md:text-4xl text-[#141110] leading-tight tracking-tight">
                          {currentOcc.title}
                        </h3>

                        {/* Tagline */}
                        <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed">
                          {currentOcc.tagline}
                        </p>

                        {/* Experience Inclusions */}
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                            Experience Includes
                          </span>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1.5 rounded-lg bg-[#FAF3E4] text-[#141110] text-xs font-bold border border-orange-200/60 shadow-2xs">
                              🎬 4K Screening
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-[#FAF3E4] text-[#141110] text-xs font-bold border border-orange-200/60 shadow-2xs">
                              ✨ Custom Décor
                            </span>
                            <span className="px-3 py-1.5 rounded-lg bg-[#FAF3E4] text-[#141110] text-xs font-bold border border-orange-200/60 shadow-2xs">
                              🎂 Cake Entry
                            </span>
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-4 pt-2">
                          <Link
                            href={`/book-now?occasion=${currentOcc.slug}`}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#141110] hover:bg-[#ef4a23] text-white font-['Archivo'] font-black text-xs sm:text-sm uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                          >
                            <span>Book This Experience</span>
                            <span>&rarr;</span>
                          </Link>
                        </div>

                        {/* Progress Dots */}
                        <div className="flex items-center gap-1.5 pt-2">
                          {occasionsList.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setActiveOccasion(dotIdx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                dotIdx === activeOccasion ? 'w-6 bg-[#ef4a23]' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                              }`}
                              aria-label={`Go to ${occasionsList[dotIdx].title}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 9-OCCASION SELECTION TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
              {occasionsList.map((occ, idx) => {
                const isActive = idx === activeOccasion;
                return (
                  <button
                    key={occ.slug}
                    type="button"
                    onClick={() => setActiveOccasion(idx)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-3 cursor-pointer ${
                      isActive
                        ? 'border-[#ef4a23] bg-white ring-4 ring-[#ef4a23]/20 shadow-md scale-102'
                        : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-[#ef4a23]/40 shadow-xs'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl ${occ.iconBg} flex items-center justify-center p-1.5 shrink-0 shadow-2xs`}>
                      <GrandOccasionIcon type={occ.type} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-black truncate leading-tight ${isActive ? 'text-[#ef4a23]' : 'text-[#141110]'}`}>
                        {occ.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                        {occ.badge}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

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
                {tier.featured && <span className="best-value">Most booked</span>}
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

          {/* Popular Add-ons Soft Orange Row Matching Figma */}
          <div className="add-on-row">
            <strong>Popular add-ons:</strong>
            <span>Fog entry <b>₹499</b></span>
            <span>Cold pyro <b>₹399</b></span>
            <span>Rose bouquet <b>₹399</b></span>
            <span>Photo &amp; reel shoot <b>₹1,199</b></span>
            <span>Pineapple cake <b>₹499</b></span>
          </div>
        </section>

        {/* 8B. SCROLL-TRIGGERED STACKED CARDS ANIMATION (ADD-ONS & ATMOSPHERE - DESKTOP & MOBILE) */}
        <section 
          className="relative bg-[#FAF3E4] text-[#141110] border-y border-[#141110]/10 pt-16 sm:pt-20 pb-12 sm:pb-16 px-4 sm:px-6" 
          id="addons"
        >
          {/* Section Header: Explicitly Branding Celebration Add-Ons */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ef4a23]/10 border border-[#ef4a23]/30 text-[#ef4a23] text-xs font-black uppercase tracking-wider shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#ef4a23] animate-pulse" />
              <span>Celebration Add-Ons · Signature Atmosphere</span>
            </div>
            <h2 className="font-['Archivo'] text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight text-[#141110] leading-tight">
              Celebration Add-Ons, <span className="font-['Playfair'] italic font-normal text-[#ef4a23] normal-case">made to delight.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 font-medium leading-relaxed">
              Scroll down through all 5 handcrafted Add-on collections: Gourmet Cakes, Fog &amp; Pyro FX, Romantic Décor, Photoshoots &amp; Popcorn Bar.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1 text-xs font-black text-[#ef4a23]">
              <span>↓ Scroll to stack celebration add-on cards</span>
            </div>
          </div>

          {/* STACKED CARDS SCROLL DECK (Native Sticky Stacking with Luxury Matte Dark Style from Image 1) */}
          <div className="relative max-w-4xl mx-auto space-y-10 sm:space-y-16 pb-28 min-h-[120vh]">
            {addonSlides.map((slide, idx) => (
              <div
                key={slide.number}
                className="sticky rounded-[24px] sm:rounded-[34px] p-6 sm:p-9 md:p-10 bg-white text-[#141110] border border-orange-200/60 shadow-[0_20px_50px_rgba(20,17,16,0.08)] transition-all duration-300 relative overflow-hidden"
                style={{
                  top: `calc(85px + ${idx * 28}px)`,
                  zIndex: idx + 1,
                  willChange: 'transform',
                }}
              >
                {/* Subtle Luxury Curved Highlight Arc in Top-Left (Matching Image 1) */}
                <div 
                  className="absolute -top-32 -left-32 w-80 h-80 rounded-full border border-[#ef4a23]/[0.06] pointer-events-none" 
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 md:grid-cols-12 gap-7 sm:gap-8 md:gap-10 items-stretch">
                  {/* Left Column: Eyebrow, Large Playfair Serif Headline, Description, Price & Cream CTA */}
                  <div className="md:col-span-5 flex flex-col justify-between text-left">
                    <div>
                      {/* Eyebrow with horizontal dash */}
                      <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <span className="w-5 h-[1.5px] bg-[#ef4a23]/40" />
                        <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-[#ef4a23]">
                          Celebration Add-On · {slide.category} · {slide.number}
                        </span>
                      </div>

                      {/* Headline in Playfair Serif with Italic emphasis */}
                      <h3 className="font-['Playfair'] text-2xl sm:text-3xl md:text-4xl font-bold text-[#141110] leading-[1.15] tracking-tight">
                        {slide.title.includes('&') ? (
                          <>
                            {slide.title.split('&')[0]}&amp; <br />
                            <em className="italic font-normal text-[#ef4a23]/80">{slide.title.split('&')[1]}</em>
                          </>
                        ) : (
                          slide.title
                        )}
                      </h3>

                      {/* Subtitle / Description */}
                      <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed mt-3 sm:mt-4">
                        {slide.desc}
                      </p>
                    </div>

                    {/* Bottom Pricing & Cream Action Button */}
                    <div className="mt-6 sm:mt-8 pt-4 border-t border-orange-200/40 md:border-t-0 md:pt-0">
                      <div className="mb-4">
                        <span className="block text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                          Complete Extras From
                        </span>
                        <div className="font-['Playfair'] text-2xl sm:text-3xl font-bold text-[#141110]">
                          {slide.price.split('·')[0].trim()}
                        </div>
                      </div>

                      <Link
                        href="/book-now"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-['Archivo'] font-black text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                      >
                        <span>Explore the package</span>
                        <span className="text-base font-bold">&rarr;</span>
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Clean List of Items with Horizontal Dividers, Circular Icon Discs & Checkmarks */}
                  <div className="md:col-span-7 flex flex-col justify-center divide-y divide-orange-200/40 border-t border-b border-orange-200/40 md:border-t-0 md:border-b-0">
                    {slide.items.map((item) => (
                      <div
                        key={item.title}
                        className="py-3.5 sm:py-4 flex items-center justify-between gap-3 group transition-colors"
                      >
                        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                          {/* Circular icon disc (matching Image 1) */}
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#FAF3E4] group-hover:bg-orange-100 text-[#ef4a23] flex items-center justify-center p-1.5 shrink-0 transition-colors shadow-2xs border border-orange-200/60">
                            <GrandAddonIcon name={item.iconKey} className="w-4 h-4 sm:w-5 sm:h-5 text-[#ef4a23]" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-[#141110] truncate leading-tight group-hover:text-[#ef4a23]">
                              {item.title}
                            </h4>
                            <p className="text-[10px] sm:text-xs text-slate-500 font-normal truncate mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-[#ef4a23]">
                            {item.price}
                          </span>
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-emerald-500 group-hover:text-emerald-600 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Direct CTA */}
          <div className="text-center mt-6">
            <Link
              href="/book-now"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#141110] hover:bg-[#ef4a23] text-white font-['Archivo'] font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <span>Build Complete Celebration in Booking Wizard</span>
              <span className="text-base">&rarr;</span>
            </Link>
          </div>
        </section>

        {/* 9. PICK YOUR PRIVATE THEATRE */}
        <section className="section theatres" id="theatres">
          <div className="section-heading heading-row mb-6 sm:mb-8">
            <div>
              <div className="eyebrow"><span /> Your space, your way</div>
              <h2>Pick your <em>private theatre</em></h2>
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
                  ? 'bg-[#ef4a23] text-white shadow-md shadow-orange-500/25 ring-2 ring-[#ef4a23]/30 scale-[1.02]'
                  : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200'
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
                  ? 'bg-[#ef4a23] text-white shadow-md shadow-orange-500/25 ring-2 ring-[#ef4a23]/30 scale-[1.02]'
                  : 'bg-white hover:bg-orange-50 text-stone-700 border border-stone-200'
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
                      className={`theatre-card flex flex-col justify-between bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all ${
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
                            <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm border border-white/20 whitespace-nowrap">
                              {theatre.meta}
                            </span>
                          </div>
                        )}
                        {i === 1 && (
                          <div className="absolute top-2.5 right-2.5 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-[#ef4a23] text-white text-[9.5px] font-black uppercase tracking-wider shadow-sm">
                              Most Loved
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 text-center flex flex-col items-center justify-between flex-1 space-y-3">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight">{theatre.name}</h3>
                          <p className="text-xs text-slate-500 font-bold mt-1">
                            📍 {theatre.location || (theatre.branchSlug === 'btm-stage-2' ? 'BTM 2nd Stage, Bengaluru' : 'Electronic City, Bengaluru')}
                          </p>
                        </div>

                        {/* Red Ribbon Banner */}
                        <div className="relative my-1 w-full flex justify-center items-center">
                          <div className="relative z-10 bg-[#e51e25] text-white font-black text-sm py-1.5 px-6 rounded-full shadow-sm uppercase tracking-wider inline-block">
                            Starts @ {theatre.dealPrice.replace('₹', '')}/-
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 font-medium line-clamp-2 px-1 leading-relaxed">
                          {theatre.description}
                        </p>
                        
                        <div className="w-full pt-1 mt-auto">
                          <Link 
                            href={`/book-now/${theatre.branchSlug}?theatre=${theatre.theatreId}`} 
                            className="w-full py-2.5 px-6 rounded-xl bg-[#ef4a23] hover:bg-[#d63b15] text-white font-black text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Book Now →</span>
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
            <div className="section-heading heading-row mb-6 sm:mb-10">
              <div>
                <div className="eyebrow flex items-center gap-1.5 text-xs font-bold text-[#ef4a23] uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#ef4a23] animate-pulse" /> Real Movie Bash celebrations
                </div>
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-['Playfair_Display'] font-bold text-[#141110]">
                  See how moments<br /><em className="italic text-[#ef4a23]">come to life.</em>
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mt-2 sm:mt-0 leading-relaxed">
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
                          ? 'ring-2 ring-[#ef4a23] shadow-[0_20px_45px_rgba(239,74,35,0.22)]'
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
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4a23] animate-pulse" />
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
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#ef4a23] text-stone-700 hover:text-white border border-stone-200 shadow-sm flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-sm"
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
                          ? 'w-7 bg-[#ef4a23] shadow-xs'
                          : 'w-2 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={nextMoment}
                  aria-label="Next moment"
                  className="w-8 h-8 rounded-full bg-white hover:bg-[#ef4a23] text-stone-700 hover:text-white border border-stone-200 shadow-sm flex items-center justify-center transition-all cursor-pointer font-bold active:scale-90 text-sm"
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
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#ef4a23]/25 bg-white/95 hover:bg-[#ef4a23] hover:text-white hover:border-[#ef4a23] text-stone-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
          >
            <span className="text-xl font-bold leading-none -mt-0.5">&lsaquo;</span>
          </button>

          <button
            type="button"
            onClick={nextReview}
            aria-label="Next review"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-[#ef4a23]/25 bg-white/95 hover:bg-[#ef4a23] hover:text-white hover:border-[#ef4a23] text-stone-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
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
              <span className="w-4 h-0.5 bg-[#ef4a23] rounded-full inline-block" />
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
                    i === reviewIndex ? 'w-7 bg-[#ef4a23]' : 'w-2 bg-stone-300 hover:bg-stone-400'
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
        <section className="relative py-20 sm:py-28 bg-gradient-to-br from-[#FF5B35] via-[#FF6A42] to-[#FF4B22] text-white overflow-hidden" id="check-slots">
          {/* Floating 3D Soft Spheres matching Image 3 */}
          <div className="absolute -top-16 left-1/4 w-72 h-72 rounded-full bg-gradient-to-b from-[#FFA78F]/70 to-[#FF6948]/20 blur-xl pointer-events-none" />
          <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-[#FFD58C]/40 to-transparent blur-2xl pointer-events-none" />
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5B35]">
                      <Icon name="location" size={18} />
                    </div>
                    <select
                      value={ctaBranch}
                      onChange={(e) => setCtaBranch(e.target.value)}
                      className="w-full bg-[#FBF8F5] border border-slate-200 hover:border-[#FF5B35] focus:border-[#FF5B35] focus:ring-2 focus:ring-[#FF5B35]/20 rounded-2xl py-3.5 pl-11 pr-10 text-xs sm:text-sm font-bold text-slate-900 appearance-none transition-all cursor-pointer"
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
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5B35]">
                      <Icon name="calendar" size={18} />
                    </div>
                    <input
                      type="date"
                      value={ctaDate}
                      min={getTodayIST()}
                      onChange={(e) => setCtaDate(e.target.value)}
                      className="w-full bg-[#FBF8F5] border border-slate-200 hover:border-[#FF5B35] focus:border-[#FF5B35] focus:ring-2 focus:ring-[#FF5B35]/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Action Button - Solid Luxury Black */}
                <button
                  type="button"
                  onClick={handleCtaSubmit}
                  className="w-full py-4 rounded-2xl bg-[#141110] hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
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

    </div>
  );
}
