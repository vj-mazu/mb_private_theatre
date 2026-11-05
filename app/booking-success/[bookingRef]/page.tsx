'use client';

import React from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Share2, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  PhoneCall, 
  Home, 
  Download 
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BookingSuccessPage({ params }: { params: { bookingRef: string } }) {
  const { bookingRef } = params;

  const handleWhatsAppManager = () => {
    let savedUrl = '';
    try {
      savedUrl = sessionStorage.getItem('mb_last_booking_wa') || '';
    } catch (_) {}

    if (savedUrl) {
      window.open(savedUrl, '_blank');
    } else {
      const text = `Hi Movie Bash, I just reserved a screen! Booking Ref: ${bookingRef}. Please confirm my celebration setup and share location details! 🎬🍿`;
      window.open(`https://wa.me/919902923656?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />

      <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white p-7 sm:p-12 rounded-3xl border border-sand-200 shadow-elevated text-center space-y-6">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>No Login Needed • Direct Booking Confirmed</span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-black text-royal-900 mt-1">
              See You at Movie Bash!
            </h1>
            <p className="text-sm text-slate-700 mt-2 max-w-md mx-auto leading-relaxed">
              Your celebration is locked! Your booking details have been sent to our manager. Click below to chat directly with our coordinator on WhatsApp.
            </p>
          </div>

          {/* Booking Ref Card */}
          <div className="p-4 rounded-2xl bg-sand-100/70 border border-sand-300 max-w-sm mx-auto">
            <span className="text-xs text-slate-600 uppercase font-bold tracking-wider block">
              Unique Booking Reference
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-royal-700 tracking-wider select-all block mt-1">
              {bookingRef}
            </span>
          </div>

          {/* Quick Details Box */}
          <div className="p-5 sm:p-6 rounded-2xl bg-royal-900 text-white text-left space-y-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Free reschedule available up to 72 hours prior to showtime.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Location maps &amp; parking instructions sent directly to your phone.</span>
            </div>
            <div className="flex items-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Questions? Call our priority manager: <strong>+91 99029 23656</strong></span>
            </div>
          </div>

          {/* Direct WhatsApp Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleWhatsAppManager}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Send Details to WhatsApp (+91 99029 23656)</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full text-xs sm:text-sm font-bold text-royal-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
