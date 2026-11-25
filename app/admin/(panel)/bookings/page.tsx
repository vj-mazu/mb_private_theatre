'use client';

import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, PlusCircle, Search, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Button, Input, Select, Empty, api, cn } from '@/components/ui';
import { SOURCES, STATUS_META, addDays, formatDate, inr, todayIST } from '@/lib/booking-rules';

export default function BookingsPage() {
  return <Suspense><Bookings /></Suspense>;
}

function Bookings() {
  const router = useRouter();
  const sp = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [search, setSearch] = useState(sp.get('q') || '');

  const when = sp.get('when') || 'upcoming';
  const params = useMemo(() => {
    const p = new URLSearchParams();
    const today = todayIST();
    if (when === 'today') { p.set('from', today); p.set('to', today); }
    if (when === 'tomorrow') { p.set('from', addDays(today, 1)); p.set('to', addDays(today, 1)); }
    if (when === 'upcoming') p.set('from', today);
    if (when === 'past') p.set('to', addDays(today, -1));
    if (when === 'range') { if (sp.get('from')) p.set('from', sp.get('from')!); if (sp.get('to')) p.set('to', sp.get('to')!); }
    for (const k of ['q', 'status', 'branch', 'source', 'page', 'deleted']) if (sp.get(k)) p.set(k, sp.get(k)!);
    return p;
  }, [sp, when]);

  useEffect(() => {
    setData(null);
    api(`/api/admin/bookings?${params}`).then(setData).catch((e) => setData({ error: e.message }));
  }, [params]);
  useEffect(() => { api('/api/admin/crud/branches').then(setBranches).catch(() => {}); }, []);

  function setParam(k: string, v: string) {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    if (k !== 'page') next.delete('page');
    router.replace(`/admin/bookings?${next}`, { scroll: false });
  }

  useEffect(() => {
    const q = sp.get('q') || '';
    setSearch((cur) => (cur === q ? cur : q));
  }, [sp]);

  useEffect(() => {
    const t = setTimeout(() => { if (search !== (sp.get('q') || '')) setParam('q', search); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const pages = data?.total ? Math.ceil(data.total / data.per) : 1;
  const page = Number(sp.get('page') || 1);
  const whenTabs = [['today', 'Today'], ['tomorrow', 'Tomorrow'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All'], ['range', 'Dates']];

  return (
    <>
      <PageHeader title="Bookings" subtitle={data?.total != null ? `${data.total} booking${data.total === 1 ? '' : 's'}${data.sums ? ` · ${inr(data.sums.total)} booked · ${inr(data.sums.paid)} collected` : ''}` : ' '}
        actions={<>
          <a href={`/api/admin/bookings/export?${params}`}><Button variant="secondary"><Download className="h-4 w-4" />Export Excel</Button></a>
          <Link href="/admin/bookings/new"><Button><PlusCircle className="h-4 w-4" />New booking</Button></Link>
        </>} />

      <div className="card mb-4 space-y-3 p-3">
        <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
          {whenTabs.map(([k, label]) => (
            <button key={k} onClick={() => setParam('when', k)}
              className={cn('whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-200',
                when === k ? 'bg-navy text-cream' : 'text-navy-soft hover:bg-cream-deep')}>{label}</button>
          ))}
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-faint" />
            <Input className="pl-9" placeholder="Search name, phone or booking ID" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={sp.get('status') || ''} onChange={(e) => setParam('status', e.target.value)}>
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </Select>
          {!data?.branchScoped && (
            <Select value={sp.get('branch') || ''} onChange={(e) => setParam('branch', e.target.value)}>
              <option value="">All branches</option>
              {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </Select>
          )}
          <Select value={sp.get('source') || ''} onChange={(e) => setParam('source', e.target.value)}>
            <option value="">All sources</option>
            {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        {when === 'range' && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Input type="date" className="w-auto" value={sp.get('from') || ''} onChange={(e) => setParam('from', e.target.value)} />
            <span className="text-navy-soft">to</span>
            <Input type="date" className="w-auto" value={sp.get('to') || ''} onChange={(e) => setParam('to', e.target.value)} />
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="sticky top-0 bg-cream-deep/70 text-xs font-semibold text-navy-soft">
              <tr>
                {['Date & time', 'Booking ID', 'Booked by', 'Special person', 'Theatre', 'Package', 'Total', 'Paid', 'Balance', 'Status', 'Source'].map((h, i) => (
                  <th key={h} className={cn('whitespace-nowrap px-3 py-2.5', i >= 6 && i <= 8 && 'text-right')}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!data && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={11} className="px-3 py-3"><div className="skeleton h-5" /></td></tr>
              ))}
              {data?.rows?.map((b: any) => (
                <tr key={b.id} onClick={() => router.push(`/admin/bookings/${b.id}`)} className="cursor-pointer bg-white transition-colors hover:bg-brand-50/60">
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p className="font-medium">{formatDate(b.booking_date, { day: 'numeric', month: 'short', weekday: 'short' })}</p>
                    <p className="text-xs text-navy-soft">{b.slot_label}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">{b.ref}</td>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[160px] truncate font-medium">{b.customer_name}</p>
                    <p className="text-xs text-navy-soft">{b.phone}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="max-w-[140px] truncate">{b.special_person_name || '—'}</p>
                    <p className="text-xs text-navy-soft">{b.occasion}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="whitespace-nowrap">{b.theatre_name}</p>
                    <p className="whitespace-nowrap text-xs text-navy-soft">{b.branch_name}</p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">{b.package_name}<span className="text-xs text-navy-soft"> · {b.guests}p</span></td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{inr(b.total)}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums">{inr(b.amount_paid)}</td>
                  <td className={cn('whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums', b.total - b.amount_paid > 0 && b.status !== 'cancelled' ? 'text-amber-700' : 'text-navy-soft')}>
                    {inr(b.total - b.amount_paid)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5"><StatusBadge status={b.status} />{b.payment_screenshot && b.status === 'payment_review' && <ImageIcon className="h-3.5 w-3.5 text-brand-600" />}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 capitalize text-navy-soft">{SOURCES.find((s) => s.value === b.source)?.label || b.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.rows?.length === 0 && <div className="p-6"><Empty title="No bookings found">Try a different date range or filter.</Empty></div>}
        {data?.error && <p className="p-6 text-sm text-red-600">{data.error}</p>}
        {data?.total > 0 && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-navy-soft">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setParam('page', String(page - 1))}><ChevronLeft className="h-4 w-4" />Prev</Button>
              <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setParam('page', String(page + 1))}>Next<ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
      {data?.role === 'admin' && (
        <div className="mt-3 text-right">
          <button onClick={() => setParam('deleted', sp.get('deleted') ? '' : '1')} className="text-xs text-navy-faint hover:text-navy">
            {sp.get('deleted') ? '← Back to active bookings' : 'Show deleted bookings'}
          </button>
        </div>
      )}
    </>
  );
}
