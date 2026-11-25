'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import {
  Pencil, CalendarClock, Wallet, Lock, XCircle, MessageCircle, Trash2, RotateCcw, ShieldCheck, ExternalLink, Printer,
} from 'lucide-react';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { CloseBookingModal } from '@/components/admin/CloseBookingModal';
import { Badge, Button, Field, Input, Modal, Select, Textarea, api, cn, useConfirm, useToast } from '@/components/ui';
import { PAYMENT_METHODS, SOURCES, chargedQty, formatDate, inr } from '@/lib/booking-rules';

export default function BookingDetail({ params }: { params: { id: string } }) {
  const toast = useToast();
  const ask = useConfirm();
  const [d, setD] = useState<any>(null);
  const [error, setError] = useState('');
  const [modal, setModal] = useState<'' | 'payment' | 'cancel' | 'close' | 'whatsapp' | 'shot'>('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api(`/api/admin/bookings/${params.id}`).then(setD).catch((e) => setError(e.message)), [params.id]);
  useEffect(() => { load(); }, [load]);

  async function act(body: Record<string, unknown>, msg: string) {
    setBusy(true);
    try {
      const r = await api(`/api/admin/bookings/${params.id}`, { method: 'POST', json: body });
      toast(r?.whatsapp === 'not_configured' ? `${msg} (WhatsApp API not configured)` : msg);
      setModal('');
      await load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!d) return <div className="space-y-4"><div className="skeleton h-20" /><div className="skeleton h-80" /></div>;

  const b = d.booking;
  const balance = b.total - b.amount_paid;
  const open = ['awaiting_payment', 'payment_review', 'confirmed'].includes(b.status);

  return (
    <>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-bold tracking-tight">{b.ref}</h1>
            <StatusBadge status={b.status} />
            {b.is_deleted && <Badge tone="red">Deleted</Badge>}
          </div>
          <p className="mt-1 text-sm text-navy-soft">
            {formatDate(b.booking_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · {b.slot_label} · {b.theatre_name}, {b.branch_name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {b.status === 'payment_review' && <Button onClick={() => setModal('shot')}><ShieldCheck className="h-4 w-4" />Verify payment</Button>}
          {b.status === 'awaiting_payment' && <Button onClick={() => act({ action: 'confirm' }, 'Booking confirmed')} loading={busy}><ShieldCheck className="h-4 w-4" />Advance received</Button>}
          {open && <Link href={`/admin/bookings/${b.id}/edit`}><Button variant="secondary"><Pencil className="h-4 w-4" />Edit</Button></Link>}
          {open && <Link href={`/admin/bookings/${b.id}/edit`}><Button variant="secondary"><CalendarClock className="h-4 w-4" />Reschedule</Button></Link>}
          {b.status === 'confirmed' && <Button variant="secondary" onClick={() => setModal('payment')}><Wallet className="h-4 w-4" />Add payment</Button>}
          {b.status === 'confirmed' && <Button variant="dark" onClick={() => setModal('close')}><Lock className="h-4 w-4" />Complete booking</Button>}
          {b.status === 'completed' && <Button variant="secondary" onClick={() => act({ action: 'reopen' }, 'Booking reopened')}><RotateCcw className="h-4 w-4" />Reopen</Button>}
          <Button variant="secondary" onClick={() => setModal('whatsapp')}><MessageCircle className="h-4 w-4" />WhatsApp</Button>
          <a href={`/ticket/${b.ref}`} target="_blank" rel="noreferrer"><Button variant="secondary"><Printer className="h-4 w-4" />Ticket</Button></a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card p-5">
            <h2 className="mb-4 font-sans text-sm font-bold">Guest & celebration</h2>
            <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
              <Item label="Special person" value={b.special_person_name || '—'} />
              <Item label="Occasion" value={b.occasion || '—'} />
              <Item label="Booked by" value={b.customer_name} />
              <Item label="Phone / WhatsApp" value={`${b.phone}${b.whatsapp && b.whatsapp !== b.phone ? ` · ${b.whatsapp}` : ''}`} />
              <Item label="Package" value={`${b.package_name} · ${b.guests} guests`} />
              {(b.package_includes || []).length > 0 && <Item label={`Included in ${b.package_name}`} value={b.package_includes.join(' · ')} wide />}
              <Item label="Cake" value={b.cake_name || '—'} />
              <Item label="Booking via" value={SOURCES.find((s) => s.value === b.source)?.label || b.source} />
              <Item label="Created" value={`${new Date(b.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} · ${b.created_by}`} />
              {b.notes && <Item label="Notes" value={b.notes} wide />}
              {b.cancel_reason && <Item label="Cancel reason" value={b.cancel_reason} wide />}
            </dl>
          </section>

          <section className="card overflow-hidden">
            <h2 className="px-5 pt-5 font-sans text-sm font-bold">Bill</h2>
            <table className="mt-3 w-full text-sm">
              <tbody className="divide-y divide-line">
                <BillRow label={`${b.package_name === 'Custom' ? 'Custom (room only)' : `${b.package_name} package`}`} value={b.base_amount} />
                {b.extra_persons > 0 && <BillRow label={`Extra persons × ${b.extra_persons}`} value={b.extra_person_amount} />}
                {b.extra_hours > 0 && <BillRow label={`Extra hours × ${b.extra_hours}`} value={b.extra_hour_amount} />}
                {b.cake_name && <BillRow label={`Cake · ${b.cake_name}`} value={b.cake_amount} zeroLabel="Included" />}
                {(b.items || []).map((it: any, i: number) => <BillRow key={i} label={`${it.name}${it.qty > 1 ? ` × ${it.qty}` : ''}${it.kind === 'custom' ? ' (custom)' : ' (extra)'}`} value={it.price * chargedQty(it)} zeroLabel="Included" />)}
                {b.discount > 0 && <BillRow label={`Discount${b.coupon_code ? ` (${b.coupon_code})` : ''}`} value={-b.discount} />}
              </tbody>
              <tfoot className="bg-cream">
                <BillRow label="Total" value={b.total} strong />
                <BillRow label="Paid" value={b.amount_paid} />
                <BillRow label="Balance" value={balance} strong />
              </tfoot>
            </table>
          </section>
        </div>

        <div className="space-y-6">
          {b.payment_screenshot && (
            <section className="card p-5">
              <h2 className="mb-3 font-sans text-sm font-bold">Payment screenshot</h2>
              <button onClick={() => setModal('shot')} className="block w-full overflow-hidden rounded-xl border border-line">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.payment_screenshot} alt="Payment screenshot" className="max-h-72 w-full object-contain transition hover:opacity-90" />
              </button>
            </section>
          )}

          <section className="card p-5">
            <h2 className="mb-3 font-sans text-sm font-bold">Payments</h2>
            {d.payments.length === 0 && <p className="text-sm text-navy-soft">No payments recorded yet.</p>}
            <ul className="space-y-2">
              {d.payments.map((p: any) => (
                <li key={p.id} className="flex justify-between text-sm">
                  <span><span className="font-medium">{inr(p.amount)}</span> <span className="text-navy-soft">· {PAYMENT_METHODS.find((m) => m.value === p.method)?.label || p.method}{p.note ? ` · ${p.note}` : ''}</span></span>
                  <span className="text-xs text-navy-faint">{new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-5">
            <h2 className="mb-3 font-sans text-sm font-bold">History</h2>
            <ol className="space-y-3 border-l border-line pl-4">
              {d.events.map((e: any) => (
                <li key={e.id} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-400" />
                  <p className="font-medium capitalize">{e.action.replace(/_/g, ' ').replace('status ', '')}</p>
                  <p className="text-xs text-navy-soft">{e.actor} · {new Date(e.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</p>
                  {e.details?.from && <p className="text-xs text-navy-soft">{e.details.from} → {e.details.to}</p>}
                </li>
              ))}
            </ol>
          </section>

          <div className="flex flex-wrap gap-2">
            {open && <Button variant="ghost" size="sm" onClick={() => setModal('cancel')}><XCircle className="h-4 w-4" />Cancel booking</Button>}
            {d.role === 'admin' && (!b.is_deleted
              ? <Button variant="ghost" size="sm" className="text-red-600" onClick={async () => (await ask({ title: 'Delete booking?', message: 'The slot is freed. You can restore it later from "Show deleted bookings".', confirmLabel: 'Delete', danger: true })) && act({ action: 'delete' }, 'Booking deleted')}><Trash2 className="h-4 w-4" />Delete</Button>
              : <Button variant="ghost" size="sm" onClick={() => act({ action: 'restore' }, 'Booking restored')}><RotateCcw className="h-4 w-4" />Restore</Button>)}
          </div>
        </div>
      </div>

      <PaymentModal open={modal === 'payment'} onClose={() => setModal('')} balance={balance} busy={busy}
        onSubmit={(p) => act({ action: 'payment', ...p }, 'Payment recorded')} />
      <CancelModal open={modal === 'cancel'} onClose={() => setModal('')} busy={busy} onSubmit={(reason) => act({ action: 'cancel', reason }, 'Booking cancelled')} />
      <CloseBookingModal open={modal === 'close'} onClose={() => setModal('')} booking={b} input={d.input} onDone={() => { setModal(''); toast('Booking completed'); load(); }} />
      <WhatsAppModal open={modal === 'whatsapp'} onClose={() => setModal('')} busy={busy} messages={d.messages} waLink={d.waLink}
        onSend={(kind, text) => act({ action: 'whatsapp', kind, text }, 'WhatsApp message sent')} />

      <Modal open={modal === 'shot'} onClose={() => setModal('')} title="Verify advance payment" size="lg"
        footer={b.status === 'payment_review' ? <>
          <Button variant="secondary" onClick={() => setModal('cancel')}>Reject</Button>
          <Button onClick={() => act({ action: 'confirm' }, 'Payment verified — booking confirmed')} loading={busy}>Payment received · Confirm</Button>
        </> : undefined}>
        {b.payment_screenshot ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.payment_screenshot} alt="Payment screenshot" className="mx-auto max-h-[65vh] rounded-xl" />
            <a href={b.payment_screenshot} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-brand-700"><ExternalLink className="h-3 w-3" />Open full size</a>
          </>
        ) : <p className="text-sm text-navy-soft">No screenshot uploaded.</p>}
      </Modal>
    </>
  );
}

function Item({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
      <dt className="text-xs text-navy-soft">{label}</dt>
      <dd className="mt-0.5 whitespace-pre-line font-medium">{value}</dd>
    </div>
  );
}

function BillRow({ label, value, strong, zeroLabel }: { label: string; value: number; strong?: boolean; zeroLabel?: string }) {
  return (
    <tr className={cn(strong && 'font-bold')}>
      <td className="px-5 py-2.5">{label}</td>
      <td className="px-5 py-2.5 text-right tabular-nums">{value === 0 && zeroLabel ? zeroLabel : value < 0 ? `− ${inr(-value)}` : inr(value)}</td>
    </tr>
  );
}

function PaymentModal({ open, onClose, balance, busy, onSubmit }: { open: boolean; onClose: () => void; balance: number; busy: boolean; onSubmit: (p: { amount: number; method: string; note: string }) => void }) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('cash');
  const [note, setNote] = useState('');
  useEffect(() => { if (open) { setAmount(String(Math.max(0, balance))); setNote(''); } }, [open, balance]);
  return (
    <Modal open={open} onClose={onClose} title="Add payment" size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={() => onSubmit({ amount: Number(amount), method, note })}>Save payment</Button></>}>
      <div className="space-y-4">
        <Field label="Amount (₹)" hint={`Balance ${inr(balance)}`}><Input inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="Payment type"><Select value={method} onChange={(e) => setMethod(e.target.value)}>{PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}</Select></Field>
        <Field label="Note"><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></Field>
      </div>
    </Modal>
  );
}

function CancelModal({ open, onClose, busy, onSubmit }: { open: boolean; onClose: () => void; busy: boolean; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  useEffect(() => { if (open) setReason(''); }, [open]);
  return (
    <Modal open={open} onClose={onClose} title="Cancel booking" size="sm"
      footer={<><Button variant="secondary" onClick={onClose}>Keep booking</Button><Button variant="danger" loading={busy} onClick={() => onSubmit(reason)}>Cancel booking</Button></>}>
      <Field label="Reason" hint="The slot becomes free again and the guest is informed on WhatsApp.">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
      </Field>
    </Modal>
  );
}

function WhatsAppModal({ open, onClose, busy, messages, waLink, onSend }: {
  open: boolean; onClose: () => void; busy: boolean; messages: any[]; waLink: string; onSend: (kind: string, text?: string) => void;
}) {
  const [text, setText] = useState('');
  return (
    <Modal open={open} onClose={onClose} title="WhatsApp" size="md">
      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="secondary" loading={busy} onClick={() => onSend('confirmation')}>Send confirmation</Button>
        <Button variant="secondary" loading={busy} onClick={() => onSend('reminder')}>Send reminder</Button>
        <a href={waLink} target="_blank" rel="noreferrer"><Button variant="secondary" className="w-full"><ExternalLink className="h-4 w-4" />Open chat</Button></a>
      </div>
      <div className="mt-4 space-y-2">
        <Field label="Custom message"><Textarea value={text} onChange={(e) => setText(e.target.value)} /></Field>
        <Button disabled={!text.trim()} loading={busy} onClick={() => { onSend('custom', text); setText(''); }}>Send message</Button>
      </div>
      <h3 className="mt-6 text-xs font-semibold text-navy-soft">Sent messages</h3>
      <ul className="mt-2 divide-y divide-line text-sm">
        {messages.length === 0 && <li className="py-2 text-navy-soft">None yet</li>}
        {messages.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 py-2">
            <span className="capitalize">{m.kind.replace('_', ' ')}</span>
            <span className="flex items-center gap-2">
              <Badge tone={m.status === 'sent' ? 'green' : m.status === 'failed' ? 'red' : 'amber'}>{m.status.replace('_', ' ')}</Badge>
              <span className="text-xs text-navy-faint">{new Date(m.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })}</span>
            </span>
          </li>
        ))}
      </ul>
    </Modal>
  );
}
