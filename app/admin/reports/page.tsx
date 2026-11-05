'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  Download, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  AlertCircle,
  PhoneCall,
  Globe,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function AdminReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'daily' | 'monthly' | 'cancelled'>('all');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(res => res.json())
      .then(json => {
        if (json.success) setStats(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-16 text-center text-xs font-bold text-royal-900 animate-pulse">
        Generating real-time financial statements &amp; audit reports...
      </div>
    );
  }

  const { 
    metrics, 
    daily_timeline = [], 
    monthly_timeline = [], 
    cancelled_list = [], 
    channel_distribution = [], 
    branch_distribution = [], 
    theatre_distribution = [] 
  } = stats;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-royal-700">Financial Intelligence</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
            Revenue &amp; Analytics Dashboard
          </h1>
          <p className="text-xs text-ink/70 mt-1">
            Real-time daily, monthly, total revenue, and cancellation loss audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-sand-200 border border-sand-300 flex text-xs font-bold">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'all' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'daily' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'monthly' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('cancelled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'cancelled' ? 'bg-royal-700 text-white shadow-sm' : 'text-royal-900'}`}
            >
              Cancellations
            </button>
          </div>

          <a
            href="/api/admin/bookings/export"
            download
            className="px-4 py-2 rounded-2xl text-xs font-bold text-royal-900 bg-sand-100 hover:bg-sand-200 border border-sand-300 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4 text-royal-700" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* 4 CORE KPI CARDS: Total, Monthly, Daily, Cancelled */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. TOTAL REVENUE */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-royal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Total Gross Revenue</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <IndianRupee className="w-4 h-4" />
            </span>
          </div>
          <div className="font-playfair text-3xl font-black text-slate-900 mt-2">
            ₹{metrics.total_revenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-bold">
              ₹{metrics.advance_collected.toLocaleString()} secured
            </span>
            <span className="text-amber-700 font-bold">
              ₹{metrics.balance_pending.toLocaleString()} pending
            </span>
          </div>
        </div>

        {/* 2. MONTHLY REVENUE */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-royal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>This Month Revenue</span>
            <span className="p-2 rounded-xl bg-royal-50 text-royal-700">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="font-playfair text-3xl font-black text-royal-900 mt-2">
            ₹{metrics.this_month_revenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-bold">
              {metrics.this_month_bookings} bookings in Nov
            </span>
            <span className="text-emerald-700 font-bold flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 inline" />
              ₹{metrics.this_month_advance.toLocaleString()} adv
            </span>
          </div>
        </div>

        {/* 3. DAILY REVENUE */}
        <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:border-royal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Today&apos;s Daily Revenue</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="font-playfair text-3xl font-black text-amber-700 mt-2">
            ₹{metrics.today_revenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-700 font-bold">
              {metrics.todays_bookings} shows today
            </span>
            <span className="text-slate-500 font-medium">
              Y&apos;day: ₹{metrics.yesterday_revenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 4. CANCELLED / REFUNDED METRICS */}
        <div className="p-6 rounded-3xl bg-white border-2 border-rose-200 shadow-sm hover:border-rose-400 transition-all">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-rose-600">
            <span>Cancelled &amp; Refunds</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <XCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="font-playfair text-3xl font-black text-rose-700 mt-2">
            ₹{metrics.cancelled_lost_revenue.toLocaleString()}
          </div>
          <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-bold">
              {metrics.cancelled_bookings} Cancelled ({metrics.cancellation_rate_pct}%)
            </span>
            <span className="text-slate-600 font-medium">
              ₹{metrics.total_refunded.toLocaleString()} refunded
            </span>
          </div>
        </div>

      </div>

      {/* DAILY TIMELINE SECTION */}
      {(timeframe === 'all' || timeframe === 'daily') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-royal-700" />
              <h2 className="font-playfair text-xl font-bold text-royal-900">
                14-Day Daily Revenue Activity
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Day-by-Day Bookings &amp; Collections
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Screenings</th>
                  <th className="py-2.5 px-3">Gross Revenue</th>
                  <th className="py-2.5 px-3">Advance Collected</th>
                  <th className="py-2.5 px-3">Balance at Venue</th>
                  <th className="py-2.5 px-3">Visual Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daily_timeline.map((day: any) => {
                  const maxDayRev = Math.max(...daily_timeline.map((d: any) => d.revenue), 1);
                  const pct = Math.round((day.revenue / maxDayRev) * 100);
                  const isToday = day.date === new Date().toISOString().split('T')[0];
                  return (
                    <tr key={day.date} className={`hover:bg-sand-50/50 ${isToday ? 'bg-amber-50/60 font-bold' : ''}`}>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-900">{day.display_date}</span>
                        {isToday && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                            TODAY
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-800">
                          {day.count} shows
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        ₹{day.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-emerald-700 font-bold">
                        ₹{day.advance.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-amber-700 font-bold">
                        ₹{Math.max(0, day.revenue - day.advance).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 min-w-[120px]">
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${isToday ? 'bg-amber-500' : 'bg-royal-600'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MONTHLY TIMELINE SECTION */}
      {(timeframe === 'all' || timeframe === 'monthly') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-royal-700" />
              <h2 className="font-playfair text-xl font-bold text-royal-900">
                Monthly Financial History (Last 6 Months)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Aggregated Monthly Totals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthly_timeline.map((m: any) => (
              <div key={m.month_key} className="p-5 rounded-2xl bg-sand-50 border border-sand-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-lg font-bold text-royal-900">{m.display_month}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-royal-800 border border-sand-300">
                    {m.count} Bookings
                  </span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Gross Sales:</span>
                    <strong className="text-slate-900">₹{m.revenue.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Advance Deposited:</span>
                    <strong className="text-emerald-700">₹{m.advance.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Avg Ticket Value:</span>
                    <strong className="text-royal-700">
                      ₹{m.count > 0 ? Math.round(m.revenue / m.count).toLocaleString() : 0}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CANCELLED & REFUNDED BOOKINGS LOG */}
      {(timeframe === 'all' || timeframe === 'cancelled') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-rose-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-rose-100 pb-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" />
              <h2 className="font-playfair text-xl font-bold text-royal-900">
                Cancelled Bookings &amp; Refund Ledger ({cancelled_list.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Total Lost Sales: ₹{metrics.cancelled_lost_revenue.toLocaleString()}
            </span>
          </div>

          {cancelled_list.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No cancelled bookings recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-extrabold">
                    <th className="py-2.5 px-3">Ref &amp; Customer</th>
                    <th className="py-2.5 px-3">Screen &amp; Date</th>
                    <th className="py-2.5 px-3">Original Total</th>
                    <th className="py-2.5 px-3">Refund Amount</th>
                    <th className="py-2.5 px-3">Reason for Cancellation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cancelled_list.map((c: any) => (
                    <tr key={c.id} className="hover:bg-rose-50/30">
                      <td className="py-3 px-3">
                        <strong className="block text-slate-900">{c.customer_name}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">{c.ref} &bull; {c.customer_phone}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="block font-bold text-royal-900">{c.theatre_name}</span>
                        <span className="text-[11px] text-slate-500">{c.booking_date} &bull; {c.branch_name}</span>
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700">
                        ₹{c.total.toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-800 font-bold">
                          ₹{c.refund_amount.toLocaleString()} Refunded
                        </span>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <span className="text-slate-600 italic block">
                          &ldquo;{c.cancelled_reason}&rdquo;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHANNEL (SOURCE) & VENUE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Booking Channel Distribution (Phone Call vs Web vs Walk-in) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-royal-700" />
            <span>Booking Source Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Compare revenues generated from direct customer phone calls versus website bookings.
          </p>

          <div className="space-y-3 pt-2">
            {channel_distribution.map((ch: any) => (
              <div key={ch.source_key} className="p-4 rounded-2xl bg-sand-50 border border-sand-200 flex items-center justify-between">
                <div>
                  <strong className="block text-sm text-royal-900">{ch.name}</strong>
                  <span className="text-xs text-slate-500">{ch.count} Bookings ({ch.pct}% of revenue)</span>
                </div>
                <span className="font-playfair text-xl font-black text-emerald-700">
                  ₹{ch.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Branch Revenue Breakdown */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-slate-200 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-royal-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-royal-700" />
            <span>Branch Performance Comparison</span>
          </h3>
          <p className="text-xs text-slate-500">
            Total sales and today&apos;s daily activity across Electronic City and BTM 2nd Stage.
          </p>

          <div className="space-y-3 pt-2">
            {branch_distribution.map((b: any) => (
              <div key={b.id} className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-base text-royal-900">{b.name}</strong>
                  <span className="font-playfair text-xl font-black text-emerald-700">
                    ₹{b.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-sand-200">
                  <span>{b.count} Total Bookings</span>
                  <span className="font-bold text-amber-700">
                    Today: {b.today_count} shows (₹{b.today_revenue.toLocaleString()})
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
