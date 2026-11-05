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
  AlertTriangle, 
  MapPin, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  PhoneCall
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
      <div className="py-12 text-center text-xs font-bold text-royal-900">
        Loading operational analytics...
      </div>
    );
  }

  const { metrics, branch_distribution, occasion_distribution, today_schedule } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header & Branch Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-royal-700">Operations Control</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
            Manager Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Branch Filter Switcher */}
          <div className="p-1 rounded-2xl bg-sand-200 border border-sand-300 flex text-xs font-bold">
            <button
              onClick={() => setBranchFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                branchFilter === 'all' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'
              }`}
            >
              All Branches
            </button>
            <button
              onClick={() => setBranchFilter('1')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                branchFilter === '1' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'
              }`}
            >
              Electronic City
            </button>
            <button
              onClick={() => setBranchFilter('2')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                branchFilter === '2' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'
              }`}
            >
              BTM 2nd Stage
            </button>
          </div>

          <Link
            href="/admin/bookings?action=new"
            className="px-4 py-2 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
          >
            <PhoneCall className="w-4 h-4" />
            <span>+ Phone Call Booking</span>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards - Real-time Revenue & Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Today's Daily Revenue */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-amber-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 block">Today&apos;s Revenue</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ₹{(metrics.today_revenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">
            {metrics.todays_bookings} shows scheduled today
          </span>
        </div>

        {/* Monthly Revenue */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-royal-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-royal-700 block">Monthly Revenue</span>
            <Calendar className="w-4 h-4 text-royal-600" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-royal-900 mt-1">
            ₹{(metrics.this_month_revenue || metrics.total_revenue).toLocaleString()}
          </div>
          <span className="text-[11px] text-royal-600 font-semibold mt-1 block">
            {metrics.this_month_bookings || metrics.total_bookings} bookings this month
          </span>
        </div>

        {/* Total Gross Revenue */}
        <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-emerald-500 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">Total Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            ₹{metrics.total_revenue.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold mt-1 block">
            ₹{metrics.advance_collected.toLocaleString()} advance secured
          </span>
        </div>

        {/* Cancelled & Lost Revenue */}
        <div className="p-5 rounded-3xl bg-white border-2 border-rose-200 shadow-sm hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 block">Cancelled &amp; Lost</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="font-playfair text-2xl sm:text-3xl font-black text-rose-700 mt-1">
            ₹{(metrics.cancelled_lost_revenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">
            {metrics.cancelled_bookings} cancelled ({metrics.cancellation_rate_pct || 0}%)
          </span>
        </div>

      </div>

      {/* Financial Reports Quick Nav Banner */}
      <div className="p-4 rounded-2xl bg-[#050F30] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-xs font-bold text-white block">Complete Daily, Monthly &amp; Cancellation Revenue Audits</span>
            <span className="text-[11px] text-slate-300">View 14-day daily charts, past 6-month revenues, refund breakdown, and phone call vs web booking sales.</span>
          </div>
        </div>
        <Link
          href="/admin/reports"
          className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-royal-950 font-black text-xs shrink-0 transition-transform active:scale-95 flex items-center gap-1"
        >
          <span>View Detailed Reports</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Today's Schedule Timeline per Theatre */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-royal-700" />
            <h3 className="font-playfair text-xl font-bold text-royal-900">
              Today&apos;s Screening Schedule Timeline
            </h3>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-sand-100 text-royal-900 border border-sand-200">
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
          </span>
        </div>

        {today_schedule.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink/60">
            No shows scheduled for today yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {today_schedule.map((item: any) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-sand-50 border border-sand-200 hover:border-royal-500 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-royal-900 flex items-center gap-1">
                    <span>{item.emoji}</span>
                    <span>{item.theatre}</span>
                  </span>
                  <span className="font-mono text-[10px] text-royal-700">{item.ref}</span>
                </div>

                <div className="font-bold text-sm text-royal-700">
                  {item.slot}
                </div>

                <div className="text-xs text-ink/80 flex items-center justify-between pt-1 border-t border-sand-200">
                  <span>Guest: <strong>{item.customer}</strong></span>
                  <span className="text-ink/60">{item.guests} Guests</span>
                </div>

                <div className="text-[11px] text-ink/60 italic truncate">
                  &ldquo;{item.title}&rdquo;
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Charts & Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bookings per branch */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-royal-700" />
            <span>Branch Performance</span>
          </h3>

          <div className="space-y-4 pt-2">
            {branch_distribution.map((b: any, idx: number) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-royal-900">
                  <span>{b.name}</span>
                  <span>{b.count} Bookings &bull; ₹{b.revenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-sand-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-royal-700 h-full rounded-full"
                    style={{ width: `${Math.min(100, (b.count / (metrics.total_bookings || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings by Occasion */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand-200 shadow-soft space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-royal-700" />
            <span>Occasion Distribution</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {occasion_distribution.map((o: any, idx: number) => (
              <div key={idx} className="p-3 rounded-2xl bg-sand-50 border border-sand-200">
                <span className="text-xs text-ink/70 block truncate">{o.name}</span>
                <span className="font-playfair text-xl font-black text-royal-900">{o.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
