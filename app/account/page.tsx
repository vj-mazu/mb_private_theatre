'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Film, 
  Sparkles, 
  RotateCcw, 
  User, 
  LogOut,
  CalendarDays
} from 'lucide-react';

export default function CustomerAccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<any>(null);
  const [bookings, setBookings] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/customer/bookings');
        const data = await res.json();
        if (data.success) {
          setCustomer(data.customer);
          setBookings(data.data);
        } else {
          router.push('/login');
        }
      } catch (e) {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-sand-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12 text-sm font-bold text-royal-900">
          Loading your account...
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />

      <div className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1">
        
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-royal-900 text-white shadow-elevated flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-royal-700 text-amber-400 flex items-center justify-center font-playfair font-black text-2xl border border-royal-600">
              {customer?.name ? customer.name[0] : 'G'}
            </div>
            <div>
              <span className="text-xs text-slate-300 font-semibold block uppercase tracking-wider">Welcome Back</span>
              <h1 className="font-playfair text-2xl sm:text-3xl font-black">{customer?.name || 'Valued Guest'}</h1>
              <p className="text-xs text-slate-200 mt-0.5">+91 {customer?.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/book-now"
              className="px-6 py-3 rounded-full text-xs font-extrabold text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm flex items-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Book New Screening</span>
            </Link>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-2xl font-bold text-royal-900">
              My Screenings &amp; Celebrations
            </h2>
            <span className="text-xs font-semibold text-ink/60">
              {bookings.length} Total Bookings
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-sand-200 text-center space-y-4 shadow-soft">
              <Film className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="font-bold text-base text-royal-900">No Bookings Found</h3>
              <p className="text-xs text-ink/70 max-w-xs mx-auto">
                You haven&apos;t booked a private celebration with this phone number yet.
              </p>
              <Link
                href="/book-now"
                className="inline-block px-6 py-3 rounded-full text-xs font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow"
              >
                Book Your First Slot
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="p-6 rounded-3xl bg-white border border-sand-200 shadow-soft space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-sand-100">
                      <span className="font-mono text-xs font-bold text-royal-700">
                        {b.booking_ref}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sand-200 text-ink/70'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-ink/80">
                        <Calendar className="w-4 h-4 text-royal-600" />
                        <span>Date: <strong>{b.booking_date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-ink/80">
                        <Film className="w-4 h-4 text-royal-600" />
                        <span>{b.theatre_name || 'Private Screen'} &bull; {b.guests} Guests</span>
                      </div>
                      <div className="flex items-center gap-2 text-ink/80">
                        <Sparkles className="w-4 h-4 text-royal-600" />
                        <span>Title: &ldquo;{b.screen_name || 'Celebration'}&rdquo;</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-sand-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-ink/60 uppercase block">Total Amount</span>
                      <strong className="text-sm font-bold text-royal-900">₹{b.total}</strong>
                    </div>

                    <a
                      href={`https://wa.me/919902923656?text=Hi%20Movie%20Bash!%20I%20would%20like%20to%20reschedule%20booking%20${b.booking_ref}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-royal-700 bg-sand-100 hover:bg-sand-200 border border-sand-200 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Request Reschedule</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
      <FloatingContact />
    </main>
  );
}
