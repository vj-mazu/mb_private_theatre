'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Film, 
  Calendar, 
  IndianRupee, 
  Clock, 
  Users, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Sparkles,
  PhoneCall,
  Ticket,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [branchFilter, setBranchFilter] = useState<'all' | '1' | '2'>('all');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const query = branchFilter === 'all' ? '' : `?branch=${branchFilter}`;
        const res = await fetch(`/api/admin/stats${query}`);
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [branchFilter]);

  if (loading || !data) {
    return (
      <div className="py-16 text-center text-xs font-bold text-slate-500 animate-pulse">
        Loading manager dashboard...
      </div>
    );
  }

  const { metrics, branch_distribution, occasion_distribution, today_schedule } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Top Header & Branch Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#00A2E4]">Operations Desk</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#0B2238]">
            Manager Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time today&apos;s screenings, instant revenue overview, and quick phone call booking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Branch Filter Switcher */}
          <div className="p-1 rounded-2xl bg-white border border-slate-200 flex text-xs font-bold shadow-xs">
            <button
              onClick={() => setBranchFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                branchFilter === 'all' ? 'bg-[#0B2238] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Branches
            </button>
            <button
              onClick={() => setBranchFilter('1')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                branchFilter === '1' ? 'bg-[#0B2238] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Electronic City
            </button>
            <button
              onClick={() => setBranchFilter('2')}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                branchFilter === '2' ? 'bg-[#0B2238] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              BTM 2nd Stage
            </button>
          </div>

          <Link
            href="/admin/bookings?action=new"
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-white bg-[#00A2E4] hover:bg-[#0072AE] shadow-lg shadow-[#00A2E4]/20 flex items-center gap-2 shrink-0 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Book Showtime</span>
          </Link>
        </div>
      </div>

      {/* 4 Clean Essential Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Daily Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#00A2E4] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#0072AE] block">Today&apos;s Revenue</span>
            <Clock className="w-4 h-4 text-[#0072AE]" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-[#0B2238] mt-2">
            ₹{(metrics.today_revenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-slate-500 font-bold mt-1 block">
            {metrics.todays_bookings} shows scheduled today
          </span>
        </div>

        {/* Total Revenue */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-emerald-800 mt-2">
            ₹{(metrics.total_revenue || 0).toLocaleString()}
          </div>
          <span className="text-xs text-emerald-700 font-bold mt-1 block">
            ₹{(metrics.advance_collected || 0).toLocaleString()} advance secured
          </span>
        </div>

        {/* Pending Balance to Collect */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">Pending Balance</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-amber-900 mt-2">
            ₹{(metrics.balance_pending || 0).toLocaleString()}
          </div>
          <span className="text-xs text-amber-800 font-bold mt-1 block">
            Due on arrival at venue
          </span>
        </div>

        {/* Total Bookings */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-[#00A2E4] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#082052] block">Total Bookings</span>
            <Ticket className="w-4 h-4 text-[#082052]" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-[#082052] mt-2">
            {metrics.total_bookings}
          </div>
          <span className="text-xs text-slate-500 font-bold mt-1 block">
            {metrics.this_month_bookings || metrics.total_bookings} in {new Date().toLocaleDateString('en-IN', { month: 'short' })}
          </span>
        </div>

      </div>

      {/* Today's Schedule Timeline per Theatre */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#00A2E4]" />
            <h3 className="font-playfair text-xl font-bold text-[#0B2238]">
              Today&apos;s Screening Schedule Timeline
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {today_schedule.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 font-medium">
            No shows scheduled for today yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {today_schedule.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#00A2E4] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0B2238] flex items-center gap-1.5">
                    <span>{item.emoji}</span>
                    <span className="font-black">{item.theatre}</span>
                  </span>
                  <span className="font-mono text-[10.5px] text-[#0072AE] font-black bg-white px-1.5 py-0.5 rounded border border-sky-200">
                    {item.ref}
                  </span>
                </div>

                <div className="font-black text-sm text-[#0072AE] flex items-center justify-between">
                  <span>{item.slot}</span>
                  {item.extra_hours > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B2238] text-white font-bold">
                      +{item.extra_hours}h Extra
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-700 flex items-center justify-between pt-1 border-t border-slate-200">
                  <span>Guest: <strong>{item.customer}</strong></span>
                  <span className="text-slate-500 font-semibold">{item.guests} Guests</span>
                </div>

                {item.title && (
                  <div className="text-[11px] text-slate-500 italic truncate">
                    &ldquo;{item.title}&rdquo;
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics: Branch Distribution & Occasions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Bookings per branch */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-[#0B2238] flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00A2E4]" />
            <span>Branch Performance</span>
          </h3>

          <div className="space-y-4 pt-1">
            {branch_distribution.map((b: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>{b.name}</span>
                  <span>{b.count} Bookings &bull; ₹{b.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00A2E4] h-full rounded-full"
                    style={{ width: `${Math.min(100, (b.count / (metrics.total_bookings || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Occasion */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-[#0B2238] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00A2E4]" />
            <span>Occasion Breakdown</span>
          </h3>

          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {occasion_distribution.map((o: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold block truncate">{o.name}</span>
                <span className="font-playfair text-xl font-black text-[#0B2238]">{o.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
