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
          className="w-13 h-13 p-3.5 rounded-full bg-[#141110] hover:bg-black text-white shadow-lg transition-transform hover:scale-110 flex items-center justify-center group"
          title="Call Movie Bash"
          aria-label="Call Movie Bash"
        >
          <Phone className="w-6 h-6 text-[#ffd46e]" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 text-xs font-bold">
            Call +91 99029 23656
          </span>
        </a>
      </div>

      {/* Mobile Sticky Bottom Bar with 1-Tap WhatsApp, Call & Booking */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ef4a23]/15 px-3 py-2 flex items-center gap-2 shadow-lg">
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
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold text-[#141110] bg-[#fff0ea] border border-[#ef4a23]/25 active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5 text-[#ef4a23]" />
          <span>Call Us</span>
        </a>

        <Link
          href="/book-now"
          className="flex-[1.5] flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#ef4a23] to-[#ff5b35] shadow-md active:scale-95 transition-transform"
        >
          <CalendarDays className="w-3.5 h-3.5 text-white" />
          <span>Book Now (₹899)</span>
        </Link>
      </div>
    </>
  );
}
