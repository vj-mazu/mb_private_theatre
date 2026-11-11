'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { GrandOccasionIcon, GrandAddonIcon } from '@/components/GrandIcons';

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
    borderColor: 'border-blue-300 hover:border-blue-500',
    bgGradient: 'bg-gradient-to-br from-blue-50/70 via-white to-white',
    iconBg: 'bg-gradient-to-br from-blue-100 to-blue-200/90 border border-blue-300/80',
    shadow: 'shadow-[0_4px_20px_rgba(37,99,235,0.08)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.22)]',
    badgeColor: 'bg-blue-100/90 text-blue-800 border-blue-200',
    arrowColor: 'text-blue-600',
  },
  {
    slug: 'farewell',
    title: 'Farewell / Bon Voyage',
    tagline: 'Emotional memory montage on giant 4K cinema screen',
    badge: 'Nostalgic',
    type: 'farewell',
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
    cardBorder: 'border-sky-300 hover:border-sky-500',
    bgGradient: 'bg-gradient-to-br from-sky-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-sky-100 to-sky-200/80 border border-sky-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(14,165,233,0.08)] hover:shadow-[0_12px_28px_rgba(14,165,233,0.2)]',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200'
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
    cardBorder: 'border-sky-300 hover:border-sky-500',
    bgGradient: 'bg-gradient-to-br from-sky-50/60 via-white to-white',
    iconBoxBg: 'bg-gradient-to-br from-sky-100 to-sky-200/80 border border-sky-300/80',
    shadow: 'shadow-[0_4px_16px_rgba(14,165,233,0.08)] hover:shadow-[0_12px_28px_rgba(14,165,233,0.2)]',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200'
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
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    cardBorder: 'border-sky-300',
    topOffset: 'top-24 sm:top-28',
    bgGradient: 'bg-gradient-to-br from-sky-50/40 via-white to-white',
    shadow: 'shadow-[0_20px_50px_rgba(14,165,233,0.12)]',
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

const theatres = [
  {
    name: 'Couple Room',
    meta: '2 guests · 2 hours',
    price: '₹1,499',
    dealPrice: '₹899',
    image: '/images/couple_1.webp',
    description: 'An intimate private screen designed for quiet dates, proposals and anniversaries.',
    branchSlug: 'electronic-city',
    theatreId: 1
  },
  {
    name: 'Celebration Room',
    meta: 'Up to 6 guests · 2 hours',
    price: '₹2,200',
    dealPrice: '₹1,499',
    image: '/images/celebration_2.webp',
    description: 'Your own celebration lounge with personalised décor, cinematic sound and space to party.',
    branchSlug: 'electronic-city',
    theatreId: 2
  },
  {
    name: 'Family Theatre',
    meta: 'Up to 20 guests · 2 hours',
    price: '₹2,200',
    dealPrice: '₹1,699',
    image: '/images/ambience_5.webp',
    description: 'A big-screen experience for families and groups with Dolby sound and comfortable seating.',
    branchSlug: 'electronic-city',
    theatreId: 3
  },
];

const slotRooms = [
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
    slots: ['10:00 AM', '12:15 PM', '02:30 PM', '05:00 PM', '06:30 PM', '08:45 PM', '11:00 PM'],
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
    slots: ['09:30 AM', '12:00 PM', '02:30 PM', '04:45 PM', '07:00 PM', '09:15 PM', '11:30 PM'],
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
    image: '/images/ambience_5.webp',
    slots: ['10:00 AM', '12:30 PM', '03:00 PM', '06:00 PM', '08:30 PM', '10:45 PM'],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 4,
    name: 'Couple Theatre',
    capacity: 'Up to 2 guests',
    spec: '4K Cinema · Dolby Sound',
    price: '₹1,499',
    custom: '₹899',
    image: '/images/couple_3.webp',
    slots: ['10:00 AM', '12:15 PM', '02:30 PM', '05:00 PM', '07:15 PM', '09:30 PM'],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 5,
    name: 'Celebration Theatre',
    capacity: 'Up to 6 guests',
    spec: '4K Cinema · Premium Audio',
    price: '₹2,200',
    custom: '₹1,499',
    image: '/images/celebration_1.webp',
    slots: ['09:30 AM', '12:00 PM', '02:30 PM', '05:00 PM', '07:30 PM', '10:00 PM'],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 7,
    name: 'VIP Celebration Suite',
    capacity: 'Up to 8 guests',
    spec: 'Ambient Wall · Karaoke',
    price: '₹2,800',
    custom: '₹1,599',
    image: '/images/ambience_8.webp',
    slots: ['10:00 AM', '12:30 PM', '03:00 PM', '05:30 PM', '08:00 PM', '10:30 PM'],
  },
  {
    branch: 'BTM 2nd Stage',
    branchSlug: 'btm-stage-2',
    theatreId: 6,
    name: 'Family Theatre',
    capacity: '12–20 guests',
    spec: 'Giant Screen · Dolby Audio',
    price: '₹3,500',
    custom: '₹1,699',
    image: '/images/ambience_3.webp',
    slots: ['10:00 AM', '01:00 PM', '04:00 PM', '07:00 PM', '10:00 PM'],
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
  ['/images/ambience_5.webp', 'Private group celebration'],
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
    quote: "The room looked even better than the pictures. The fog entry, decoration and every little detail made our anniversary feel truly personal.",
    author: "Riya & Arjun",
    occasion: "Celebrated 3rd Anniversary at Electronic City",
    stars: "★★★★★",
    tag: "Romantic Suite"
  },
  {
    quote: "Surprised my best friend for her 25th birthday here! The private 4K screen with our childhood memory video, the fog walk-in, and the chocolate truffle cake were beyond magical.",
    author: "Pooja Hegde & Friends",
    occasion: "Celebrated 25th Birthday at BTM 2nd Stage",
    stars: "★★★★★",
    tag: "Celebration Hall"
  },
  {
    quote: "She said YES! The candlelight rose pathway, glowing LED marquee letters, and cold pyro sparklers created the most breathtaking proposal moment. Thank you Movie Bash team!",
    author: "Karthik & Divya",
    occasion: "Romantic Proposal at Electronic City",
    stars: "★★★★★",
    tag: "Proposal Special"
  },
  {
    quote: "Our kids and their cousins had the best time of their lives! Watching their favorite cartoon movie with hot popcorn and friendly hosts was effortless and safe.",
    author: "Vikram & Ananya Sharma",
    occasion: "Kids 7th Birthday Party at BTM 2nd Stage",
    stars: "★★★★★",
    tag: "Family Party"
  },
  {
    quote: "Booked the family suite for our parents' 30th wedding anniversary. The comfort of private recliners and home-like privacy was worth every single rupee.",
    author: "Siddharth & Family",
    occasion: "Pearl Anniversary at Electronic City",
    stars: "★★★★★",
    tag: "Family Cinema"
  },
];

const heroPhotos = [
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
    category: 'Cakes',
    title: 'Fresh Pineapple & Belgian Chocolate Truffle Cakes',
    price: 'From ₹499 (0.5 Kg) · ₹899 (1 Kg)',
    desc: 'Pure Dutch dark chocolate ganache, luscious tropical pineapple layers, and ruby red velvet hearts freshly prepared for your screening.',
    badge: 'Guest Favorite',
    bg: 'from-[#FAF2DE] to-[#F5E6BF]',
    cardBorder: 'border-amber-400/80',
    tagColor: 'bg-amber-500/20 text-amber-950 border-amber-400',
    accent: '#ef4a23',
    image: '/images/celebration_6.webp',
    perks: ['Eggless options available', 'Sparkling celebration candle', 'Custom name message plaque', 'Cut & serve ceremony setup']
  },
  {
    number: '02',
    category: 'Special FX',
    title: 'Magical Dry-Ice Ground Fog & Golden Pyro Entry',
    price: 'From ₹199 to ₹799',
    desc: 'Walk through enchanting dense cold mist billowing at your feet, paired with indoor smokeless 6-foot golden fountain sparklers.',
    badge: 'Hero Entry FX',
    bg: 'from-[#E1F1FB] to-[#C9E4F7]',
    cardBorder: 'border-sky-400/80',
    tagColor: 'bg-sky-500/20 text-sky-950 border-sky-400',
    accent: '#0284c7',
    image: '/images/celebration_7.webp',
    perks: ['100% smokeless & indoor safe', 'Photogenic dream entrance', 'Rainbow bubble machine', 'Synced with entry music']
  },
  {
    number: '03',
    category: 'Romantic Décor',
    title: 'Handcrafted Dutch Roses & Candlelight Runway',
    price: 'From ₹399',
    desc: 'Surprise your partner with 15 luxury Dutch red roses, glowing Will-You-Marry-Me LED neon, candlelit petal carpet & heart arch.',
    badge: 'Couples & Proposals',
    bg: 'from-[#FCE7F3] to-[#FBCFE8]',
    cardBorder: 'border-pink-400/80',
    tagColor: 'bg-pink-500/20 text-pink-950 border-pink-400',
    accent: '#db2777',
    image: '/images/couple_5.webp',
    perks: ['Handcrafted fresh red roses', 'Fairy light canopy', 'Illuminated Marquee love letters', 'Romantic private setting']
  },
  {
    number: '04',
    category: 'Photography',
    title: '4K Memory Screening & Professional Reel Shoot',
    price: 'From ₹599 to ₹1,499',
    desc: 'Turn personal childhood photos and couple videos into a dramatic 4K cinema memory montage on the 150″ screen, filmed by our creator.',
    badge: 'Insta Ready',
    bg: 'from-[#EDE9FE] to-[#DDD6FE]',
    cardBorder: 'border-purple-400/80',
    tagColor: 'bg-purple-500/20 text-purple-950 border-purple-400',
    accent: '#7c3aed',
    image: '/images/celebration_3.webp',
    perks: ['4K Big screen video projection', 'Dedicated photographer', 'Edited 30s Instagram reel', 'High-res digital album']
  },
  {
    number: '05',
    category: 'Cinema Bites',
    title: 'Unlimited Theatre Butter Popcorn & Snack Bar',
    price: 'From ₹149 · Zero Corkage',
    desc: 'Piping hot golden butter popcorn, loaded Mexican cheese nachos with jalapeños, chilled mocktails, and zero corkage for Swiggy/Zomato.',
    badge: 'Party Binge',
    bg: 'from-[#FEF3C7] to-[#FDE68A]',
    cardBorder: 'border-yellow-400/80',
    tagColor: 'bg-amber-500/20 text-amber-950 border-yellow-500',
    accent: '#d97706',
    image: '/images/ambience_7.webp',
    perks: ['Freshly popped movie corn', 'Crispy nachos with dips', 'Zero outside food restriction', 'Complimentary cutlery & plates']
  }
];

export default function RefineTheatreLanding() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const cursorCardRef = useRef<HTMLDivElement>(null);
  const cursorCardInnerRef = useRef<HTMLDivElement>(null);
  const heroHeadlineRef = useRef<HTMLHeadingElement>(null);
  const heroMarqueeRef = useRef<HTMLDivElement>(null);
  const addonsSectionRef = useRef<HTMLDivElement>(null);
  const addonsPinRef = useRef<HTMLDivElement>(null);
  const addonsStackRootRef = useRef<HTMLDivElement>(null);
  const sunBadgeRef = useRef<SVGSVGElement>(null);
  const cursorPillRef = useRef<HTMLDivElement>(null);

  const [heroPhotoIndex, setHeroPhotoIndex] = useState(0);
  const [activeStackSlide, setActiveStackSlide] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [branch, setBranch] = useState('Electronic City');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotBranch, setSlotBranch] = useState('Electronic City');
  const [activeDay, setActiveDay] = useState(0);
  const [addonCategory, setAddonCategory] = useState<string>('All');
  const [addonViewMode, setAddonViewMode] = useState<'stacked' | 'grid'>('stacked');
  const [reviewIndex, setReviewIndex] = useState(0);
  const [ctaBranch, setCtaBranch] = useState('electronic-city');
  const [ctaDate, setCtaDate] = useState(() => new Date().toISOString().split('T')[0]);

  const handleCtaSubmit = () => {
    router.push(`/book-now/${ctaBranch}?date=${ctaDate}`);
  };

  // Auto-advance reviews every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % guestReviews.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // GSAP Animations: Hero Cursor, Font-Weight Tracking, Reversible Marquee, 3D Card Stack
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // 1. Hero Cursor Card Follower
    const hero = heroRef.current;
    const card = cursorCardRef.current;
    const inner = cursorCardInnerRef.current;
    let cardCleanup: (() => void) | undefined;

    if (hero && card && inner) {
      const quickX = gsap.quickTo(card, 'x', { duration: 0.8, ease: 'power4' });
      const quickY = gsap.quickTo(card, 'y', { duration: 0.8, ease: 'power4' });
      const quickRot = gsap.quickTo(card, 'rotation', { duration: 0.8, ease: 'power4' });
      const quickMediaX = gsap.quickTo(inner, 'x', { duration: 0.8, ease: 'power2' });
      const quickMediaY = gsap.quickTo(inner, 'y', { duration: 0.8, ease: 'power2' });

      let lastX = 0;
      let lastY = 0;
      let travelDist = 0;
      let isFirst = true;
      let resetTimer: NodeJS.Timeout | null = null;

      const handleMouseMove = (e: MouseEvent) => {
        const rect = hero.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isFirst) {
          isFirst = false;
          gsap.set(card, { x, y, autoAlpha: 1 });
          lastX = x;
          lastY = y;
          return;
        }

        gsap.to(card, { autoAlpha: 1, duration: 0.25, overwrite: 'auto' });
        quickX(x);
        quickY(y);

        const dx = x - lastX;
        const dy = y - lastY;
        const rot = Math.max(-12, Math.min(12, dx * 0.35));
        quickRot(rot);

        const clampDx = Math.max(-10, Math.min(10, dx * 0.5));
        const clampDy = Math.max(-10, Math.min(10, dy * 0.5));
        quickMediaX(-clampDx);
        quickMediaY(-clampDy);

        travelDist += Math.abs(dx) + Math.abs(dy);
        if (travelDist > 280) {
          travelDist = 0;
          setHeroPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
        }

        lastX = x;
        lastY = y;

        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          quickRot(0);
          quickMediaX(0);
          quickMediaY(0);
        }, 80);
      };

      const handleMouseLeave = () => {
        gsap.to(card, { autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
        quickRot(0);
        quickMediaX(0);
        quickMediaY(0);
        isFirst = true;
      };

      hero.addEventListener('mousemove', handleMouseMove);
      hero.addEventListener('mouseleave', handleMouseLeave);

      cardCleanup = () => {
        hero.removeEventListener('mousemove', handleMouseMove);
        hero.removeEventListener('mouseleave', handleMouseLeave);
        if (resetTimer) clearTimeout(resetTimer);
      };
    }

    // 2. Dynamic Headline Font-Weight Hover Interaction
    const headline = heroHeadlineRef.current;
    let headlineCleanup: (() => void) | undefined;
    if (headline && hero) {
      const chars = headline.querySelectorAll<HTMLElement>('.hero-headline-char');
      const handleMoveChars = (e: MouseEvent) => {
        chars.forEach((char) => {
          const rect = char.getBoundingClientRect();
          const cx = rect.left + rect.width / 2;
          const cy = rect.top + rect.height / 2;
          const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
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

    // 3. Hero Marquee Reversal on Scroll Direction
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

    // 4. 3D Card Stack with GSAP ScrollTrigger
    const addonsSection = addonsSectionRef.current;
    const addonsPin = addonsPinRef.current;
    const stackRoot = addonsStackRootRef.current;
    const badge = sunBadgeRef.current;
    let stackCleanup: (() => void) | undefined;

    if (addonsSection && addonsPin && stackRoot) {
      const mm = gsap.matchMedia();

      mm.add('(min-width: 992px)', () => {
        const slides = gsap.utils.toArray<HTMLElement>('.drops-slide');
        const count = slides.length;
        if (count === 0) return;

        slides.forEach((slide, b) => {
          gsap.set(slide, {
            z: -b * 120,
            y: -b * 40,
            zIndex: count - b,
            autoAlpha: 1,
            transformOrigin: '50% 50%',
          });
        });

        const tl = gsap.timeline({ paused: true });

        for (let b = 0; b < count - 1; b++) {
          const currentSlide = slides[b];
          tl.to(currentSlide, {
            y: `+=${window.innerHeight * 0.9}`,
            rotationX: 12,
            ease: 'power2.in',
            duration: 1,
          }, b);

          tl.to(currentSlide, {
            autoAlpha: 0,
            duration: 0.25,
            ease: 'none',
          }, b + 0.7);

          for (let k = b + 1; k < count; k++) {
            const nextIdx = k - (b + 1);
            tl.to(slides[k], {
              z: -nextIdx * 120,
              y: -nextIdx * 40,
              duration: 1,
              ease: 'none',
            }, b);
          }
        }

        if (badge) {
          tl.to(badge, { rotation: 180, duration: count - 1, ease: 'none' }, 0);
        }

        const st = ScrollTrigger.create({
          trigger: addonsSection,
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.15 * (count - 1)}`,
          pin: addonsPin,
          pinSpacing: true,
          scrub: 0.3,
          refreshPriority: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            tl.progress(self.progress);
            const activeIdx = Math.min(count - 1, Math.floor(self.progress * count));
            setActiveStackSlide(activeIdx);
          }
        });

        // 3D Mouse Tilt on Stack Root
        const quickTiltX = gsap.quickTo(stackRoot, 'rotationX', { duration: 0.6, ease: 'power3' });
        const quickTiltY = gsap.quickTo(stackRoot, 'rotationY', { duration: 0.6, ease: 'power3' });

        const handleMouseMoveTilt = (e: MouseEvent) => {
          const rect = addonsPin.getBoundingClientRect();
          const rotX = -((e.clientY - rect.top) / rect.height - 0.5) * 8;
          const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
          quickTiltX(rotX);
          quickTiltY(rotY);
        };

        const handleMouseLeaveTilt = () => {
          quickTiltX(0);
          quickTiltY(0);
        };

        addonsPin.addEventListener('mousemove', handleMouseMoveTilt);
        addonsPin.addEventListener('mouseleave', handleMouseLeaveTilt);

        return () => {
          st.kill();
          tl.kill();
          addonsPin.removeEventListener('mousemove', handleMouseMoveTilt);
          addonsPin.removeEventListener('mouseleave', handleMouseLeaveTilt);
        };
      });

      stackCleanup = () => {
        mm.revert();
      };
    }

    // 5. Cursor Pill Follower for Add-ons Stack
    const pill = cursorPillRef.current;
    if (pill && stackRoot) {
      const quickPillX = gsap.quickTo(pill, 'x', { duration: 0.35, ease: 'power3' });
      const quickPillY = gsap.quickTo(pill, 'y', { duration: 0.35, ease: 'power3' });

      const movePill = (e: MouseEvent) => {
        quickPillX(e.clientX);
        quickPillY(e.clientY);
      };

      const enterPill = () => {
        gsap.to(pill, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power3.out' });
      };

      const leavePill = () => {
        gsap.to(pill, { scale: 0, autoAlpha: 0, duration: 0.25, ease: 'power2.in' });
      };

      window.addEventListener('mousemove', movePill);
      stackRoot.addEventListener('mouseenter', enterPill);
      stackRoot.addEventListener('mouseleave', leavePill);
    }

    return () => {
      cardCleanup?.();
      headlineCleanup?.();
      marqueeCleanup?.();
      stackCleanup?.();
    };
  }, []);

  const nextReview = () => setReviewIndex((prev) => (prev + 1) % guestReviews.length);
  const prevReview = () => setReviewIndex((prev) => (prev - 1 + guestReviews.length) % guestReviews.length);

  const days = Array.from({ length: 6 }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() + index);
    return {
      label: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : day.toLocaleDateString('en-IN', { weekday: 'short' }),
      day: day.getDate(),
      month: day.toLocaleDateString('en-IN', { month: 'short' }),
      full: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      iso: day.toISOString().split('T')[0]
    };
  });

  const checkAvailability = () => {
    const branchSlug = branch === 'BTM 2nd Stage' ? 'btm-stage-2' : 'electronic-city';
    router.push(`/book-now/${branchSlug}?date=${date}`);
  };

  const handleSlotClick = (room: typeof slotRooms[0], time: string, isSold: boolean) => {
    if (isSold) return;
    const selectedIsoDate = days[activeDay].iso;
    router.push(`/book-now/${room.branchSlug}?date=${selectedIsoDate}&theatre=${room.theatreId}`);
  };

  return (
    <div className="min-h-screen overflow-hidden bg-cream text-ink select-none">
      
      {/* 1. TOP OFFER BAR */}
      <div className="offer-bar">
        <span>Opening offer</span>
        <p>Flat ₹200 off your first celebration with code <strong>MOVIEBASH200</strong></p>
        <a href="#slots">Explore <Icon name="arrow" size={16} /></a>
      </div>

      {/* 2. REAL SITE NAVBAR */}
      <Navbar />

      <main>
        {/* 3. KOLIBRIE-POWERED HERO SECTION */}
        <section 
          ref={heroRef}
          className="relative min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center text-center overflow-hidden pt-28 pb-16 px-4 sm:px-6 bg-[#141110]" 
          id="home"
        >
          {/* Looping Cinema Video Background */}
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-45 sm:opacity-50"
            src="/videos/video_1.mp4" 
          />

          {/* Luxury Warm Vignette Gradient */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#141110]/80 via-[#141110]/40 to-[#141110]/90 pointer-events-none" />

          {/* Floating 16rem Photo Cursor Card Follower (Cycles Movie Bash photos on travel) */}
          <div 
            ref={cursorCardRef} 
            className="absolute top-0 left-0 w-56 h-56 sm:w-64 sm:h-64 -translate-x-1/2 -translate-y-1/2 z-20 rounded-3xl overflow-hidden pointer-events-none shadow-[0_25px_60px_rgba(0,0,0,0.6)] border-2 border-white/40 hidden md:block"
            style={{ opacity: 0 }}
          >
            <div ref={cursorCardInnerRef} className="relative w-full h-full scale-110">
              <Image 
                src={heroPhotos[heroPhotoIndex]} 
                alt="Movie Bash Private Cinema Experience"
                fill
                className="object-cover transition-opacity duration-300"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                  Movie Bash Magic
                </span>
              </div>
            </div>
          </div>

          {/* Top Eyebrow */}
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-amber-300 text-xs font-bold uppercase tracking-widest shadow-md mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Bengaluru&apos;s #1 Luxury Private Celebration Cinema</span>
            </div>

            {/* Interactive Dynamic Font-Weight Headline */}
            <h1 
              ref={heroHeadlineRef}
              className="text-white font-['Archivo'] uppercase tracking-tight leading-[0.92] text-4xl sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl cursor-default select-none my-2"
            >
              <div className="block">
                {"YOUR MOMENT.".split('').map((c, i) => (
                  <span key={`l1-${i}`} className="hero-headline-char font-bold" data-serif="false">
                    {c === ' ' ? '\u00A0' : c}
                  </span>
                ))}
              </div>
              <div className="block text-amber-400 font-['Playfair'] italic normal-case tracking-normal my-1 sm:my-2">
                {"*Your Movie.*".split('').map((c, i) => (
                  <span key={`l2-${i}`} className="hero-headline-char font-normal" data-serif="true">
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

            {/* Hero Subtitle */}
            <p className="mt-5 text-sm sm:text-base md:text-lg text-slate-200/90 font-medium max-w-2xl leading-relaxed">
              Fully private 4K laser cinema screening, custom celebrations, fog entry, and handcrafted cakes for couples, birthdays, and groups.
            </p>

            {/* Hand-Drawn SVG Underline & Slide-Down Arrow CTA */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-5 sm:gap-8">
              <a 
                href="#slots" 
                className="group relative inline-flex items-center gap-3 text-lg sm:text-xl font-['Playfair'] font-medium text-white hover:text-amber-300 transition-colors py-1 cursor-pointer"
              >
                <span>Plan Your Celebration</span>
                {/* Arrow Square Slider Button */}
                <span className="w-8 h-8 rounded-lg bg-[#ef4a23] group-hover:bg-[#ff5d38] flex items-center justify-center overflow-hidden transition-colors shadow-md">
                  <span className="flex flex-col items-center transition-transform duration-300 group-hover:-translate-y-1/2">
                    <span className="text-white text-sm font-bold my-1">↓</span>
                    <span className="text-white text-sm font-bold my-1">↓</span>
                  </span>
                </span>

                {/* Hand-drawn SVG wavy underline */}
                <svg 
                  className="absolute left-0 -bottom-2 w-full h-3 text-[#ef4a23]" 
                  viewBox="0 0 200 12" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M3 8.5C35 2.5 75 11 110 5.5C145 0 175 9.5 197 7" 
                    stroke="currentColor" 
                    strokeWidth="3.2" 
                    strokeLinecap="round" 
                  />
                </svg>
              </a>

              <a 
                href="#theatres" 
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 flex items-center gap-2"
              >
                <Icon name="play" size={16} />
                <span>Explore Theatres</span>
              </a>
            </div>

            {/* Quick Slot Booking Bar */}
            <div className="mt-8 sm:mt-10 w-full max-w-2xl bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl sm:rounded-full p-2.5 sm:p-2 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl">
              <div className="flex items-center gap-2 px-3 w-full sm:w-auto">
                <span className="text-amber-400"><Icon name="location" size={18} /></span>
                <select 
                  value={branch} 
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer w-full [&>option]:text-ink"
                >
                  <option value="Electronic City">Electronic City Branch</option>
                  <option value="BTM 2nd Stage">BTM 2nd Stage Branch</option>
                </select>
              </div>

              <div className="w-full sm:w-px h-px sm:h-8 bg-white/20" />

              <div className="flex items-center gap-2 px-3 w-full sm:w-auto">
                <span className="text-amber-400"><Icon name="calendar" size={18} /></span>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="bg-transparent text-white font-bold text-xs sm:text-sm focus:outline-none cursor-pointer w-full [color-scheme:dark]"
                />
              </div>

              <button 
                type="button" 
                onClick={checkAvailability}
                className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#ef4a23] hover:bg-[#ff5d38] text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span>Check Slots</span>
                <Icon name="arrow" size={16} />
              </button>
            </div>

            {/* Trust Reviews Pill */}
            <div className="mt-6 flex items-center gap-3 text-slate-300 text-xs font-semibold">
              <div className="flex -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white">RS</span>
                <span className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white">AK</span>
                <span className="w-6 h-6 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center border border-white">NM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-400 font-bold">★★★★★</span>
                <span>Loved by 12,500+ guests in Bengaluru</span>
              </div>
            </div>
          </div>

          {/* Reversible Client / Feature Marquee at Bottom */}
          <div 
            ref={heroMarqueeRef}
            className="w-full overflow-hidden flex relative z-10 pt-10 border-t border-white/10 mt-8"
          >
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-white/80">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">⭐ 4.9★ RATED (12,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🎂 HANDCRAFTED GOURMET CAKES</span>
            </div>
            <div className="hero-marquee-track flex items-center gap-8 shrink-0 whitespace-nowrap text-xs font-black uppercase tracking-wider text-white/80">
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">⭐ 4.9★ RATED (12,500+ GUESTS)</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🎬 4K LASER SCREENING</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🔊 DOLBY ATMOS 7.1.2 SURROUND</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🔒 100% PRIVATE & SOUNDPROOF</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">✨ DRAMATIC FOG & PYRO ENTRY</span>
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10">🎂 HANDCRAFTED GOURMET CAKES</span>
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
              {slotRooms.filter((room) => room.branch === slotBranch).map((room) => (
                <article className="slot-room" key={room.name}>
                  <div className="relative w-full h-[220px]">
                    <Image 
                      src={room.image} 
                      alt={`${room.name} at Movie Bash ${slotBranch}`} 
                      fill 
                      className="object-cover" 
                      sizes="(max-width: 800px) 100vw, 210px"
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

                    {/* Slots Grid */}
                    <div className="slot-grid">
                      {room.slots.map((time, index) => {
                        const isSold = index === 3 && activeDay === 0;
                        return (
                          <button
                            key={time}
                            disabled={isSold}
                            onClick={() => handleSlotClick(room, time, isSold)}
                            className={isSold ? 'slot sold' : 'slot cursor-pointer'}
                            title={isSold ? 'Booked' : `Reserve ${room.name} at ${time}`}
                          >
                            <strong>{time}</strong>
                            <span>{isSold ? 'Booked' : 'Available'}</span>
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

        {/* 6. WHAT ARE YOU CELEBRATING? OCCASIONS GRID (GRAND ICONS & ATTRACTIVE BORDERS) */}
        <section className="section occasions" id="experiences">
          <div className="section-heading centered">
            <div className="eyebrow"><span /> Moments worth making special <span /></div>
            <h2>What are you <em>celebrating?</em></h2>
            <p>Whatever the occasion, we set the stage with magical lighting, romantic setups, and 4K cinema. You simply walk in and enjoy your moment.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10 max-w-6xl mx-auto">
            {occasionsList.map((occ) => (
              <Link
                key={occ.slug}
                href={`/book-now?occasion=${occ.slug}`}
                className={`group relative p-6 rounded-3xl border-2 ${occ.borderColor} ${occ.bgGradient} ${occ.shadow} hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden`}
              >
                <div>
                  {/* Top Row: Grand Icon & Luxury Badge */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-14 h-14 rounded-2xl ${occ.iconBg} flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-300 shadow-xs`}>
                      <GrandOccasionIcon type={occ.type} className="w-9 h-9 drop-shadow-sm" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${occ.badgeColor}`}>
                      {occ.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="font-playfair text-xl font-bold text-ink group-hover:text-[#237eea] transition-colors leading-tight">
                      {occ.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed mt-2">
                      {occ.tagline}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Strip */}
                <div className="mt-5 pt-3.5 border-t border-slate-200/60 flex items-center justify-between text-xs font-black">
                  <span className="text-slate-500 font-bold group-hover:text-ink transition-colors">
                    Private 4K Screening
                  </span>
                  <span className={`flex items-center gap-1.5 ${occ.arrowColor} group-hover:translate-x-1.5 transition-transform`}>
                    <span>Select Setup</span>
                    <span className="text-sm font-bold">&rarr;</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 7. SIGNATURE CELEBRATION PACKAGE BANNER */}
        <section className="section package-section" id="packages">
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

        {/* 8. 3-TIER PRICING & ADD-ONS */}
        <section className="section package-pricing">
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

        {/* 8B. SCROLL-TRIGGERED 3D CARD STACKING ANIMATION (ADD-ONS & ATMOSPHERE) */}
        <section 
          ref={addonsSectionRef} 
          className="relative bg-[#faf3e4] text-[#141110] border-y border-[#141110]/10 overflow-hidden" 
          id="addons"
        >
          {/* Floating Cursor Pill Follower */}
          <div 
            ref={cursorPillRef}
            className="fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none scale-0 opacity-0 hidden lg:block"
          >
            <div className="px-4 py-2 rounded-full bg-[#ef4a23] text-white font-['Archivo'] font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-1.5 border border-white/30">
              <span>Select Add-on</span>
              <span>&rarr;</span>
            </div>
          </div>

          {/* Desktop Pinned Stage (>= 992px) */}
          <div 
            ref={addonsPinRef} 
            className="hidden lg:grid lg:grid-cols-12 gap-8 items-center h-screen w-full px-8 xl:px-16 overflow-hidden max-w-7xl mx-auto"
          >
            {/* Left Column: Editorial Headline & Rotating Sun Badge */}
            <div className="lg:col-span-5 space-y-6 text-left pr-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ef4a23]/10 border border-[#ef4a23]/30 text-[#ef4a23] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#ef4a23]" />
                <span>Handcrafted Add-ons</span>
              </div>

              <h2 className="font-['Archivo'] text-4xl xl:text-5xl font-black uppercase tracking-tight text-[#141110] leading-[1.02]">
                Every detail, <br />
                <span className="font-['Playfair'] italic font-normal text-[#ef4a23] normal-case">made to delight.</span>
              </h2>

              <p className="font-['Playfair'] text-base text-slate-700 font-medium leading-relaxed max-w-md">
                From pure Belgian chocolate cakes to dramatic dry-ice fog entries and romantic candlelight aisles, customize your screening into a grand celebration.
              </p>

              {/* Rotating Circular Sun Badge */}
              <div className="pt-2 flex items-center gap-6">
                <div className="relative w-24 h-24 shrink-0">
                  <svg 
                    ref={sunBadgeRef}
                    viewBox="0 0 120 120" 
                    className="w-full h-full text-[#ef4a23]"
                  >
                    <path
                      id="sunBadgeTextPath"
                      d="M 60, 60 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0"
                      fill="none"
                    />
                    <text className="text-[10.5px] uppercase tracking-[0.2em] font-['Archivo'] font-black fill-[#141110]">
                      <textPath href="#sunBadgeTextPath" startOffset="0%">
                        ✦ SCROLL · DISCOVER · CUSTOMIZE · CELEBRATE ·
                      </textPath>
                    </text>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-8 h-8 rounded-full bg-[#ffd46e] text-[#141110] flex items-center justify-center font-black text-xs shadow-sm">
                      ★
                    </span>
                  </div>
                </div>

                {/* Active Card Progress */}
                <div className="space-y-1.5">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Active Extra: <span className="text-[#ef4a23] font-black">{activeStackSlide + 1} / {addonSlides.length}</span>
                  </div>
                  <div className="w-36 h-2 bg-black/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#ef4a23] transition-all duration-300 rounded-full"
                      style={{ width: `${((activeStackSlide + 1) / addonSlides.length) * 100}%` }}
                    />
                  </div>
                  <small className="text-[11px] text-slate-500 block font-semibold">
                    Scroll down to peel cards
                  </small>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <Link
                  href="/book-now"
                  className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-[#141110] hover:bg-[#ef4a23] text-white font-['Archivo'] font-black text-xs uppercase tracking-wider shadow-xl transition-all hover:scale-105 cursor-pointer"
                >
                  <span>Build Celebration with Add-ons</span>
                  <span className="text-sm">&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Perspective Card Stack */}
            <div className="lg:col-span-7 relative h-[580px] perspective-1400 flex items-center justify-center">
              <div 
                ref={addonsStackRootRef} 
                className="relative w-full h-full transform-style-3d flex items-center justify-center"
              >
                {addonSlides.map((slide, idx) => (
                  <div
                    key={slide.number}
                    className={`drops-slide absolute w-[460px] xl:w-[490px] rounded-[32px] p-7 bg-gradient-to-br ${slide.bg} border-2 ${slide.cardBorder} shadow-[0_30px_70px_rgba(20,17,16,0.18)] flex flex-col justify-between cursor-pointer select-none`}
                  >
                    <div>
                      {/* Top Bar: Number & Category Badge */}
                      <div className="flex items-center justify-between pb-4 border-b border-black/10 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="w-10 h-10 rounded-2xl bg-[#141110] text-[#ffd46e] flex items-center justify-center font-['Archivo'] font-black text-sm shadow">
                            {slide.number}
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-[#141110]">
                            {slide.category}
                          </span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${slide.tagColor}`}>
                          {slide.badge}
                        </span>
                      </div>

                      {/* Photo Banner */}
                      <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4 shadow-inner border border-black/10">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 1200px) 460px, 490px"
                        />
                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                          {slide.price}
                        </div>
                      </div>

                      {/* Title & Desc */}
                      <h3 className="font-['Playfair'] text-xl font-bold text-[#141110] leading-snug">
                        {slide.title}
                      </h3>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed mt-2 line-clamp-2">
                        {slide.desc}
                      </p>

                      {/* Perks Grid */}
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-black/10">
                        {slide.perks.map((perk) => (
                          <div key={perk} className="flex items-center gap-1.5 text-[11px] font-bold text-[#141110]">
                            <span className="w-4 h-4 rounded-full bg-[#ef4a23]/20 text-[#ef4a23] flex items-center justify-center text-[10px] font-black shrink-0">✓</span>
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="mt-5 pt-3.5 border-t border-black/10 flex items-center justify-between">
                      <span className="text-xs font-black text-[#141110]">
                        {slide.price}
                      </span>
                      <Link
                        href="/book-now"
                        className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#ef4a23] hover:text-[#141110] transition-colors"
                      >
                        <span>Select in Booking</span>
                        <span className="text-sm font-bold">&rarr;</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile & Tablet Fallback (< 992px) */}
          <div className="lg:hidden py-14 px-4 sm:px-6">
            <div className="text-center max-w-xl mx-auto mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ef4a23]/10 border border-[#ef4a23]/30 text-[#ef4a23] text-xs font-black uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#ef4a23]" />
                <span>Handcrafted Add-ons</span>
              </div>
              <h2 className="font-['Archivo'] text-3xl font-black uppercase tracking-tight text-[#141110]">
                Every detail, <span className="font-['Playfair'] italic font-normal text-[#ef4a23] normal-case">made to delight.</span>
              </h2>
              <p className="text-xs text-slate-700 font-medium">
                Swipe through our celebration extras: freshly baked cakes, dramatic dry-ice fog entries, and romantic candlelight setups.
              </p>
            </div>

            {/* Mobile Cards Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory">
              {addonSlides.map((slide) => (
                <div
                  key={slide.number}
                  className={`w-[85vw] max-w-sm shrink-0 snap-center rounded-3xl p-6 bg-gradient-to-br ${slide.bg} border-2 ${slide.cardBorder} shadow-lg flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-[#141110] text-[#ffd46e] flex items-center justify-center font-['Archivo'] font-black text-xs">
                        {slide.number}
                      </span>
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${slide.tagColor}`}>
                        {slide.badge}
                      </span>
                    </div>

                    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                      <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <h3 className="font-['Playfair'] text-lg font-bold text-[#141110]">
                      {slide.title}
                    </h3>
                    <p className="text-xs text-slate-700 font-medium mt-1.5 leading-relaxed">
                      {slide.desc}
                    </p>

                    <div className="space-y-1.5 mt-3 pt-3 border-t border-black/10">
                      {slide.perks.slice(0, 3).map((perk) => (
                        <div key={perk} className="flex items-center gap-1.5 text-[11px] font-bold text-[#141110]">
                          <span className="text-[#ef4a23] font-black">✓</span>
                          <span>{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between">
                    <span className="text-xs font-black text-[#141110]">{slide.price}</span>
                    <Link
                      href="/book-now"
                      className="text-xs font-black text-[#ef4a23] flex items-center gap-1"
                    >
                      <span>Add</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/book-now"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#141110] text-white font-['Archivo'] font-black text-xs uppercase tracking-wider shadow-lg"
              >
                <span>Add Extras in Online Booking</span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 9. PICK YOUR PRIVATE THEATRE */}
        <section className="section theatres" id="theatres">
          <div className="section-heading heading-row">
            <div>
              <div className="eyebrow"><span /> Your space, your way</div>
              <h2>Pick your <em>private theatre</em></h2>
            </div>
            <p>From an intimate date for two to a full family celebration, there’s a room waiting for your story.</p>
          </div>

          <div className="theatre-grid">
            {theatres.map((theatre, i) => (
              <article className="theatre-card" key={theatre.name}>
                <div className="theatre-image relative">
                  <Image 
                    src={theatre.image} 
                    alt={`${theatre.name} private cinema`} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 800px) 100vw, 33vw"
                  />
                  {i === 1 && <span className="popular">Most loved</span>}
                  <span className="photo-count"><Icon name="camera" size={15} /> View photos</span>
                </div>

                <div className="theatre-copy">
                  <div className="theatre-title">
                    <div>
                      <h3>{theatre.name}</h3>
                      <p>{theatre.meta}</p>
                    </div>
                    <div className="price">
                      <small>From</small>
                      <strong>{theatre.dealPrice}</strong>
                    </div>
                  </div>

                  <p>{theatre.description}</p>
                  
                  <Link href={`/book-now/${theatre.branchSlug}?theatre=${theatre.theatreId}`} className="cursor-pointer">
                    View room & slots <Icon name="arrow" size={17} />
                  </Link>
                </div>
              </article>
            ))}
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
        <section className="gallery-section">
          <div className="section">
            <div className="section-heading heading-row">
              <div>
                <div className="eyebrow"><span /> Real Movie Bash celebrations</div>
                <h2>See how moments<br /><em>come to life.</em></h2>
              </div>
              <p>Real, unedited setups from birthdays, anniversaries, proposals, baby showers and private movie nights.</p>
            </div>

            <div className="gallery-grid">
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
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-sky-200 bg-white/90 hover:bg-[#237eea] hover:text-white hover:border-[#237eea] text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
          >
            <span className="text-xl font-bold leading-none -mt-0.5">&lsaquo;</span>
          </button>

          <button
            type="button"
            onClick={nextReview}
            aria-label="Next review"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-sky-200 bg-white/90 hover:bg-[#237eea] hover:text-white hover:border-[#237eea] text-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer z-10 opacity-70 group-hover:opacity-100"
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

            <blockquote key={reviewIndex} className="transition-all duration-500 min-h-[110px] flex items-center justify-center">
              &ldquo;{guestReviews[reviewIndex].quote}&rdquo;
            </blockquote>

            <p className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm">
              <strong className="text-ink font-bold">{guestReviews[reviewIndex].author}</strong>
              <span className="w-4 h-0.5 bg-[#237eea] rounded-full inline-block" />
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
                    i === reviewIndex ? 'w-7 bg-[#237eea]' : 'w-2 bg-slate-300 hover:bg-slate-400'
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
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCtaDate(e.target.value)}
                      className="w-full bg-[#FBF8F5] border border-slate-200 hover:border-[#FF5B35] focus:border-[#FF5B35] focus:ring-2 focus:ring-[#FF5B35]/20 rounded-2xl py-3.5 pl-11 pr-4 text-xs sm:text-sm font-bold text-slate-900 transition-all cursor-pointer"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleCtaSubmit}
                  className="w-full py-4 rounded-2xl bg-[#0A1F5C] hover:bg-[#06143c] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
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
