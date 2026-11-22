'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { CalendarDays, ShieldCheck, Wallet, Clock, PlusCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button, Empty, api } from '@/components/ui';
import { formatDate, inr } from '@/lib/booking-rules';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => { api('/api/admin/stats').then(setData).catch(() => setData({ error: true })); }, []);

  const c = data?.counts;
  const cards = [
    { label: "Today's bookings", value: c?.today, icon: CalendarDays, href: '/admin/bookings?when=today' },
    { label: 'Payments to verify', value: c?.to_verify, icon: ShieldCheck, href: '/admin/bookings?status=payment_review', alert: c?.to_verify > 0 },
    { label: 'Upcoming confirmed', value: c?.upcoming, icon: Clock, href: '/admin/bookings?when=upcoming' },
    { label: 'Pending balance', value: c ? inr(c.pending_balance) : undefined, icon: Wallet, href: '/admin/bookings?status=confirmed' },
  ].filter((card) => !(data?.role === 'staff' && card.label === 'Pending balance'));
  const max = Math.max(1, ...(data?.daily || []).map((d: any) => d.revenue));

  return (
    <>
      <PageHeader title="Dashboard" subtitle={data?.date ? formatDate(data.date, { weekday: 'long', day: 'numeric', month: 'long' }) : ' '}
        actions={<Link href="/admin/bookings/new"><Button><PlusCircle className="h-4 w-4" />New booking</Button></Link>} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, href, alert }, i) => (
          <Link key={label} href={href} style={{ animationDelay: `${i * 60}ms` }}
            className="card group animate-fade-up p-4 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-navy-soft">{label}</span>
              <Icon className={`h-4 w-4 ${alert ? 'text-amber-600' : 'text-brand-500'}`} />
            </div>
            <p className="mt-2 text-2xl font-bold tabular-nums">{value ?? <span className="skeleton inline-block h-7 w-12" />}</p>
          </Link>
        ))}
      </div>

      {(data?.verify?.length > 0 || data?.enquiries?.length > 0) && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {data.verify.length > 0 && (
            <section className="card border-amber-200 bg-amber-50/50 p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-sm font-bold">Verify payment screenshots</h2>
                <Link href="/admin/bookings?status=payment_review" className="text-xs font-semibold text-brand-700 hover:underline">View all</Link>
              </div>
              <ul className="mt-3 space-y-2">
                {data.verify.map((b: any) => (
                  <li key={b.id}>
                    <Link href={`/admin/bookings/${b.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-4 py-2.5 transition hover:border-amber-400">
                      <span className="min-w-0"><span className="block truncate text-sm font-semibold">{b.customer_name}</span><span className="block truncate text-xs text-navy-soft">{formatDate(b.booking_date, { day: 'numeric', month: 'short' })} · {b.slot_label} · {b.theatre_name}</span></span>
                      <span className="shrink-0 text-xs font-semibold text-amber-700">Verify →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.enquiries.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-sans text-sm font-bold">New enquiries</h2>
                <Link href="/admin/enquiries" className="text-xs font-semibold text-brand-700 hover:underline">View all</Link>
              </div>
              <ul className="mt-3 space-y-2">
                {data.enquiries.map((e: any) => (
                  <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-2.5">
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold">{e.name} · {e.phone}</span><span className="block truncate text-xs text-navy-soft">{e.occasion || 'Enquiry'}{e.preferred_date ? ` · ${formatDate(e.preferred_date, { day: 'numeric', month: 'short' })}` : ''}</span></span>
                    <a href={`https://wa.me/91${e.phone}`} target="_blank" rel="noreferrer" className="shrink-0 text-xs font-semibold text-emerald-700 hover:underline">WhatsApp</a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <section className={`card p-5 ${data?.role === 'staff' ? 'lg:col-span-5' : 'lg:col-span-3'}`}>
          <h2 className="font-sans text-sm font-bold">Today&apos;s schedule</h2>
          <div className="mt-4 space-y-2">
            {!data && [0, 1, 2].map((i) => <div key={i} className="skeleton h-14" />)}
            {data?.today?.length === 0 && <Empty title="No bookings today" />}
            {data?.today?.map((b: any) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 transition hover:border-brand-300">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{b.slot_label} · {b.theatre_name}</p>
                  <p className="truncate text-xs text-navy-soft">{b.customer_name} · {b.phone} · {b.branch_name}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusBadge status={b.status} />
                  <span className="text-xs tabular-nums text-navy-soft">Bal {inr(b.total - b.amount_paid)}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {data?.role !== 'staff' && (
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-sans text-sm font-bold">This month</h2>
            <span className="text-xs text-navy-soft">Collected {c ? inr(c.month_collected) : '—'}</span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums">{c ? inr(c.month_revenue) : '—'}</p>
          <p className="text-xs text-navy-soft">Booked value</p>
          <div className="mt-6 flex h-32 items-end gap-1.5" aria-label="Revenue, last 14 days">
            {(data?.daily || []).map((d: any) => (
              <div key={d.date} className="group relative flex-1">
                <div className="rounded-t-md bg-brand-300 transition-all duration-500 ease-smooth group-hover:bg-brand-500" style={{ height: `${Math.max(4, (d.revenue / max) * 128)}px` }} />
                <span className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[10px] text-cream group-hover:block">
                  {formatDate(d.date, { day: 'numeric', month: 'short' })} · {inr(d.revenue)} · {d.bookings}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-navy-faint">Last 14 days (days with bookings)</p>
        </section>
        )}
      </div>
      {data?.upcoming?.length > 0 && (
        <section className="card mt-6 p-5">
          <h2 className="font-sans text-sm font-bold">Coming up</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {data.upcoming.map((b: any) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="rounded-xl border border-line bg-white px-4 py-3 transition hover:border-brand-300">
                <p className="text-xs font-semibold text-brand-700">{formatDate(b.booking_date, { weekday: 'short', day: 'numeric', month: 'short' })} · {b.slot_label}</p>
                <p className="mt-0.5 truncate text-sm font-semibold">{b.customer_name}</p>
                <p className="truncate text-xs text-navy-soft">{b.theatre_name} · balance {inr(b.total - b.amount_paid)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
