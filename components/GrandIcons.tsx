'use client';

import React from 'react';

// ==========================================
// 1. GRAND OCCASION ICONS (Vibrant, Modern, Custom Illustrated)
// ==========================================

export function GrandOccasionIcon({ type, className = "w-8 h-8" }: { type: string; className?: string }) {
  switch (type) {
    case 'birthday-party':
      // 3-Tier Celebration Cake with glowing candles & confetti
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cakeGrad" x1="6" y1="18" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="frostGrad" x1="8" y1="18" x2="40" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FEF3C7" />
              <stop offset="1" stopColor="#FDE68A" />
            </linearGradient>
            <linearGradient id="flameGrad" x1="12" y1="4" x2="36" y2="14" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF4444" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#FCD34D" />
            </linearGradient>
          </defs>
          {/* Cake Base */}
          <rect x="8" y="28" width="32" height="15" rx="3" fill="url(#cakeGrad)" stroke="#B45309" strokeWidth="1.5" />
          {/* Cake Top Tier */}
          <rect x="13" y="18" width="22" height="11" rx="2.5" fill="url(#cakeGrad)" stroke="#B45309" strokeWidth="1.5" />
          {/* Cream Frosting Swirls */}
          <path d="M13 22C15 24 17 22 19 24C21 26 23 24 25 24C27 24 29 26 31 24C33 22 35 23 35 22" stroke="url(#frostGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M8 32C11 34 14 32 17 34C20 36 23 34 26 34C29 34 32 36 35 34C38 32 40 33 40 32" stroke="url(#frostGrad)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Candles */}
          <rect x="18" y="10" width="2.5" height="8" rx="1.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          <rect x="23" y="8" width="2.5" height="10" rx="1.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          <rect x="28" y="10" width="2.5" height="8" rx="1.2" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          {/* Flames */}
          <path d="M19.25 5C19.25 5 18 7.5 19.25 8.5C20.5 7.5 19.25 5 19.25 5Z" fill="url(#flameGrad)" />
          <path d="M24.25 3C24.25 3 23 5.5 24.25 6.5C25.5 5.5 24.25 3 24.25 3Z" fill="url(#flameGrad)" />
          <path d="M29.25 5C29.25 5 28 7.5 29.25 8.5C30.5 7.5 29.25 5 29.25 5Z" fill="url(#flameGrad)" />
          {/* Sparkles */}
          <path d="M6 14L7 11L10 10L7 9L6 6L5 9L2 10L5 11L6 14Z" fill="#F59E0B" opacity="0.85" />
          <path d="M42 16L43 14L45 13L43 12L42 10L41 12L39 13L41 14L42 16Z" fill="#F59E0B" opacity="0.85" />
        </svg>
      );

    case 'date-and-proposal':
      // Solitaire Diamond Engagement Ring with starburst flares
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ringGold" x1="10" y1="16" x2="38" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDA4AF" />
              <stop offset="0.5" stopColor="#F43F5E" />
              <stop offset="1" stopColor="#BE123C" />
            </linearGradient>
            <linearGradient id="diamondGrad" x1="16" y1="4" x2="32" y2="18" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" />
              <stop offset="0.5" stopColor="#E0E7FF" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
          </defs>
          {/* Ring Band */}
          <circle cx="24" cy="28" r="13" stroke="url(#ringGold)" strokeWidth="4.5" />
          <circle cx="24" cy="28" r="10" stroke="#FFF1F2" strokeWidth="1" opacity="0.6" />
          {/* Ring Mount Prongs */}
          <path d="M19 18L21 14H27L29 18" stroke="#F43F5E" strokeWidth="2.5" strokeLinecap="round" />
          {/* Solitaire Diamond Gem */}
          <polygon points="24,6 30,12 24,19 18,12" fill="url(#diamondGrad)" stroke="#4F46E5" strokeWidth="1.2" />
          <line x1="18" y1="12" x2="30" y2="12" stroke="#FFFFFF" strokeWidth="1.2" />
          <line x1="24" y1="6" x2="24" y2="19" stroke="#FFFFFF" strokeWidth="1" />
          {/* Sparkles / Flashes */}
          <path d="M12 8L13.5 4L15 8L19 9.5L15 11L13.5 15L12 11L8 9.5L12 8Z" fill="#F43F5E" />
          <path d="M36 8L37 5L38 8L41 9L38 10L37 13L36 10L33 9L36 8Z" fill="#FB7185" />
        </svg>
      );

    case 'anniversary':
      // Glowing Intertwined Ruby Hearts with celebration ribbon
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="heartGrad1" x1="10" y1="12" x2="32" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB7185" />
              <stop offset="1" stopColor="#E11D48" />
            </linearGradient>
            <linearGradient id="heartGrad2" x1="18" y1="8" x2="40" y2="34" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#9F1239" />
            </linearGradient>
          </defs>
          {/* Back Heart */}
          <path d="M30 11C28 9 25 9.5 24 11C23 9.5 20 9 18 11C15 14 15 18 18 22L24 28L30 22C33 18 33 14 30 11Z" fill="url(#heartGrad1)" opacity="0.85" />
          {/* Front Heart (Tilted) */}
          <path d="M21 16C17 12 11 14 11 20C11 26 18 32 24 37C30 32 37 26 37 20C37 14 31 12 27 16L24 19L21 16Z" fill="url(#heartGrad2)" stroke="#FFF1F2" strokeWidth="1.5" />
          {/* Sparkle Highlights */}
          <circle cx="17" cy="18" r="2" fill="#FFFFFF" opacity="0.9" />
          <path d="M38 12L39 9L40 12L43 13L40 14L39 17L38 14L35 13L38 12Z" fill="#F43F5E" />
          <path d="M9 28L10 26L11 28L13 29L11 30L10 32L9 30L7 29L9 28Z" fill="#FB7185" />
        </svg>
      );

    case 'couple-date':
      // Cozy Couple Cinema Lounge Screen & Sparkling Popcorn
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="screenGrad" x1="4" y1="6" x2="44" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4338CA" />
            </linearGradient>
            <linearGradient id="sofaGrad" x1="8" y1="26" x2="40" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818CF8" />
              <stop offset="1" stopColor="#3730A3" />
            </linearGradient>
          </defs>
          {/* 4K Cinema Screen */}
          <rect x="6" y="8" width="36" height="20" rx="3" fill="url(#screenGrad)" stroke="#C7D2FE" strokeWidth="1.5" />
          {/* Cinema Screen Content (Play & Hearts) */}
          <path d="M21 14L28 18L21 22V14Z" fill="#FDE047" />
          {/* Cozy Couple Recliner Sofa */}
          <path d="M9 34C9 30 13 28 24 28C35 28 39 30 39 34V41C39 42 38 43 37 43H11C10 43 9 42 9 41V34Z" fill="url(#sofaGrad)" stroke="#312E81" strokeWidth="1.5" />
          {/* Sofa Pillow Cushions */}
          <rect x="13" y="32" width="10" height="7" rx="2" fill="#A5B4FC" opacity="0.9" />
          <rect x="25" y="32" width="10" height="7" rx="2" fill="#A5B4FC" opacity="0.9" />
          {/* Golden Ambiance Stars */}
          <path d="M4 14L5 12L7 11L5 10L4 8L3 10L1 11L3 12L4 14Z" fill="#FBBF24" />
          <path d="M44 24L45 22L47 21L45 20L44 18L43 20L41 21L43 22L44 24Z" fill="#FBBF24" />
        </svg>
      );

    case 'bachelorette-party':
      // Imperial Princess Celebration Tiara / Crown with diamonds
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="tiaraGold" x1="6" y1="12" x2="42" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F472B6" />
              <stop offset="0.5" stopColor="#EC4899" />
              <stop offset="1" stopColor="#BE185D" />
            </linearGradient>
            <linearGradient id="gemFuchsia" x1="16" y1="14" x2="32" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDF4FF" />
              <stop offset="1" stopColor="#F0ABFC" />
            </linearGradient>
          </defs>
          {/* Tiara Crown Arch */}
          <path d="M7 33L10 16L18 24L24 11L30 24L38 16L41 33H7Z" fill="url(#tiaraGold)" stroke="#9D174D" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Headband Base */}
          <rect x="6" y="33" width="36" height="5" rx="2.5" fill="#BE185D" stroke="#831843" strokeWidth="1" />
          {/* Crown Jewels / Pearls */}
          <circle cx="24" cy="11" r="3.2" fill="url(#gemFuchsia)" stroke="#FFFFFF" strokeWidth="1.2" />
          <circle cx="10" cy="16" r="2.5" fill="url(#gemFuchsia)" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="38" cy="16" r="2.5" fill="url(#gemFuchsia)" stroke="#FFFFFF" strokeWidth="1" />
          {/* Center Heart Gem */}
          <path d="M24 23C22.5 21 20 21.5 20 23.5C20 25.5 24 28.5 24 28.5C24 28.5 28 25.5 28 23.5C28 21.5 25.5 21 24 23Z" fill="#FFFFFF" />
          {/* Celebration Sparkles */}
          <path d="M12 7L13 5L15 4L13 3L12 1L11 3L9 4L11 5L12 7Z" fill="#F472B6" />
          <path d="M37 7L38 5L40 4L38 3L37 1L36 3L34 4L36 5L37 7Z" fill="#F472B6" />
        </svg>
      );

    case 'kids-birthday':
      // Vibrant Party Helium Balloons with Streamers & Confetti
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="balloonCyan" x1="16" y1="4" x2="32" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#0284C7" />
            </linearGradient>
            <linearGradient id="balloonAmber" x1="6" y1="12" x2="22" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="balloonRose" x1="26" y1="12" x2="42" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="1" stopColor="#BE123C" />
            </linearGradient>
          </defs>
          {/* Left Balloon */}
          <ellipse cx="15" cy="20" rx="8" ry="10" fill="url(#balloonAmber)" stroke="#B45309" strokeWidth="1.2" />
          <polygon points="15,30 13,32 17,32" fill="#B45309" />
          <path d="M15 32C13 36 17 38 15 43" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" />
          {/* Right Balloon */}
          <ellipse cx="33" cy="20" rx="8" ry="10" fill="url(#balloonRose)" stroke="#9F1239" strokeWidth="1.2" />
          <polygon points="33,30 31,32 35,32" fill="#9F1239" />
          <path d="M33 32C35 36 31 38 33 43" stroke="#BE123C" strokeWidth="1.2" strokeLinecap="round" />
          {/* Center Balloon (Front & Higher) */}
          <ellipse cx="24" cy="14" rx="9" ry="11" fill="url(#balloonCyan)" stroke="#0369A1" strokeWidth="1.5" />
          <polygon points="24,25 22,27 26,27" fill="#0369A1" />
          <path d="M24 27C22 31 26 36 24 44" stroke="#0284C7" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="21" cy="9" rx="2.5" ry="4" fill="#FFFFFF" opacity="0.6" />
          {/* Stars & Confetti */}
          <circle cx="7" cy="8" r="1.5" fill="#F59E0B" />
          <circle cx="41" cy="8" r="1.5" fill="#38BDF8" />
          <rect x="38" y="32" width="2" height="2" transform="rotate(45 38 32)" fill="#10B981" />
        </svg>
      );

    case 'baby-shower':
      // Sweet Golden Fairy Baby Carriage / Pram with Halo
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pramGrad" x1="8" y1="10" x2="38" y2="36" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="1" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="goldHood" x1="10" y1="10" x2="30" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE68A" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Carriage Hood Body */}
          <path d="M12 16C12 11 16 8 22 8H26C32 8 36 12 36 18V26C36 29 33 32 29 32H19C15 32 12 29 12 26V16Z" fill="url(#pramGrad)" stroke="#047857" strokeWidth="1.5" />
          {/* Canopy / Hood */}
          <path d="M12 18C12 11 17 8 24 8V24H12V18Z" fill="url(#goldHood)" opacity="0.9" stroke="#D97706" strokeWidth="1.2" />
          {/* Handle */}
          <path d="M12 18L6 14" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
          {/* Wheels */}
          <circle cx="18" cy="37" r="4.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          <circle cx="30" cy="37" r="4.5" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
          {/* Heart Badge on Pram */}
          <path d="M29 18C27.5 16.5 25 17 25 19C25 21 29 23.5 29 23.5C29 23.5 33 21 33 19C33 17 30.5 16.5 29 18Z" fill="#F43F5E" />
          {/* Ambiance Stars */}
          <path d="M38 8L39 6L40 8L42 9L40 10L39 12L38 10L36 9L38 8Z" fill="#10B981" />
        </svg>
      );

    case 'friends-party':
      // Cinema Clapperboard + Golden Toast Glasses & Stadium Waves
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="clapGrad" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#3B82F6" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
            <linearGradient id="goldBeer" x1="16" y1="20" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FCD34D" />
              <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Cinema Clapperboard */}
          <rect x="7" y="16" width="34" height="24" rx="3" fill="url(#clapGrad)" stroke="#1E40AF" strokeWidth="1.5" />
          {/* Clapper Top Stick */}
          <rect x="7" y="10" width="34" height="6" rx="1.5" fill="#1E3A8A" stroke="#1E40AF" strokeWidth="1" />
          {/* Diagonal Stripes */}
          <path d="M12 10L16 16M20 10L24 16M28 10L32 16M36 10L40 16" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          {/* Toast Glasses in Center */}
          <path d="M17 24H23V31C23 32.5 21.5 34 20 34C18.5 34 17 32.5 17 31V24Z" fill="url(#goldBeer)" stroke="#B45309" strokeWidth="1" />
          <path d="M25 24H31V31C31 32.5 29.5 34 28 34C26.5 34 25 32.5 25 31V24Z" fill="url(#goldBeer)" stroke="#B45309" strokeWidth="1" />
          {/* Sound waves / cheer sparks */}
          <path d="M24 18L25 21" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="22" r="1.5" fill="#FBBF24" />
          <path d="M4 22L6 23L4 24" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M44 22L42 23L44 24" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'farewell':
      // Golden Departure Jet Airliner soaring into clouds & milestone star
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="jetGrad" x1="12" y1="8" x2="40" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FB923C" />
              <stop offset="0.5" stopColor="#F97316" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
            <linearGradient id="cloudGrad" x1="6" y1="30" x2="42" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FED7AA" />
              <stop offset="1" stopColor="#FFEDD5" />
            </linearGradient>
          </defs>
          {/* Cloud Base */}
          <path d="M8 38C8 34 11 31 15 31C16 28 19 26 23 26C27 26 30 28 31 31C34 31 37 34 37 38H8Z" fill="url(#cloudGrad)" opacity="0.8" />
          {/* Jet Plane Soaring Upwards */}
          <path d="M37 11L28 17L18 12L15 14L22 21L15 26L11 25L9 27L14 30L17 35L19 33L18 29L25 22L32 29L34 26L29 16L37 11Z" fill="url(#jetGrad)" stroke="#7C2D12" strokeWidth="1.2" strokeLinejoin="round" />
          {/* Jet Cockpit Glass */}
          <ellipse cx="34" cy="13" rx="1.5" ry="1" fill="#FFFFFF" />
          {/* Milestone Golden Star */}
          <path d="M40 6L41.2 9L44 9.5L42 11.5L42.5 14L40 12.8L37.5 14L38 11.5L36 9.5L38.8 9L40 6Z" fill="#F59E0B" stroke="#B45309" strokeWidth="0.8" />
          {/* Contrail Speed Lines */}
          <path d="M7 36C12 36 15 32 20 28" stroke="#FDBA74" strokeWidth="1.5" strokeDasharray="3 3" />
        </svg>
      );

    default:
      return null;
  }
}

// ==========================================
// 2. GRAND ADD-ON ICONS (Cakes, Special FX, Décor, Photography)
// ==========================================

export function GrandAddonIcon({ name, className = "w-8 h-8" }: { name: string; className?: string }) {
  switch (name) {
    case 'pineapple':
      // Detailed Tropical Pineapple with Golden scales & Green Crown
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="pineFruit" x1="12" y1="16" x2="36" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FBBF24" />
              <stop offset="0.6" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="pineCrown" x1="16" y1="4" x2="32" y2="20" gradientUnits="userSpaceOnUse">
              <stop stopColor="#34D399" />
              <stop offset="0.5" stopColor="#10B981" />
              <stop offset="1" stopColor="#047857" />
            </linearGradient>
          </defs>
          {/* Pineapple Leaves / Crown */}
          <path d="M24 4C24 4 20 10 21 17C21 17 24 12 28 8C28 8 26 13 25 18C27 15 32 12 34 14C34 14 29 18 27 19C25 19 24 19 23 19C22 19 19 19 17 19C15 18 10 14 10 14C12 12 17 15 19 18C18 13 16 8 16 8C20 12 23 17 23 17C24 10 24 4 24 4Z" fill="url(#pineCrown)" />
          {/* Pineapple Oval Body */}
          <ellipse cx="24" cy="30" rx="12" ry="14" fill="url(#pineFruit)" stroke="#B45309" strokeWidth="1.5" />
          {/* Diamond Texture Lines */}
          <path d="M16 20L31 38M13 26L28 42M20 18L35 34M32 20L17 38M35 26L20 42M28 18L13 34" stroke="#92400E" strokeWidth="1.2" opacity="0.65" />
          {/* Cherry on side */}
          <circle cx="33" cy="24" r="3" fill="#DC2626" stroke="#991B1B" strokeWidth="0.8" />
          <path d="M33 21C34 18 36 17 38 18" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'chocolate':
      // Belgian Chocolate Truffle Cake with ganache drip & gold plaque
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chocoGrad" x1="10" y1="18" x2="38" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#78350F" />
              <stop offset="0.6" stopColor="#451A03" />
              <stop offset="1" stopColor="#290E02" />
            </linearGradient>
            <linearGradient id="ganacheDrip" x1="8" y1="18" x2="40" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#451A03" />
              <stop offset="1" stopColor="#1F0801" />
            </linearGradient>
          </defs>
          {/* Cake Base */}
          <rect x="8" y="24" width="32" height="18" rx="3" fill="url(#chocoGrad)" stroke="#1F0801" strokeWidth="1.5" />
          {/* Top Sponge Tier */}
          <ellipse cx="24" cy="24" rx="16" ry="6" fill="#5A2408" />
          {/* Glossy Ganache Drips */}
          <path d="M8 24C9 28 11 31 12 28C13 25 15 33 17 29C19 25 21 34 23 28C25 24 27 32 29 27C31 24 33 30 35 26C37 24 39 27 40 24V22H8V24Z" fill="url(#ganacheDrip)" />
          {/* Gold Chocolate Shavings */}
          <ellipse cx="24" cy="17" rx="8" ry="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          <text x="24" y="19" fontSize="5" fontWeight="bold" fill="#451A03" textAnchor="middle" fontFamily="sans-serif">MB</text>
          {/* Chocolate Truffle Balls on top */}
          <circle cx="16" cy="21" r="2.5" fill="#290E02" stroke="#78350F" strokeWidth="0.8" />
          <circle cx="32" cy="21" r="2.5" fill="#290E02" stroke="#78350F" strokeWidth="0.8" />
        </svg>
      );

    case 'black-forest':
      // Black Forest Cake with Cream Rosettes & Ruby Cherries
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="32" height="18" rx="3" fill="#3B1808" stroke="#1F0801" strokeWidth="1.5" />
          {/* White Cream Layer */}
          <rect x="8" y="31" width="32" height="4" fill="#FFFFFF" opacity="0.9" />
          {/* Top Rosettes */}
          <circle cx="14" cy="22" r="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="24" cy="20" r="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="34" cy="22" r="3.5" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Glossy Red Cherries */}
          <circle cx="14" cy="18" r="2.5" fill="#DC2626" />
          <circle cx="24" cy="16" r="2.5" fill="#DC2626" />
          <circle cx="34" cy="18" r="2.5" fill="#DC2626" />
          <path d="M24 14C25 10 27 9 29 10" stroke="#16A34A" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );

    case 'butterscotch':
      // Butterscotch Cake with Caramel Praline Crunch
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="24" width="32" height="18" rx="3" fill="#F59E0B" stroke="#B45309" strokeWidth="1.5" />
          {/* Caramel Glaze Top */}
          <ellipse cx="24" cy="24" rx="16" ry="6" fill="#D97706" />
          {/* Praline Crunch Dots */}
          <circle cx="16" cy="24" r="1.5" fill="#78350F" />
          <circle cx="20" cy="22" r="1.8" fill="#78350F" />
          <circle cx="24" cy="25" r="1.5" fill="#78350F" />
          <circle cx="28" cy="23" r="2" fill="#78350F" />
          <circle cx="32" cy="25" r="1.5" fill="#78350F" />
          {/* Butterscotch Swirl */}
          <path d="M12 28C16 32 20 28 24 32C28 36 32 30 36 32" stroke="#FEF3C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'red-velvet':
      // Heart-shaped Ruby Red Velvet Cake with Cream Swirls
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <path d="M24 14C20 8 10 11 10 20C10 28 24 39 24 39C24 39 38 28 38 20C38 11 28 8 24 14Z" fill="#BE123C" stroke="#881337" strokeWidth="1.5" />
          {/* Cream Cheese Swirl Layer */}
          <path d="M14 20C16 22 18 19 20 21C22 23 24 20 26 22C28 24 30 21 32 23" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="25" r="2" fill="#FFFFFF" />
        </svg>
      );

    case 'fog':
      // Atmospheric Ground Fog Billowing Cloud
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="fogGrad" x1="6" y1="16" x2="42" y2="38" gradientUnits="userSpaceOnUse">
              <stop stopColor="#BAE6FD" />
              <stop offset="0.5" stopColor="#E0F2FE" />
              <stop offset="1" stopColor="#38BDF8" />
            </linearGradient>
          </defs>
          <path d="M12 28C10 28 8 26 8 24C8 22 10 20 12 20C13 15 17 12 22 12C28 12 32 16 33 21C35 21 38 23 38 26C38 29 35 31 32 31H12" fill="url(#fogGrad)" opacity="0.9" stroke="#0284C7" strokeWidth="1.2" />
          {/* Ground Mist Streams */}
          <path d="M6 36H38M12 41H44M4 45H32" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'pyro':
      // Cold Fire Pyro Golden Sparkler Fountain
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Pyro Fountain Pot */}
          <rect x="18" y="32" width="12" height="12" rx="2" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
          <rect x="20" y="30" width="8" height="3" rx="1" fill="#F59E0B" />
          {/* Golden Sparkler Fountain Bursts */}
          <path d="M24 30L24 6M24 30L14 12M24 30L34 12M24 30L8 18M24 30L40 18" stroke="#F59E0B" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />
          {/* Spark Starbursts */}
          <circle cx="24" cy="5" r="2.5" fill="#EF4444" />
          <circle cx="14" cy="11" r="2" fill="#FBBF24" />
          <circle cx="34" cy="11" r="2" fill="#FBBF24" />
          <circle cx="8" cy="17" r="1.5" fill="#F59E0B" />
          <circle cx="40" cy="17" r="1.5" fill="#F59E0B" />
        </svg>
      );

    case 'bubbles':
      // Iridescent Floating Soap Bubbles
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Large Center Bubble */}
          <circle cx="22" cy="24" r="11" fill="#E0F2FE" fillOpacity="0.5" stroke="#38BDF8" strokeWidth="1.5" />
          <ellipse cx="18" cy="19" rx="2" ry="4" transform="rotate(-30 18 19)" fill="#FFFFFF" opacity="0.8" />
          {/* Floating Bubble 2 */}
          <circle cx="34" cy="15" r="6" fill="#F3E8FF" fillOpacity="0.5" stroke="#C084FC" strokeWidth="1.2" />
          <ellipse cx="32" cy="13" rx="1" ry="2" transform="rotate(-30 32 13)" fill="#FFFFFF" opacity="0.8" />
          {/* Floating Bubble 3 */}
          <circle cx="12" cy="36" r="5" fill="#DCFCE7" fillOpacity="0.5" stroke="#4ADE80" strokeWidth="1" />
          {/* Floating Bubble 4 */}
          <circle cx="36" cy="34" r="4" fill="#FEF3C7" fillOpacity="0.5" stroke="#FBBF24" strokeWidth="1" />
        </svg>
      );

    case 'roses':
      // Luxury Dutch Red Rose Bouquet with Ribbon
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Bouquet Wrapper */}
          <polygon points="16,24 32,24 27,44 21,44" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          {/* Satin Ribbon */}
          <ellipse cx="24" cy="34" rx="4" ry="2" fill="#DC2626" />
          {/* Velvet Red Roses Bloom Cluster */}
          <circle cx="24" cy="16" r="6" fill="#DC2626" stroke="#991B1B" strokeWidth="1" />
          <circle cx="17" cy="21" r="5" fill="#EF4444" stroke="#B91C1C" strokeWidth="1" />
          <circle cx="31" cy="21" r="5" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1" />
          <circle cx="24" cy="15" r="3" fill="#F87171" />
          {/* Green Leaves */}
          <path d="M12 18C10 14 13 12 15 14" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M36 18C38 14 35 12 33 14" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );

    case 'candles':
      // Glowing Lantern & Rose Petal Pathway
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Glass Lantern Frame */}
          <rect x="17" y="16" width="14" height="22" rx="2" fill="#FEF3C7" fillOpacity="0.4" stroke="#78350F" strokeWidth="1.5" />
          <polygon points="24,8 14,16 34,16" fill="#92400E" stroke="#78350F" strokeWidth="1" />
          <rect x="22" y="5" width="4" height="4" rx="2" fill="#F59E0B" />
          {/* Pillar Candle inside */}
          <rect x="21" y="24" width="6" height="12" rx="1" fill="#FEF3C7" stroke="#D97706" strokeWidth="1" />
          {/* Glowing Flame */}
          <path d="M24 17C24 17 22 20 24 22C26 20 24 17 24 17Z" fill="#EF4444" />
          <circle cx="24" cy="20" r="1.5" fill="#FDE047" />
          {/* Rose Petals around */}
          <ellipse cx="11" cy="39" rx="3" ry="1.8" transform="rotate(-20 11 39)" fill="#DC2626" />
          <ellipse cx="37" cy="40" rx="3" ry="1.8" transform="rotate(25 37 40)" fill="#DC2626" />
        </svg>
      );

    case 'led-letters':
      // Glowing 3D Marquee LED Letters (A)
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="ledGrad" x1="12" y1="8" x2="36" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FDE047" />
              <stop offset="0.5" stopColor="#F59E0B" />
              <stop offset="1" stopColor="#D97706" />
            </linearGradient>
          </defs>
          {/* Marquee Letter A Frame */}
          <path d="M24 6L10 40H18L21 32H27L30 40H38L24 6ZM24 16L26 26H22L24 16Z" fill="url(#ledGrad)" stroke="#B45309" strokeWidth="1.5" strokeLinejoin="round" />
          {/* Glowing Bulbs */}
          <circle cx="24" cy="11" r="1.5" fill="#FFFFFF" />
          <circle cx="16" cy="30" r="1.5" fill="#FFFFFF" />
          <circle cx="32" cy="30" r="1.5" fill="#FFFFFF" />
          <circle cx="24" cy="28" r="1.5" fill="#FFFFFF" />
        </svg>
      );

    case 'dslr':
      // Professional DSLR Camera with Glass Lens & Flash
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="dslrBody" x1="8" y1="12" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#334155" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect x="8" y="14" width="32" height="24" rx="4" fill="url(#dslrBody)" stroke="#475569" strokeWidth="1.5" />
          <path d="M16 14L19 9H29L32 14" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
          {/* Flash */}
          <rect x="12" y="17" width="5" height="3" rx="1" fill="#F59E0B" />
          {/* Big Lens */}
          <circle cx="24" cy="26" r="9" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
          <circle cx="24" cy="26" r="6" fill="#0284C7" stroke="#38BDF8" strokeWidth="1" />
          <ellipse cx="22" cy="24" rx="2" ry="1.5" fill="#FFFFFF" opacity="0.8" />
        </svg>
      );

    case 'reel':
      // iPhone Cinematic 4K Reel Smartphone
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="6" width="20" height="36" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
          {/* Screen */}
          <rect x="16" y="10" width="16" height="28" rx="2" fill="#1E293B" />
          {/* Dynamic Island / Notch */}
          <rect x="21" y="8" width="6" height="1.5" rx="0.75" fill="#334155" />
          {/* 4K Video Recording UI */}
          <circle cx="24" cy="22" r="4" fill="#EF4444" />
          <path d="M22.5 20.5L26.5 22L22.5 23.5V20.5Z" fill="#FFFFFF" />
          <rect x="18" y="32" width="12" height="2" rx="1" fill="#64748B" />
          <text x="24" y="16" fontSize="4" fontWeight="bold" fill="#F87171" textAnchor="middle" fontFamily="sans-serif">4K REC</text>
        </svg>
      );

    case 'teddy':
      // Giant Friendly Teddy Mascot Surprise
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="teddyFur" x1="12" y1="8" x2="36" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D97706" />
              <stop offset="0.6" stopColor="#B45309" />
              <stop offset="1" stopColor="#78350F" />
            </linearGradient>
          </defs>
          {/* Ears */}
          <circle cx="15" cy="14" r="5" fill="url(#teddyFur)" stroke="#78350F" strokeWidth="1" />
          <circle cx="15" cy="14" r="2.5" fill="#FDE68A" />
          <circle cx="33" cy="14" r="5" fill="url(#teddyFur)" stroke="#78350F" strokeWidth="1" />
          <circle cx="33" cy="14" r="2.5" fill="#FDE68A" />
          {/* Head */}
          <circle cx="24" cy="21" r="11" fill="url(#teddyFur)" stroke="#78350F" strokeWidth="1.2" />
          {/* Snout */}
          <ellipse cx="24" cy="24" rx="5" ry="4" fill="#FEF3C7" />
          <ellipse cx="24" cy="22.5" rx="2" ry="1.5" fill="#290E02" />
          {/* Eyes */}
          <circle cx="20" cy="18" r="1.5" fill="#290E02" />
          <circle cx="28" cy="18" r="1.5" fill="#290E02" />
          {/* Bow Tie */}
          <polygon points="24,32 18,29 18,35" fill="#EF4444" />
          <polygon points="24,32 30,29 30,35" fill="#EF4444" />
          <circle cx="24" cy="32" r="1.5" fill="#B91C1C" />
          {/* Body */}
          <path d="M15 36C15 33 19 32 24 32C29 32 33 33 33 36V43H15V36Z" fill="url(#teddyFur)" stroke="#78350F" strokeWidth="1" />
        </svg>
      );

    case 'neon':
      // Glowing Neon Name Sign & Script Lettering
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Neon Sign Acrylic Backboard */}
          <rect x="6" y="10" width="36" height="28" rx="6" fill="#141110" stroke="#332219" strokeWidth="1.5" />
          {/* Glowing Neon Tubes "LOVE" / "BASH" */}
          <path d="M12 20V28H18" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlow)" />
          <circle cx="24" cy="24" r="4.5" stroke="#F59E0B" strokeWidth="2.5" filter="url(#neonGlow)" />
          <path d="M30 20L33 28L36 20" stroke="#EC4899" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#neonGlow)" />
          {/* Glow Sparkles */}
          <circle cx="10" cy="14" r="1.5" fill="#FEF08A" />
          <circle cx="38" cy="34" r="1.5" fill="#FEF08A" />
        </svg>
      );

    case 'heart-arch':
      // Floral Grand Heart Arch with Twinkle Fairy Lights
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="archGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F43F5E" />
              <stop offset="0.6" stopColor="#E11D48" />
              <stop offset="1" stopColor="#9F1239" />
            </linearGradient>
          </defs>
          {/* Arch Stand Pedestals */}
          <rect x="10" y="38" width="6" height="4" rx="1" fill="#D97706" />
          <rect x="32" y="38" width="6" height="4" rx="1" fill="#D97706" />
          {/* Giant Heart Arch Frame */}
          <path d="M13 38V24C13 16 18 10 24 14C30 10 35 16 35 24V38" stroke="url(#archGrad)" strokeWidth="4.5" strokeLinecap="round" />
          {/* Inner Light Outline */}
          <path d="M15 38V25C15 18 19 13 24 16C29 13 33 18 33 25V38" stroke="#FFE4E6" strokeWidth="1.2" opacity="0.8" />
          {/* Twinkle LED Fairy Bulbs */}
          <circle cx="14" cy="28" r="1.5" fill="#FEF08A" />
          <circle cx="16" cy="20" r="1.5" fill="#FEF08A" />
          <circle cx="21" cy="14" r="1.5" fill="#FEF08A" />
          <circle cx="24" cy="18" r="1.5" fill="#FEF08A" />
          <circle cx="27" cy="14" r="1.5" fill="#FEF08A" />
          <circle cx="32" cy="20" r="1.5" fill="#FEF08A" />
          <circle cx="34" cy="28" r="1.5" fill="#FEF08A" />
        </svg>
      );

    case 'montage':
      // Cinematic 150" Memory Projection Screen with Film Clapper
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="8" width="36" height="24" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="1.5" />
          {/* Movie Projection Beam */}
          <polygon points="12,12 36,12 30,26 18,26" fill="#FDE047" opacity="0.15" />
          {/* Play Icon in Screen */}
          <circle cx="24" cy="20" r="6" fill="#EF4444" />
          <polygon points="22,17 28,20 22,23" fill="#FFFFFF" />
          {/* Film Strip Holes */}
          <rect x="8" y="10" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="8" y="15" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="8" y="20" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="38" y="10" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="38" y="15" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          <rect x="38" y="20" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
          {/* Screen Stand */}
          <line x1="24" y1="32" x2="24" y2="40" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
          <line x1="16" y1="40" x2="32" y2="40" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'photography':
      // Pro DSLR Camera (same as dslr)
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="14" width="32" height="24" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <path d="M16 14L18 10H30L32 14" fill="#334155" stroke="#475569" strokeWidth="1.5" />
          <circle cx="24" cy="26" r="8" fill="#0F172A" stroke="#E2E8F0" strokeWidth="2" />
          <circle cx="24" cy="26" r="5" fill="#2563EB" opacity="0.8" />
          <circle cx="22" cy="24" r="1.5" fill="#FFFFFF" />
          <circle cx="34" cy="18" r="1.5" fill="#EF4444" />
          <path d="M6 10L9 6L11 9L8 11L6 10Z" fill="#F59E0B" />
        </svg>
      );

    case 'popcorn':
      // Classic Striped Cinema Popcorn Bucket
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Popcorn Bucket */}
          <polygon points="12,20 15,42 33,42 36,20" fill="#DC2626" stroke="#991B1B" strokeWidth="1.5" />
          {/* White Stripes */}
          <polygon points="17,20 19,42 22,42 21,20" fill="#FFFFFF" />
          <polygon points="27,20 26,42 29,42 31,20" fill="#FFFFFF" />
          {/* Puffy Popped Golden Corn Pieces */}
          <circle cx="16" cy="18" r="4.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <circle cx="22" cy="15" r="5" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
          <circle cx="28" cy="14" r="5.5" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
          <circle cx="33" cy="17" r="4.5" fill="#FEF08A" stroke="#D97706" strokeWidth="1" />
          <circle cx="20" cy="11" r="4" fill="#FDE047" />
          <circle cx="26" cy="9" r="4" fill="#FEF08A" />
        </svg>
      );

    case 'nachos':
      // Crispy Mexican Cheese Nachos with Jalapeno & Dip
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          {/* Serving Platter / Bowl */}
          <ellipse cx="24" cy="38" rx="18" ry="5" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.2" />
          {/* Crispy Tortilla Chips Triangles */}
          <polygon points="14,35 22,18 28,34" fill="#F59E0B" stroke="#D97706" strokeWidth="1.2" />
          <polygon points="22,35 30,15 36,32" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
          <polygon points="10,34 16,22 23,32" fill="#FCD34D" stroke="#D97706" strokeWidth="1" />
          {/* Melted Cheddar Drip */}
          <path d="M18 28C21 31 24 29 27 32C29 33 32 30 33 34" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" />
          {/* Fresh Jalapeno Slice */}
          <circle cx="26" cy="27" r="3" fill="#16A34A" stroke="#15803D" strokeWidth="0.8" />
          <circle cx="26" cy="27" r="1.5" fill="#86EFAC" />
        </svg>
      );

    case 'drinks':
      // Chilled Sparkling Tropical Mocktail Cooler
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="juiceGrad" x1="14" y1="18" x2="34" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F97316" />
              <stop offset="0.6" stopColor="#EF4444" />
              <stop offset="1" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          {/* Glass Base & Stem */}
          <path d="M14 16H34L30 38C30 40 28 42 24 42C20 42 18 40 18 38L14 16Z" fill="url(#juiceGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Bubbles */}
          <circle cx="22" cy="28" r="1.5" fill="#FFFFFF" opacity="0.8" />
          <circle cx="26" cy="33" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="20" cy="35" r="1.2" fill="#FFFFFF" opacity="0.8" />
          <circle cx="25" cy="22" r="1.8" fill="#FFFFFF" opacity="0.9" />
          {/* Ice Cubes */}
          <rect x="18" y="20" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.6" />
          <rect x="24" y="24" width="5" height="5" rx="1" fill="#FFFFFF" opacity="0.6" />
          {/* Lemon Wheel on Rim */}
          <circle cx="33" cy="14" r="5" fill="#FACC15" stroke="#EAB308" strokeWidth="1" />
          <circle cx="33" cy="14" r="3" fill="#FEF08A" />
          {/* Straw */}
          <path d="M26 24L32 6H36" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    default:
      // Fallback Sparkles Celebration Star (Never empty)
      return (
        <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="18" fill="#F8F0E5" stroke="#082052" strokeWidth="1.5" />
          <path d="M24 12L26.5 20L34 24L26.5 28L24 36L21.5 28L14 24L21.5 20L24 12Z" fill="#082052" />
        </svg>
      );
  }
}
