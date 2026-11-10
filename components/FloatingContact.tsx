'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, CalendarDays, MessageCircle } from 'lucide-react';

export default function FloatingContact() {
  return (
    <>
      {/* Desktop Floating Action Buttons (Bottom Right) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-40 flex-col gap-3">
        {/* WhatsApp Chat Button */}
        <a
          href="https://wa.me/919902923656?text=Hi%20Movie%20Bash!%20I%20would%20like%20to%20inquire%20about%20booking%20a%20private%20theatre%20slot."
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-elevated transition-transform hover:scale-110 flex items-center justify-center group"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
            Chat with us
          </span>
        </a>

        {/* Call Button */}
        <a
          href="tel:+919902923656"
          className="w-13 h-13 p-3.5 rounded-full bg-royal-700 hover:bg-royal-600 text-white shadow-elevated transition-transform hover:scale-110 flex items-center justify-center group"
          title="Call Movie Bash"
          aria-label="Call Movie Bash"
        >
          <Phone className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
            Call +91 99029 23656
          </span>
        </a>
      </div>

      {/* Mobile Sticky Bottom Bar with 1-Tap WhatsApp, Call & Booking */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-sand-200 px-3 py-2 flex items-center gap-2 shadow-elevated">
        <a
          href="https://wa.me/919902923656?text=Hi%20Movie%20Bash!%20I%20would%20like%20to%20inquire%20about%20booking%20a%20private%20theatre%20slot."
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 active:scale-95 transition-transform shadow-sm"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle className="w-5 h-5 fill-white" />
        </a>

        <a
          href="tel:+919902923656"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold text-royal-900 bg-sand-100 border border-sand-200 active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5 text-royal-700" />
          <span>Call Us</span>
        </a>

        <Link
          href="/book-now"
          prefetch={true}
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold text-white bg-royal-700 shadow-royal-glow active:scale-95 transition-transform"
        >
          <CalendarDays className="w-3.5 h-3.5 text-amber-300" />
          <span>Book Now (From ₹899)</span>
        </Link>
      </div>
    </>
  );
}
