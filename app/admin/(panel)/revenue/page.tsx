'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/AdminShell';
import { Button, Empty, Input, Select, api, cn } from '@/components/ui';
import { PAYMENT_METHODS, SOURCES, addDays, formatDate, inr, todayIST } from '@/lib/booking-rules';

function presets() {
  const t = todayIST();
  const y = Number(t.slice(0, 4));
  const monthStart = `${t.slice(0, 7)}-01`;
  const lastMonthEnd = addDays(monthStart, -1);
  return {
    'This month': [monthStart, t],
    'Last month': [`${lastMonthEnd.slice(0, 7)}-01`, lastMonthEnd],
    'Last 7 days': [addDays(t, -6), t],
    'Last 30 days': [addDays(t, -29), t],
    'This year': [`${y}-01-01`, t],
    'Upcoming': [t, addDays(t, 90)],
  } as Record<string, [string, string]>;
}

export default function RevenuePage() {
  const ranges = useMemo(presets, []);
  const [preset, setPreset] = useState('This month');
  const [[from, to], setRange] = useState(ranges['This month']);
  const [branch, setBranch] = useState('');
  const [branches, setBranches] = useState<any[]>([]);
  const [d, setD] = useState<any>(null);

  useEffect(() => { api('/api/admin/crud/branches').then(setBranches).catch(() => {}); }, []);
  useEffect(() => {
    setD(null);
    api(`/api/admin/revenue?from=${from}&to=${to}${branch ? `&branch=${branch}` : ''}`).then(setD).catch((e) => setD({ error: e.message }));
  }, [from, to, branch]);

  const t = d?.totals;
  const max = Math.max(1, ...(d?.daily || []).map((x: any) => x.revenue));
  const kpis = [
    ['Bookings', t?.bookings, `${t?.closed ?? 0} completed`],
    ['Booked revenue', t && inr(t.revenue), 'Total bill value'],
    ['Collected', t && inr(t.collected), t ? `${t.revenue ? Math.round((t.collected / t.revenue) * 100) : 0}% of revenue` : ''],
    ['Pending', t && inr(t.revenue - t.collected), 'Balance not yet paid'],
    ['Add-ons & cakes', t && inr(t.addons), 'Extra sales'],
    ['Discounts given', t && inr(t.discounts), 'Coupons + manual'],
  ];

  return (
    <>
      <PageHeader title="Revenue" subtitle={`${formatDate(from, { day: 'numeric', month: 'short', year: 'numeric' })} – ${formatDate(to, { day: 'numeric', month: 'short', year: 'numeric' })}`}
        actions={<a href={`/api/admin/bookings/export?from=${from}&to=${to}${branch ? `&branch=${branch}` : ''}`}><Button variant="secondary"><Download className="h-4 w-4" />Export Excel</Button></a>} />

      <div className="card mb-6 flex flex-wrap items-center gap-2 p-3">
        {Object.keys(ranges).map((k) => (
          <button key={k} onClick={() => { setPreset(k); setRange(ranges[k]); }}
            className={cn('rounded-lg px-3 py-1.5 text-sm font-medium transition-colors', preset === k ? 'bg-navy text-cream' : 'text-navy-soft hover:bg-cream-deep')}>{k}</button>
        ))}
        <div className="flex items-center gap-2">
          <Input type="date" className="h-9 w-auto" value={from} onChange={(e) => { setPreset(''); setRange([e.target.value, to]); }} />
          <span className="text-sm text-navy-soft">to</span>
          <Input type="date" className="h-9 w-auto" value={to} onChange={(e) => { setPreset(''); setRange([from, e.target.value]); }} />
        </div>
        <Select className="h-9 w-auto sm:ml-auto" value={branch} onChange={(e) => setBranch(e.target.value)}>
          <option value="">All branches</option>
          {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </Select>
      </div>

      {d?.error && <p className="text-sm text-red-600">{d.error}</p>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        {kpis.map(([label, value, hint], i) => (
          <motion.div key={label as string} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="card p-4">
            <p className="text-xs text-navy-soft">{label}</p>
            <p className="mt-1.5 text-xl font-bold tabular-nums">{value ?? <span className="skeleton inline-block h-6 w-16" />}</p>
            <p className="mt-0.5 text-[11px] text-navy-faint">{hint}</p>
          </motion.div>
        ))}
      </div>

      <section className="card mt-6 p-5">
        <h2 className="font-sans text-sm font-bold">Daily revenue</h2>
        {d?.daily?.length === 0 && <div className="mt-4"><Empty title="No bookings in this period" /></div>}
        <div className="mt-6 flex h-44 items-end gap-1 overflow-x-auto">
          {(d?.daily || []).map((x: any) => (
            <div key={x.date} className="group relative flex min-w-[14px] flex-1 flex-col items-center justify-end">
              <motion.div initial={{ height: 0 }} animate={{ height: Math.max(4, (x.revenue / max) * 168) }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full rounded-t-md bg-brand-300 group-hover:bg-brand-500" />
              <span className="pointer-events-none absolute -top-9 z-10 hidden whitespace-nowrap rounded-md bg-navy px-2 py-1 text-[10px] text-cream group-hover:block">
                {formatDate(x.date, { day: 'numeric', month: 'short' })} · {inr(x.revenue)} · {x.bookings} bkg
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Breakdown title="By branch" rows={d?.byBranch} />
        <Breakdown title="By theatre" rows={d?.byTheatre} />
        <Breakdown title="By package" rows={d?.byPackage} />
        <Breakdown title="By booking source" rows={d?.bySource?.map((r: any) => ({ ...r, label: SOURCES.find((s) => s.value === r.label)?.label || r.label }))} />
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-sans text-sm font-bold">Payments received by method</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {(d?.methods || []).map((m: any) => (
              <div key={m.label} className="rounded-xl bg-cream p-3">
                <p className="text-xs text-navy-soft">{PAYMENT_METHODS.find((p) => p.value === m.label)?.label || m.label}</p>
                <p className="text-lg font-bold tabular-nums">{inr(m.amount)}</p>
                <p className="text-[11px] text-navy-faint">{m.payments} payments</p>
              </div>
            ))}
            {d?.methods?.length === 0 && <p className="text-sm text-navy-soft">No payments recorded.</p>}
          </div>
        </section>
      </div>
    </>
  );
}

function Breakdown({ title, rows }: { title: string; rows?: any[] }) {
  const max = Math.max(1, ...(rows || []).map((r) => r.revenue));
  return (
    <section className="card p-5">
      <h2 className="font-sans text-sm font-bold">{title}</h2>
      {!rows && <div className="skeleton mt-4 h-24" />}
      {rows?.length === 0 && <p className="mt-3 text-sm text-navy-soft">No data.</p>}
      <ul className="mt-4 space-y-3">
        {rows?.map((r) => (
          <li key={r.label}>
            <div className="flex justify-between gap-3 text-sm">
              <span className="truncate font-medium">{r.label}</span>
              <span className="shrink-0 tabular-nums">{inr(r.revenue)} <span className="text-xs text-navy-faint">· {r.bookings}</span></span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream-deep">
              <motion.div className="h-full rounded-full bg-brand-400" initial={{ width: 0 }} animate={{ width: `${(r.revenue / max) * 100}%` }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
