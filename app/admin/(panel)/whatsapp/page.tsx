'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { Badge, Button, Empty, Select, api } from '@/components/ui';

export default function WhatsAppLog() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [data, setData] = useState<any>(null);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    setData(null);
    api(`/api/admin/whatsapp?page=${page}${status ? `&status=${status}` : ''}`).then(setData).catch(() => {});
  }, [page, status]);
  const pages = data ? Math.max(1, Math.ceil(data.total / data.per)) : 1;

  return (
    <>
      <PageHeader title="WhatsApp log" subtitle="Every automatic and manual message sent through the WhatsApp Cloud API"
        actions={<Select className="w-44" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All</option><option value="sent">Sent</option><option value="failed">Failed</option><option value="not_configured">Not configured</option>
        </Select>} />

      {data && !data.configured && (
        <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          WhatsApp API is not connected yet. Add <code>WHATSAPP_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> to the server environment. Messages are still logged here.
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-cream-deep/70 text-xs font-semibold text-navy-soft">
              <tr>{['Time', 'To', 'Booking', 'Type', 'Status', 'Details'].map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {!data && <tr><td colSpan={6} className="p-3"><div className="skeleton h-5" /></td></tr>}
              {data?.rows.map((m: any) => (
                <tr key={m.id} className="align-top">
                  <td className="whitespace-nowrap px-3 py-2.5 text-navy-soft">{new Date(m.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">+{m.to_phone}</td>
                  <td className="whitespace-nowrap px-3 py-2.5">{m.booking_id ? <Link className="text-brand-700 hover:underline" href={`/admin/bookings/${m.booking_id}`}>{m.ref}</Link> : '—'}<p className="text-xs text-navy-soft">{m.customer_name}</p></td>
                  <td className="px-3 py-2.5 capitalize">{m.kind.replace('_', ' ')}</td>
                  <td className="px-3 py-2.5"><Badge tone={m.status === 'sent' ? 'green' : m.status === 'failed' ? 'red' : 'amber'}>{m.status.replace('_', ' ')}</Badge></td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setOpen(open === m.id ? null : m.id)} className="text-xs text-brand-700 hover:underline">{open === m.id ? 'Hide' : 'View message'}</button>
                    {open === m.id && <pre className="mt-2 max-w-md whitespace-pre-wrap rounded-lg bg-cream p-2 font-sans text-xs">{m.body}{m.error && `\n\nError: ${m.error}`}</pre>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data?.rows.length === 0 && <div className="p-6"><Empty title="No messages yet" /></div>}
        {data?.total > data?.per && (
          <div className="flex items-center justify-between border-t border-line px-4 py-3 text-sm">
            <span className="text-navy-soft">Page {page} of {pages}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button>
              <Button size="sm" variant="secondary" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
