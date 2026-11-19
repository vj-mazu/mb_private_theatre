'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MovieBashLogo from './MovieBashLogo';
import { 
  Film, 
  ChevronDown, 
  Menu, 
  X, 
  MapPin, 
  Phone,
  CalendarDays,
  Sparkles,
  Instagram
} from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [venuesOpen, setVenuesOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Slots', href: '/#slots' },
    { name: 'Packages', href: '/#packages' },
    { name: 'About Us', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'FAQ', href: '/#faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-xl shadow-md py-2 sm:py-2.5 border-b border-[#00A2E4]/15' 
        : 'bg-[#F6FAFD]/95 backdrop-blur-md py-2 sm:py-3 border-b border-[#00A2E4]/10'
    }`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo - Authentic Vector Emblem (Zoomed, High-Contrast & Crisp) */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="h-10 sm:h-12 md:h-14 w-[96px] sm:w-[124px] md:w-[145px] flex items-center group-hover:scale-105 transition-transform drop-shadow-[0_2px_6px_rgba(20,17,16,0.10)]" style={{ aspectRatio: '370 / 160' }}>
            <MovieBashLogo className="h-full w-full block" />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link
            href="/"
            className={`text-sm font-semibold transition-colors hover:text-[#00A2E4] ${
              pathname === '/' ? 'text-[#0B2238] font-black' : 'text-stone-700'
            }`}
          >
            Home
          </Link>

          {/* Venues Dropdown */}
          <div className="relative group" onMouseLeave={() => setVenuesOpen(false)}>
            <button
              onClick={() => setVenuesOpen(!venuesOpen)}
              onMouseEnter={() => setVenuesOpen(true)}
              suppressHydrationWarning
              className="flex items-center gap-1.5 text-sm font-semibold text-stone-700 hover:text-[#00A2E4] transition-colors py-2 cursor-pointer"
            >
              <span>Our Venues</span>
              <ChevronDown className="w-4 h-4 text-[#00A2E4] transition-transform group-hover:rotate-180" />
            </button>

            {venuesOpen && (
              <div 
                className="absolute top-full left-0 w-72 bg-[#F6FAFD] rounded-2xl shadow-xl border border-[#00A2E4]/15 p-3 flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseEnter={() => setVenuesOpen(true)}
                onMouseLeave={() => setVenuesOpen(false)}
              >
                <Link
                  href="/venues/electronic-city"
                  onClick={() => setVenuesOpen(false)}
                  className="p-3 rounded-xl hover:bg-[#E6F3FB] transition-colors flex items-start gap-3 group/item"
                >
                  <div className="p-2 rounded-lg bg-[#E6F3FB] text-[#00A2E4] group-hover/item:bg-[#0B2238] group-hover/item:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#0B2238]">Electronic City</h4>
                    <p className="text-xs text-stone-500 mt-0.5">3 Theatres • Couple, Party &amp; Family</p>
                  </div>
                </Link>

                <Link
                  href="/venues/btm-stage-2"
                  onClick={() => setVenuesOpen(false)}
                  className="p-3 rounded-xl hover:bg-[#E6F3FB] transition-colors flex items-start gap-3 group/item"
                >
                  <div className="p-2 rounded-lg bg-[#E6F3FB] text-[#00A2E4] group-hover/item:bg-[#0B2238] group-hover/item:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-[#0B2238]">BTM 2nd Stage</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#00A2E4] text-white">4 SCREENS</span>
                    </div>
                    <p className="text-xs text-stone-500 mt-0.5">4 Theatres • Near Udupi Garden</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold transition-colors hover:text-[#00A2E4] ${
                pathname === item.href ? 'text-[#0B2238] font-bold' : 'text-stone-700'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <a
            href="https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20want%20to%20inquire%20about%20booking%20a%20private%20theatre"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold text-[#0B2238] bg-[#E6F3FB] hover:bg-[#F8F0E5] border border-[#00A2E4]/25 transition-all hover:scale-105"
            title="Chat on WhatsApp"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <Link
            href="/book-now"
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-[#082052] hover:bg-[#041224] hover:from-[#082052] hover:to-[#00A2E4] shadow-md shadow-[#00A2E4]/20 transition-all hover:scale-105"
          >
            <CalendarDays className="w-4 h-4 text-white" />
            <span>Book Now</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          suppressHydrationWarning
          className="lg:hidden p-2.5 rounded-xl text-[#0B2238] bg-[#E6F3FB] border border-[#00A2E4]/20 hover:bg-[#F8F0E5] active:scale-95 transition-all cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6 text-[#00A2E4]" /> : <Menu className="w-6 h-6 text-[#0B2238]" />}
        </button>
      </div>

      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-[60px] sm:top-[70px] bg-black/40 backdrop-blur-xs z-40 animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full inset-x-0 bg-[#F6FAFD] border-b-2 border-[#00A2E4]/25 shadow-2xl p-5 flex flex-col gap-4 max-h-[85vh] overflow-y-auto z-50 animate-in slide-in-from-top-2 duration-200">
          
          {/* Venues Selector Pill */}
          <div className="bg-[#F6FAFD] p-3 rounded-2xl border border-[#00A2E4]/20 space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#00A2E4] block px-1">
              Select Your Venue:
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              <Link
                href="/venues/electronic-city"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#00A2E4]/15 text-sm font-bold text-[#0B2238] hover:bg-[#00A2E4] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A2E4]" /> Electronic City Branch
                </span>
                <span className="text-xs opacity-60">&rarr;</span>
              </Link>
              <Link
                href="/venues/btm-stage-2"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#00A2E4]/15 text-sm font-bold text-[#0B2238] hover:bg-[#00A2E4] hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#00A2E4]" /> BTM 2nd Stage Branch
                </span>
                <span className="text-xs opacity-60">&rarr;</span>
              </Link>
            </div>
          </div>

          {/* Navigation Links with Bold Ink Typography */}
          <div className="flex flex-col gap-1 py-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2.5 rounded-xl text-base font-bold transition-all flex items-center justify-between ${
                  pathname === item.href 
                    ? 'text-[#00A2E4] bg-[#E6F3FB] font-black' 
                    : 'text-[#0B2238] hover:bg-[#E6F3FB] hover:text-[#00A2E4]'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-xs text-stone-400 font-bold">&rsaquo;</span>
              </Link>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="pt-3 border-t border-[#00A2E4]/15 flex flex-col gap-2.5">
            <Link
              href="/book-now"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3.5 rounded-full text-sm font-black text-white bg-[#082052] hover:bg-[#041224] shadow-lg shadow-[#00A2E4]/25 active:scale-98 transition-transform"
            >
              Book Your Private Screen Now
            </Link>
            <a
              href="https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20want%20to%20inquire%20about%20booking%20a%20private%20theatre"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full text-xs sm:text-sm font-bold text-[#0B2238] bg-[#E6F3FB] border border-[#00A2E4]/25 flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Us (+91 99029 23656)</span>
            </a>
            <a
              href="https://www.instagram.com/moviebash_privatetheatre?bqrl=dHBiYjgwcXduNmo2"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] flex items-center justify-center gap-2 active:scale-98 transition-transform shadow-xs"
            >
              <Instagram className="w-4 h-4" />
              <span>Instagram (@moviebash_privatetheatre)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
