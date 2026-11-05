'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Film, 
  ChevronDown, 
  Menu, 
  X, 
  MapPin, 
  User, 
  Phone,
  PhoneCall, 
  CalendarDays,
  Sparkles,
  ShieldCheck
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
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About Us', href: '/about' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Blog', href: '/blog' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'glass-nav shadow-soft py-3' 
        : 'bg-sand-50/90 backdrop-blur-md py-4 sm:py-5 border-b border-sand-200/60'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link href="/" prefetch={true} className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-royal-900 text-amber-400 flex items-center justify-center shadow-royal-glow group-hover:scale-105 transition-transform">
            <Film className="w-5 h-5" />
          </div>
          <div>
            <span className="font-playfair text-xl sm:text-2xl font-black tracking-tight text-royal-900 block leading-none">
              MOVIE<span className="text-royal-500">BASH</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-800 font-bold block mt-0.5">
              Private Cinema
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link
            href="/"
            prefetch={true}
            className={`text-sm font-semibold transition-colors hover:text-royal-600 ${
              pathname === '/' ? 'text-royal-700 font-bold' : 'text-slate-800'
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
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 hover:text-royal-600 transition-colors py-2"
            >
              <span>Our Venues</span>
              <ChevronDown className="w-4 h-4 text-royal-700 transition-transform group-hover:rotate-180" />
            </button>

            {venuesOpen && (
              <div 
                className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-elevated border border-slate-200 p-3 flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseEnter={() => setVenuesOpen(true)}
                onMouseLeave={() => setVenuesOpen(false)}
              >
                <Link
                  href="/venues/electronic-city"
                  prefetch={true}
                  onClick={() => setVenuesOpen(false)}
                  className="p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 group/item"
                >
                  <div className="p-2 rounded-lg bg-royal-100 text-royal-700 group-hover/item:bg-royal-700 group-hover/item:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-royal-900">Electronic City</h4>
                    <p className="text-xs text-slate-600 mt-0.5">3 Theatres • Couple, Party &amp; Family</p>
                  </div>
                </Link>

                <Link
                  href="/venues/btm-stage-2"
                  prefetch={true}
                  onClick={() => setVenuesOpen(false)}
                  className="p-3 rounded-xl hover:bg-slate-50 transition-colors flex items-start gap-3 group/item"
                >
                  <div className="p-2 rounded-lg bg-royal-100 text-royal-700 group-hover/item:bg-royal-700 group-hover/item:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-royal-900">BTM 2nd Stage</h4>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-slate-900">NEW</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">3 Theatres • Near Udupi Garden</p>
                  </div>
                </Link>
              </div>
            )}
          </div>

          {navLinks.slice(1).map((item) => (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              className={`text-sm font-semibold transition-colors hover:text-royal-600 ${
                pathname === item.href ? 'text-royal-700 font-bold' : 'text-slate-800'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <a
            href="https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20want%20to%20inquire%20about%20booking%20a%20private%20theatre"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-all hover:scale-105"
            title="Chat on WhatsApp"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <Link
            href="/book-now"
            prefetch={true}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all hover:scale-105"
          >
            <CalendarDays className="w-4 h-4 text-amber-300" />
            <span>Book Now</span>
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          suppressHydrationWarning
          className="lg:hidden p-2 rounded-xl text-royal-900 hover:bg-sand-200/50 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] bg-sand-50 border-b border-sand-200 shadow-elevated p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-top-4">
          <div className="flex flex-col gap-1 pb-3 border-b border-sand-200">
            <span className="text-xs font-bold uppercase tracking-wider text-royal-700 mb-2">Our Locations</span>
            <Link
              href="/venues/electronic-city"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-royal-900"
            >
              <MapPin className="w-4 h-4 text-royal-500" /> Electronic City Branch
            </Link>
            <Link
              href="/venues/btm-stage-2"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm font-bold text-royal-900"
            >
              <MapPin className="w-4 h-4 text-royal-500" /> BTM 2nd Stage Branch (New)
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch={true}
                onClick={() => setMobileMenuOpen(false)}
                className={`py-2 text-base font-semibold ${
                  pathname === item.href ? 'text-royal-700 font-bold' : 'text-slate-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-sand-200 flex flex-col gap-2.5">
            <Link
              href="/book-now"
              prefetch={true}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 rounded-full text-sm font-bold text-white bg-royal-700 shadow-royal-glow"
            >
              Book Your Private Screen
            </Link>
            <a
              href="https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20want%20to%20inquire%20about%20booking%20a%20private%20theatre"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-full text-sm font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Direct WhatsApp (+91 99029 23656)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
