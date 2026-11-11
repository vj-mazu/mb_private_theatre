'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Film, 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle2,
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  CalendarDays,
  MessageCircle
} from 'lucide-react';

interface FooterProps {
  showCtaStrip?: boolean;
}

export default function Footer({ showCtaStrip = false }: FooterProps) {
  const [subscriberInput, setSubscriberInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberInput.trim()) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: subscriberInput.trim() }),
      });
    } catch {
      // ignore
    }
    setSubscribed(true);
    setSubscriberInput('');
  };

  return (
    <footer className="w-full bg-[#0A1F5C] text-slate-100 border-t border-sky-950/60 relative z-10 overflow-hidden">
      
      {/* Optional Top CTA Strip (only rendered on subpages that do not already have .final-cta) */}
      {showCtaStrip && (
        <div className="w-full border-b border-white/10 py-10 sm:py-12 bg-gradient-to-b from-[#0e2976]/40 to-transparent">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/book-now"
                className="px-7 py-3.5 rounded-full bg-[#f39a4b] hover:bg-[#ffb066] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:scale-105 transition-all"
              >
                <CalendarDays className="w-4 h-4 text-slate-950" />
                <span>Book Private Screen</span>
              </Link>

              <a
                href="tel:+919902923656"
                className="px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition-all hover:scale-105"
              >
                <Phone className="w-4 h-4 text-[#9ccaff]" />
                <span>Call +91 99029 23656</span>
              </a>
            </div>

            <p className="text-xs text-slate-300 font-medium tracking-wide">
              Electronic City &bull; BTM 2nd Stage &bull; 100% Privacy Guaranteed
            </p>
          </div>
        </div>
      )}

      {/* Main 4-Column Footer: Evenly Distributed Across Full Width */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Socials */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-royal-700 text-amber-300 flex items-center justify-center shadow-md">
                <Film className="w-5 h-5" />
              </div>
              <span className="font-playfair text-2xl font-black text-white tracking-tight">
                MOVIE<span className="text-[#f39a4b]">BASH</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Movie Bash is Bengaluru&apos;s premier luxury private theatre destination. Offering fully private 4K cinema screenings, custom celebration decorations, fog entries, and personalized surprises for couples, families, and friends.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com/moviebashprivatetheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#237eea] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Moviebashblr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#237eea] transition-colors"
                aria-label="X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/moviebash_privatetheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#237eea] transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@MovieBashPrivateTheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#237eea] transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              QUICK LINKS
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/gallery" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  Celebration Gallery
                </Link>
              </li>
              <li>
                <Link href="/blog" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  Party &amp; Movie Blog
                </Link>
              </li>
              <li>
                <Link href="/testimonials" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  Reviews &amp; Ratings
                </Link>
              </li>
              <li>
                <Link href="/faq" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-slate-300 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Bengaluru Venues */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              OUR BENGALURU VENUES
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <span className="font-bold text-white block text-sm">Electronic City Branch</span>
                <p className="text-slate-300 mt-1 leading-snug">
                  MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Bengaluru 560100
                </p>
                <a href="tel:+919902923656" className="text-amber-400 hover:text-amber-300 mt-2 block font-bold transition-colors">
                  +91 99029 23656
                </a>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                <span className="font-bold text-white block text-sm">BTM 2nd Stage Branch (NEW)</span>
                <p className="text-slate-300 mt-1 leading-snug">
                  MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076
                </p>
                <a href="tel:+919902923656" className="text-amber-400 hover:text-amber-300 mt-2 block font-bold transition-colors">
                  +91 99029 23656
                </a>
              </div>
            </div>
          </div>

          {/* Col 4: VIP Offers on WhatsApp & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              VIP OFFERS ON WHATSAPP
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Subscribe to get secret discount codes and priority weekend slot drops before anyone else.
            </p>

            {subscribed ? (
              <div className="p-3 rounded-2xl bg-emerald-900/60 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You&apos;re subscribed! Look out for exclusive perks.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="text"
                    suppressHydrationWarning
                    value={subscriberInput}
                    onChange={(e) => setSubscriberInput(e.target.value)}
                    placeholder="Enter phone or email"
                    className="w-full pl-4 pr-11 py-2.5 rounded-full bg-white/10 border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400 transition-all"
                    required
                  />
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="absolute right-1 top-1 w-8 h-8 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 flex items-center justify-center font-bold transition-colors shadow"
                    aria-label="Subscribe"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 block">
                  Zero spam. Unsubscribe anytime.
                </span>
              </form>
            )}

            <div className="pt-2 space-y-2">
              <a
                href="https://wa.me/919902923656?text=Hi%20Movie%20Bash%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20private%20theatre."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-[#25d366]/20 border border-[#25d366]/40 text-white hover:bg-[#25d366] hover:text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#25d366] group-hover:text-slate-950" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href="mailto:bookmoviebash@gmail.com"
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors pt-1"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>bookmoviebash@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal (STRICTLY NO ADMIN LINKS) */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Movie Bash Private Theatre (Bengaluru). All rights reserved.
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/terms-and-conditions" prefetch={true} className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" prefetch={true} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" prefetch={true} className="hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link href="/contact" prefetch={true} className="hover:text-white transition-colors">
              Help &amp; Support
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
