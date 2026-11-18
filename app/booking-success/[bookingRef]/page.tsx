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
  Sparkles,
  QrCode,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import QRCode from 'qrcode';

export default function BookingSuccessPage({ params }: { params: { bookingRef: string } }) {
  const { bookingRef } = params;
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [entryQrDataUrl, setEntryQrDataUrl] = useState<string>('');

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

  // Generate Venue Check-In QR Pass
  useEffect(() => {
    if (bookingRef) {
      QRCode.toDataURL(`MOVIEBASH-PASS:${bookingRef}`, {
        width: 200,
        margin: 1,
        color: {
          dark: '#141110',
          light: '#FFFFFF'
        }
      })
        .then(url => setEntryQrDataUrl(url))
        .catch(() => {});
    }
  }, [bookingRef]);

  // Construct target WhatsApp URL safely
  const getWhatsAppUrl = () => {
    if (bookingData?.whatsapp_confirmation?.url) {
      return bookingData.whatsapp_confirmation.url;
    }

    const fallbackText = 
      `🎬 *MOVIE BASH RESERVATION PASS* 🍿\n\n` +
      `*Booking Ref:* ${bookingRef}\n` +
      `*Name:* ${bookingData?.customer_name || 'Guest'}\n` +
      `*Date & Slot:* ${bookingData?.booking_date || ''} (${bookingData?.slot?.label || ''})\n\n` +
      `Hi Movie Bash team, I have completed my reservation. Please confirm my celebration details! 🎉`;
    return `https://wa.me/919902923656?text=${encodeURIComponent(fallbackText)}`;
  };

  const handleOpenWhatsApp = () => {
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
      <main className="min-h-screen flex flex-col bg-cream text-ink">
        <Navbar />
        <div className="flex-1 py-10 sm:py-16 px-4 sm:px-6">
          <div className="max-w-2xl mx-auto bg-white p-7 sm:p-12 rounded-3xl border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#fff0ea] text-[#141110] mx-auto flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 border-4 border-[#ef4a23] border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-sm font-bold text-slate-700 mt-4">Loading your reservation pass...</p>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const b = bookingData;
  const totalAmount = Number(b?.total || 899);
  const advanceLogged = Number(b?.advance_paid || 500);
  const balanceDue = Math.max(0, totalAmount - advanceLogged);

  return (
    <main className="min-h-screen flex flex-col bg-cream text-ink">
      <Navbar />

      <div className="flex-1 py-8 sm:py-14 px-3 sm:px-6">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Main Digital Pass Ticket */}
          <div className="bg-white rounded-3xl border-2 border-orange-200/80 shadow-[0_20px_50px_rgba(239,74,35,0.08)] overflow-hidden">
            
            {/* Header Ribbon Banner */}
            <div className="bg-gradient-to-r from-[#141110] via-slate-900 to-[#141110] p-6 text-white text-center space-y-2 relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-400/30">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider shadow-sm">
                Reservation Confirmed
              </span>
              <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#ffd46e]">
                Celebration Locked! 🎬🎉
              </h1>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Private cinema suite reserved for <strong className="text-white">{b?.customer_name || 'Guest'}</strong>
              </p>
            </div>

            {/* Ticket Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Reference ID & Reception Check-in QR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-orange-50/60 border border-orange-200/80">
                <div className="text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                    Booking Reference Pass ID
                  </span>
                  <div className="font-mono font-black text-xl sm:text-2xl text-[#141110] tracking-wider select-all">
                    {bookingRef}
                  </div>
                  <span className="text-[11px] text-emerald-700 font-extrabold flex items-center gap-1 justify-center sm:justify-start">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Slot verified &amp; blocked in calendar</span>
                  </span>
                </div>

                {entryQrDataUrl && (
                  <div className="flex flex-col items-center shrink-0">
                    <img 
                      src={entryQrDataUrl} 
                      alt="Venue Check-in QR Pass"
                      className="w-20 h-20 rounded-xl border-2 border-white shadow-xs"
                    />
                    <span className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      Reception QR Pass
                    </span>
                  </div>
                )}
              </div>

              {/* Booking Snapshot Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-800 font-semibold">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <MapPin className="w-4 h-4 text-[#ef4a23] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Venue &amp; Branch</span>
                    <span className="font-extrabold text-slate-900">{b?.branch?.name || 'Movie Bash – Electronic City'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Theatre Suite</span>
                    <span className="font-extrabold text-slate-900">{b?.theatre?.name || 'Couple Theater'} {b?.theatre?.emoji || '🎬'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Calendar className="w-4 h-4 text-[#ef4a23] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Event Date</span>
                    <span className="font-extrabold text-slate-900">{b?.booking_date}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Clock className="w-4 h-4 text-[#ef4a23] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Showtime Slot</span>
                    <span className="font-extrabold text-slate-900">{b?.slot?.label || 'Scheduled Slot'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <Users className="w-4 h-4 text-[#ef4a23] shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Guest Count</span>
                    <span className="font-extrabold text-slate-900">{b?.guests || 2} People Attending</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-base">🎂</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Celebration Occasion</span>
                    <span className="font-extrabold text-slate-900">{b?.occasion?.name || 'Birthday / Anniversary'}</span>
                  </div>
                </div>
              </div>

              {/* Name on Screen if provided */}
              {b?.screen_name && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                  <span className="text-amber-900 font-extrabold block">✨ Display Name on 4K Cinema Screen:</span>
                  <span className="font-black text-slate-900 text-sm mt-0.5 block">"{b.screen_name}"</span>
                </div>
              )}

              {/* Clear Financial Summary with Remaining Balance Notice */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/40 border-2 border-orange-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  Payment Status &amp; Balance Breakdown
                </span>
                
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-slate-600">Total Celebration Bill:</span>
                  <span className="font-black text-slate-900">₹{totalAmount}</span>
                </div>

                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Advance Required / Submitted:</span>
                  </span>
                  <span className="font-black">₹{advanceLogged}</span>
                </div>

                <div className="pt-2 border-t border-orange-200/80 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-extrabold text-slate-900 block">Remaining Balance Due:</span>
                    <span className="text-[11px] text-slate-500 font-medium">To be paid at venue counter after your event</span>
                  </div>
                  <span className="font-black text-lg text-[#ef4a23]">₹{balanceDue}</span>
                </div>
              </div>

              {/* Big Green WhatsApp Coordinator CTA */}
              <div className="space-y-2 text-center pt-2">
                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer ring-4 ring-emerald-500/20"
                >
                  <MessageSquare className="w-5 h-5 fill-white shrink-0" />
                  <span>Chat with Venue Coordinator (+91 99029 23656)</span>
                </button>
                <span className="text-[11px] text-slate-500 font-medium block">
                  Click to coordinate cake design, surprise decor timing &amp; favorite celebration songs.
                </span>
              </div>

              {/* Action Buttons: Copy Details & Back to Home */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCopyDetails}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl border-2 border-slate-300 hover:border-slate-400 bg-white text-xs font-bold text-slate-800 shadow-2xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                  <span>{copied ? 'Pass Details Copied!' : 'Copy Reservation Pass'}</span>
                </button>

                <Link
                  href="/"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 shadow-2xs flex items-center justify-center gap-2 transition-all"
                >
                  <Home className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>
              </div>

              {/* Venue Helpline */}
              <div className="pt-3 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
                <span>Official Movie Bash Coordinator Desk: </span>
                <a href="tel:+919902923656" className="font-extrabold text-[#ef4a23] hover:underline">
                  +91 99029 23656
                </a>
              </div>

            </div>

          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
