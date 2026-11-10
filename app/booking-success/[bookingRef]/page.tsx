'use client';

import React, { useState, useEffect } from 'react';
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
  Copy,
  Check,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BookingSuccessPage({ params }: { params: { bookingRef: string } }) {
  const { bookingRef } = params;
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number>(4);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState<boolean>(true);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${bookingRef}`);
        const json = await res.json();
        if (json.success) {
          setBookingData(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch booking:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [bookingRef]);

  // Construct target WhatsApp URL safely
  const getWhatsAppUrl = () => {
    if (bookingData?.whatsapp_confirmation?.url) {
      return bookingData.whatsapp_confirmation.url;
    }
    let savedUrl = '';
    try {
      savedUrl = sessionStorage.getItem('mb_last_booking_wa') || '';
    } catch (_) {}

    if (savedUrl) return savedUrl;

    const fallbackText = 
      `🎬 *MOVIE BASH RESERVATION CONFIRMATION* 🎬\n\n` +
      `*Booking Ref:* ${bookingRef}\n` +
      `Hi Movie Bash team, I just reserved a screen! Please confirm my celebration setup and share location details! 🎉`;
    return `https://wa.me/919902923656?text=${encodeURIComponent(fallbackText)}`;
  };

  // Optional countdown auto-redirect to WhatsApp
  useEffect(() => {
    if (!isAutoRedirecting || loading) return;

    if (countdown <= 0) {
      const url = getWhatsAppUrl();
      if (url) {
        window.location.href = url;
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, isAutoRedirecting, loading, bookingData]);

  const handleOpenWhatsApp = () => {
    setIsAutoRedirecting(false);
    const url = getWhatsAppUrl();
    window.open(url, '_blank');
  };

  const handleCopyDetails = () => {
    const text = bookingData?.whatsapp_confirmation?.message || `Movie Bash Booking Ref: ${bookingRef} - Helpline: +91 99029 23656`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-sand-50">
        <Navbar />
        <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto bg-white p-7 sm:p-12 rounded-3xl border border-sand-200 shadow-elevated text-center">
            <div className="w-16 h-16 rounded-full bg-royal-100 text-royal-600 mx-auto flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-4 border-royal-600 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-700 mt-4">Loading your booking details...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const b = bookingData;

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />

      <div className="flex-1 py-8 sm:py-14 px-3 sm:px-6">
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-10 rounded-3xl border-2 border-emerald-500/30 shadow-2xl space-y-6">
          
          {/* Header celebration badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-black tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              <span>Reservation Confirmed</span>
            </span>
            <h1 className="font-playfair text-2xl sm:text-4xl font-black text-slate-950">
              Celebration Locked! 🎬🎉
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your private cinema slot is reserved for <strong className="text-slate-900">{b?.customer_name || 'you'}</strong>.
            </p>
          </div>

          {/* Auto-redirect countdown alert banner */}
          {isAutoRedirecting && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center space-y-1">
              <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900">
                <MessageSquare className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Redirecting you to Movie Bash WhatsApp in {countdown}s...</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAutoRedirecting(false)}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
              >
                Stay on this page (Pause redirect)
              </button>
            </div>
          )}

          {/* Big Green One-Click WhatsApp Button */}
          <div className="space-y-2 text-center">
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-500/20"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Open WhatsApp &amp; Send to Manager (+91 99029 23656)</span>
            </button>
            <span className="text-[11px] text-slate-500 font-medium block">
              Click anytime to chat with your event coordinator regarding cakes, decor &amp; songs.
            </span>
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[11px]">Booking Reference</span>
              <span className="font-mono font-black text-royal-800 text-sm sm:text-base select-all bg-royal-50 px-2.5 py-0.5 rounded-md border border-royal-200">
                {bookingRef}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-slate-800 font-semibold">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-royal-700 shrink-0" />
                <span>{b?.branch?.name || 'Movie Bash – Electronic City'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{b?.theatre?.name || 'Couple Theater'} {b?.theatre?.emoji || '🎬'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-royal-700 shrink-0" />
                <span>Date: {b?.booking_date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-royal-700 shrink-0" />
                <span>Showtime: {b?.slot?.label || 'Scheduled Slot'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-royal-700 shrink-0" />
                <span>{b?.guests || 2} Guests Attending</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-royal-800">Total Price: ₹{b?.total || 899}</span>
              </div>
            </div>

            {b?.screen_name && (
              <div className="pt-2 border-t border-slate-200 text-xs">
                <span className="text-slate-500 font-bold">Screen Display Title: </span>
                <span className="font-extrabold text-royal-900">"{b.screen_name}"</span>
              </div>
            )}
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleCopyDetails}
              className="w-full sm:w-auto px-5 py-3 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-slate-800 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
              <span>{copied ? 'Details Copied!' : 'Copy Booking Details'}</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Venue contact footer */}
          <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-600 font-medium">
            <span>Direct Coordinator Helpline: </span>
            <a href="tel:+919902923656" className="font-bold text-royal-800 hover:underline">
              +91 99029 23656
            </a>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
