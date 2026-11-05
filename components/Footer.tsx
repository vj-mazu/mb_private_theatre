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
  Youtube 
} from 'lucide-react';

export default function Footer() {
  const [subscriberInput, setSubscriberInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriberInput) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: subscriberInput }),
      });
    } catch (e) {
      // ignore
    }
    setSubscribed(true);
    setSubscriberInput('');
  };

  return (
    <footer className="bg-royal-950 text-sand-100 border-t border-royal-900 pt-16 pb-24 sm:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-royal-900">
          
          {/* Col 1: Brand & Socials (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-royal-700 text-amber-300 flex items-center justify-center">
                <Film className="w-5 h-5" />
              </div>
              <span className="font-playfair text-2xl font-black text-white tracking-tight">
                MOVIE<span className="text-royal-400">BASH</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-sm">
              Movie Bash is Bengaluru’s premier luxury private theatre destination. Offering fully private 4K cinema screenings, custom celebration decorations, fog entries, and personalized surprises for couples, families, and friends.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com/moviebashprivatetheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-royal-900 border border-royal-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-royal-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://x.com/Moviebashblr"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-royal-900 border border-royal-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-royal-700 transition-colors"
                aria-label="X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/moviebash_privatetheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-royal-900 border border-royal-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-royal-700 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com/@MovieBashPrivateTheatre"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-royal-900 border border-royal-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-royal-700 transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/" prefetch={true} className="text-slate-300 hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" prefetch={true} className="text-slate-300 hover:text-white transition-colors">About Us</Link>
              </li>
              <li>
                <Link href="/gallery" prefetch={true} className="text-slate-300 hover:text-white transition-colors">Celebration Gallery</Link>
              </li>
              <li>
                <Link href="/blog" prefetch={true} className="text-slate-300 hover:text-white transition-colors">Party &amp; Movie Blog</Link>
              </li>
              <li>
                <Link href="/testimonials" prefetch={true} className="text-slate-300 hover:text-white transition-colors">Reviews &amp; Ratings</Link>
              </li>
              <li>
                <Link href="/faq" prefetch={true} className="text-slate-300 hover:text-white transition-colors">FAQs</Link>
              </li>
              <li>
                <Link href="/contact" prefetch={true} className="text-slate-300 hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/admin" prefetch={true} className="text-amber-400 font-bold hover:text-amber-300 transition-colors flex items-center gap-1">
                  <span>🔒 Admin Panel &amp; CMS</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Venues (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Our Bengaluru Venues
            </h4>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-royal-900/80 border border-royal-800">
                <span className="font-bold text-white block">Electronic City Branch</span>
                <p className="text-slate-300 mt-1 leading-snug">
                  MovieBash, 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Bengaluru 560100
                </p>
                <span className="text-amber-300 mt-1.5 block font-bold">+91 99029 23656</span>
              </div>

              <div className="p-3 rounded-2xl bg-royal-900/80 border border-royal-800">
                <span className="font-bold text-white block">BTM 2nd Stage Branch (NEW)</span>
                <p className="text-slate-300 mt-1 leading-snug">
                  MovieBash, 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076
                </p>
                <span className="text-amber-300 mt-1.5 block font-bold">+91 99029 23656</span>
              </div>
            </div>
          </div>

          {/* Col 4: Newsletter & Exclusive Offers (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
              VIP Offers on WhatsApp
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
                    className="w-full px-4 py-2.5 rounded-full bg-royal-900 border border-royal-800 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-400"
                    required
                  />
                  <button
                    type="submit"
                    suppressHydrationWarning
                    className="absolute right-1.5 top-1.5 p-1.5 rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300 font-bold transition-colors"
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

            <div className="pt-2">
              <a
                href="mailto:bookmoviebash@gmail.com"
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-white"
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                <span>bookmoviebash@gmail.com</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Movie Bash Private Theatre (Bengaluru). All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <Link href="/terms-and-conditions" prefetch={true} className="hover:text-white transition-colors">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy-policy" prefetch={true} className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" prefetch={true} className="hover:text-white transition-colors">
              Refund Policy
            </Link>
            <Link href="/admin" prefetch={true} className="text-amber-400 hover:text-white font-extrabold transition-colors">
              🔒 Admin Panel (/admin)
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
