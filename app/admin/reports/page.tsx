'use client';

import React, { useState, useEffect } from 'react';
import { 
  getTodayIST, 
  getTomorrowIST, 
  getYesterdayIST, 
  getDaysAgoIST, 
  getCurrentMonthIST 
} from '@/lib/time';
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
  const [branchFilter, setBranchFilter] = useState<'all' | '1' | '2'>('all');
  const [quickDate, setQuickDate] = useState<'all' | 'today' | 'tomorrow' | 'yesterday' | '7days' | 'month'>('all');
  const [customDate, setCustomDate] = useState('');

  const fetchStats = () => {
    setLoading(true);
    const query = branchFilter !== 'all' ? `?branch=${branchFilter}` : '';
    fetch(`/api/admin/stats${query}`)
      .then(res => res.json())
      .then(json => {
        if (json.success) setStats(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, [branchFilter]);

  if (loading && !stats) {
    return (
      <div className="py-16 text-center text-xs font-bold text-ink animate-pulse">
        Generating real-time financial statements &amp; audit reports...
      </div>
    );
  }

  const { 
    metrics = {}, 
    daily_timeline = [], 
    monthly_timeline = [], 
    cancelled_list = [], 
    channel_distribution = [], 
    branch_distribution = [], 
    theatre_distribution = [] 
  } = stats || {};

  const todayStr = getTodayIST();
  const tomorrowStr = getTomorrowIST();
  const yesterdayStr = getYesterdayIST();
  const sevenDaysAgoStr = getDaysAgoIST(7);
  const currentMonthPrefix = getCurrentMonthIST();

  // Filter daily timeline based on date selection
  const filteredDailyTimeline = daily_timeline.filter((d: any) => {
    if (customDate) return d.date === customDate;
    if (quickDate === 'today') return d.date === todayStr;
    if (quickDate === 'tomorrow') return d.date === tomorrowStr;
    if (quickDate === 'yesterday') return d.date === yesterdayStr;
    if (quickDate === '7days') return d.date >= sevenDaysAgoStr && d.date <= tomorrowStr;
    if (quickDate === 'month') return d.date.startsWith(currentMonthPrefix);
    return true;
  });

  const dailyTotals = filteredDailyTimeline.reduce((acc: any, curr: any) => ({
    count: acc.count + curr.count,
    revenue: acc.revenue + curr.revenue,
    advance: acc.advance + curr.advance,
    balance: acc.balance + Math.max(0, curr.revenue - curr.advance)
  }), { count: 0, revenue: 0, advance: 0, balance: 0 });

  // Filter cancelled bookings based on date selection
  const filteredCancelledList = cancelled_list.filter((c: any) => {
    if (customDate) return c.booking_date === customDate;
    if (quickDate === 'today') return c.booking_date === todayStr;
    if (quickDate === 'tomorrow') return c.booking_date === tomorrowStr;
    if (quickDate === 'yesterday') return c.booking_date === yesterdayStr;
    if (quickDate === '7days') return c.booking_date >= sevenDaysAgoStr && c.booking_date <= tomorrowStr;
    if (quickDate === 'month') return c.booking_date.startsWith(currentMonthPrefix);
    return true;
  });

  const cancelledTotals = filteredCancelledList.reduce((acc: any, curr: any) => ({
    total: acc.total + curr.total,
    refund_amount: acc.refund_amount + curr.refund_amount
  }), { total: 0, refund_amount: 0 });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#ef4a23]">Financial Intelligence</span>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink">
            Revenue &amp; Analytics Dashboard
          </h1>
          <p className="text-xs text-ink/70 mt-1">
            Real-time daily, monthly, total revenue, and cancellation loss audits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-1 rounded-2xl bg-[#fff0ea]/50 border border-sky-200 flex text-xs font-bold">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'all' ? 'bg-[#ef4a23] text-white shadow-sm' : 'text-ink'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setTimeframe('daily')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'daily' ? 'bg-[#ef4a23] text-white shadow-sm' : 'text-ink'}`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeframe('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'monthly' ? 'bg-[#ef4a23] text-white shadow-sm' : 'text-ink'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeframe('cancelled')}
              className={`px-3 py-1.5 rounded-xl transition-all ${timeframe === 'cancelled' ? 'bg-[#ef4a23] text-white shadow-sm' : 'text-ink'}`}
            >
              Cancellations
            </button>
          </div>

          <a
            href="/api/admin/bookings/export"
            download
            className="px-4 py-2 rounded-2xl text-xs font-bold text-ink bg-[#fff8f5] hover:bg-[#fff0ea]/50 border border-sky-200 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4 text-[#ef4a23]" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* ENTERPRISE REPORTING FILTER TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-slate-300 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Branch Filter Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#ef4a23]" />
              <span>Branch:</span>
            </span>
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#ef4a23] cursor-pointer"
            >
              <option value="all">🏢 All Branches Combined</option>
              <option value="1">📍 Movie Bash - BTM 2nd Stage</option>
              <option value="2">📍 Movie Bash - Electronic City</option>
            </select>
          </div>

          {/* Specific Custom Date Picker */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Specific Date:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={customDate}
                onChange={(e) => {
                  setCustomDate(e.target.value);
                  setQuickDate('custom' as any);
                }}
                className="px-2.5 py-1 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:border-[#ef4a23]"
              />
              {customDate && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomDate('');
                    setQuickDate('all');
                  }}
                  className="w-5 h-5 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 text-slate-700 flex items-center justify-center text-[10px] font-black cursor-pointer"
                  title="Clear custom date"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Date Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200 text-xs">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">Quick Date:</span>
          {[
            { id: 'all', label: 'All Dates' },
            { id: 'today', label: 'Today' },
            { id: 'tomorrow', label: 'Tomorrow' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: '7days', label: 'Last 7 Days' },
            { id: 'month', label: 'This Month' },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setQuickDate(pill.id as any);
                setCustomDate('');
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                quickDate === pill.id && !customDate
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {pill.label}
            </button>
          ))}

          {/* Filter Status Feedback Pill */}
          {(quickDate !== 'all' || customDate || branchFilter !== 'all') && (
            <span className="ml-auto text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <span>Filtered: {filteredDailyTimeline.length} days shown &bull; ₹{dailyTotals.revenue.toLocaleString()}</span>
            </span>
          )}
        </div>
      </div>

      {/* 4 CORE KPI CARDS: Total, Monthly, Daily, Cancelled */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. TOTAL REVENUE */}
        <div className="p-6 rounded-3xl bg-white border-2 border-sky-100 shadow-sm hover:border-royal-500 transition-all">
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
        <div className="p-6 rounded-3xl bg-white border-2 border-sky-100 shadow-sm hover:border-royal-500 transition-all">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>This Month Revenue</span>
            <span className="p-2 rounded-xl bg-royal-50 text-[#ef4a23]">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="font-playfair text-3xl font-black text-ink mt-2">
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
        <div className="p-6 rounded-3xl bg-white border-2 border-sky-100 shadow-sm hover:border-royal-500 transition-all">
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#ef4a23]" />
              <h2 className="font-playfair text-xl font-bold text-ink">
                14-Day Daily Revenue Activity
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Day-by-Day Bookings &amp; Collections
            </span>
          </div>

          <div className="w-full overflow-x-auto lg:overflow-x-hidden rounded-xl border-2 border-slate-300 shadow-xs">
            <table className="w-full text-left border-collapse text-xs border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-[11px] font-black text-slate-800 uppercase tracking-wider">
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Date</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Screenings</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Gross Revenue</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Advance Collected</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Balance at Venue</th>
                  <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Visual Share</th>
                </tr>
              </thead>
              <tbody>
                {filteredDailyTimeline.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-500 border border-slate-300">
                      No revenue activity found for the selected date or branch filter.
                    </td>
                  </tr>
                ) : (
                  filteredDailyTimeline.map((day: any) => {
                    const maxDayRev = Math.max(...filteredDailyTimeline.map((d: any) => d.revenue), 1);
                    const pct = Math.round((day.revenue / maxDayRev) * 100);
                    const isToday = day.date === todayStr;
                    const isTomorrow = day.date === tomorrowStr;
                    return (
                      <tr key={day.date} className={`transition-colors ${isToday ? 'bg-amber-50/80 font-bold' : isTomorrow ? 'bg-sky-50/80 font-bold' : 'even:bg-slate-50/70 hover:bg-emerald-50/50'}`}>
                        <td className="py-2.5 px-3 border border-slate-300 align-middle">
                          <span className="font-extrabold text-slate-900">{day.display_date}</span>
                          {isToday && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-amber-200 text-amber-900 font-black">
                              TODAY
                            </span>
                          )}
                          {isTomorrow && (
                            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-sky-200 text-sky-900 font-black">
                              TOMORROW
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 align-middle">
                          <span className="px-2 py-1 rounded-lg bg-slate-100 font-extrabold text-slate-800 border border-slate-300">
                            {day.count} shows
                          </span>
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 font-black text-slate-900 align-middle">
                          ₹{day.revenue.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-emerald-800 font-extrabold align-middle">
                          ₹{day.advance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 text-amber-900 font-extrabold align-middle">
                          ₹{Math.max(0, day.revenue - day.advance).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 border border-slate-300 min-w-[120px] align-middle">
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${isToday ? 'bg-amber-500' : isTomorrow ? 'bg-sky-500' : 'bg-emerald-600'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredDailyTimeline.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-200/90 font-black text-slate-900 border-t-2 border-slate-400">
                    <td className="py-3 px-3.5 border border-slate-300 uppercase tracking-wider text-xs">
                      Total ({filteredDailyTimeline.length} Days)
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs">
                      <span className="px-2 py-1 rounded-lg bg-white font-black text-slate-900 border border-slate-300">
                        {dailyTotals.count} shows
                      </span>
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-sm font-black text-slate-950">
                      ₹{dailyTotals.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs font-black text-emerald-800">
                      ₹{dailyTotals.advance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs font-black text-amber-900">
                      ₹{dailyTotals.balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs font-bold text-slate-600">
                      100% (Summary)
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* MONTHLY TIMELINE SECTION */}
      {(timeframe === 'all' || timeframe === 'monthly') && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-100 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#ef4a23]" />
              <h2 className="font-playfair text-xl font-bold text-ink">
                Monthly Financial History (Last 6 Months)
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Aggregated Monthly Totals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthly_timeline.map((m: any) => (
              <div key={m.month_key} className="p-5 rounded-2xl bg-[#fffdf9] border border-sky-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-playfair text-lg font-bold text-ink">{m.display_month}</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-[#141110] border border-sky-200">
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
                    <strong className="text-[#ef4a23]">
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
              <h2 className="font-playfair text-xl font-bold text-ink">
                Cancelled Bookings &amp; Refund Ledger ({cancelled_list.length})
              </h2>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              Total Lost Sales: ₹{metrics.cancelled_lost_revenue.toLocaleString()}
            </span>
          </div>

          {filteredCancelledList.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-slate-500">
              No cancelled bookings recorded for the selected filter.
            </div>
          ) : (
            <div className="w-full overflow-x-auto lg:overflow-x-hidden rounded-xl border-2 border-slate-300 shadow-xs">
              <table className="w-full text-left border-collapse text-xs border border-slate-300">
                <thead>
                  <tr className="bg-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-800">
                    <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Ref &amp; Customer</th>
                    <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Screen &amp; Date</th>
                    <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Original Total</th>
                    <th className="py-3 px-3.5 border border-slate-300 whitespace-nowrap">Refund Amount</th>
                    <th className="py-3 px-3.5 border border-slate-300">Reason for Cancellation</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCancelledList.map((c: any) => (
                    <tr key={c.id} className="even:bg-slate-50/70 hover:bg-rose-50/40 transition-colors">
                      <td className="py-2.5 px-3 border border-slate-300 align-middle">
                        <strong className="block text-slate-900 font-black">{c.customer_name}</strong>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#155fbd] font-mono text-[11px] font-bold bg-sky-50 px-1 py-0.5 rounded border border-sky-300">{c.ref}</span>
                          <span className="text-slate-600 text-[11px] font-semibold">&bull; {c.customer_phone}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 align-middle">
                        <span className="block font-black text-slate-900">{c.theatre_name}</span>
                        <span className="text-[11px] text-slate-600 font-medium block mt-0.5">{c.booking_date} &bull; {c.branch_name}</span>
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 font-black text-slate-900 align-middle whitespace-nowrap">
                        ₹{c.total.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 align-middle whitespace-nowrap">
                        <span className="px-2 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 font-extrabold text-[11px]">
                          ₹{c.refund_amount.toLocaleString()} Refunded
                        </span>
                      </td>
                      <td className="py-2.5 px-3 border border-slate-300 max-w-xs align-middle">
                        <span className="text-slate-700 italic block text-xs">
                          &ldquo;{c.cancelled_reason}&rdquo;
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-rose-100/80 font-black text-slate-900 border-t-2 border-rose-300">
                    <td colSpan={2} className="py-3 px-3.5 border border-slate-300 uppercase tracking-wider text-xs font-black text-rose-900">
                      Total ({filteredCancelledList.length} Cancelled Bookings)
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs font-black text-rose-950 whitespace-nowrap">
                      ₹{cancelledTotals.total.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs font-black text-rose-900 whitespace-nowrap">
                      ₹{cancelledTotals.refund_amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-3.5 border border-slate-300 text-xs text-rose-900 font-bold">
                      Net Loss: ₹{Math.max(0, cancelledTotals.total - cancelledTotals.refund_amount).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CHANNEL (SOURCE) & VENUE BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Booking Channel Distribution (Phone Call vs Web vs Walk-in) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-100 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-ink flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-[#ef4a23]" />
            <span>Booking Source Breakdown</span>
          </h3>
          <p className="text-xs text-slate-500">
            Compare revenues generated from direct customer phone calls versus website bookings.
          </p>

          <div className="space-y-3 pt-2">
            {channel_distribution.map((ch: any) => (
              <div key={ch.source_key} className="p-4 rounded-2xl bg-[#fffdf9] border border-sky-100 flex items-center justify-between">
                <div>
                  <strong className="block text-sm text-ink">{ch.name}</strong>
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
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-sky-100 shadow-sm space-y-4">
          <h3 className="font-playfair text-xl font-bold text-ink flex items-center gap-2">
            <Building className="w-5 h-5 text-[#ef4a23]" />
            <span>Branch Performance Comparison</span>
          </h3>
          <p className="text-xs text-slate-500">
            Total sales and today&apos;s daily activity across Electronic City and BTM 2nd Stage.
          </p>

          <div className="space-y-3 pt-2">
            {branch_distribution.map((b: any) => (
              <div key={b.id} className="p-4 rounded-2xl bg-[#fffdf9] border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-base text-ink">{b.name}</strong>
                  <span className="font-playfair text-xl font-black text-emerald-700">
                    ₹{b.revenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1 border-t border-sky-100">
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
