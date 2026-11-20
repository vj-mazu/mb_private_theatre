'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Phone } from 'lucide-react';

export default function AnnouncementBar() {
  const [coupon, setCoupon] = useState<{ code: string; discount_value: number } | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch('/api/coupons/featured')
      .then(r => r.json())
      .then(j => {
        if (j.success && j.data?.code) {
          setCoupon({
            code: j.data.code,
            discount_value: Number(j.data.discount_value) || 0,
          });
        } else {
          setCoupon(null);
        }
      })
      .catch(() => setCoupon(null))
      .finally(() => setLoaded(true));
  }, []);

  // No active coupon in the admin panel means no promo bar at all.
  if (loaded && !coupon) return null;

  return (
    <div className="bg-[#0B2238] text-[#F6FAFD] py-2 px-3 sm:px-4 text-[11px] sm:text-xs font-medium border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto text-center sm:text-left">
          <span className="inline-flex items-center justify-center px-2 py-0.5 bg-[#00A2E4] text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shrink-0 shadow-xs">
            Opening Offer
          </span>
          {coupon ? (
            <span className="leading-tight sm:leading-normal">
              Flat <strong className="text-[#ffd46e] font-bold">₹{coupon.discount_value} OFF</strong> with code <strong className="bg-white/15 px-1.5 py-0.5 rounded text-white font-mono font-black tracking-wide">{coupon.code}</strong>!
              <Link href="/book-now" className="inline-block ml-2 text-[#ffd46e] underline font-bold sm:hidden">
                Book &rarr;
              </Link>
            </span>
          ) : (
            <span className="leading-tight sm:leading-normal">
              Private theatres in Electronic City &amp; BTM 2nd Stage.
              <Link href="/book-now" className="inline-block ml-2 text-[#ffd46e] underline font-bold">
                Book &rarr;
              </Link>
            </span>
          )}
        </div>
        <div className="hidden md:flex items-center gap-4 shrink-0 text-xs">
          <a
            href="tel:+919902923656"
            className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-[#ffd46e]" />
            <span className="font-semibold">+91 99029 23656</span>
          </a>
          <span className="text-white/40">|</span>
          <Link href="/book-now" className="text-[#ffd46e] hover:text-white font-bold transition-colors">
            Check Slots &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
