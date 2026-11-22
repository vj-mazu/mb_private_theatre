'use client';

import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, Check, Upload, MapPin, Phone, Printer, Share2, Clock, ShieldCheck, PartyPopper, Loader2 } from 'lucide-react';
import { Button, cn, resizeImage } from '@/components/ui';
import { Logo } from '@/components/site/Logo';
import { formatDate, inr } from '@/lib/booking-rules';
import type { Ticket } from '@/lib/server/ticket';

export function TicketView({ initial, payment, whatsapp, notes = [] }: { initial: Ticket; payment: { upi_id: string; payee_name: string; advance_amount: number }; whatsapp: string; notes?: string[] }) {
  const [t, setT] = useState(initial);

  // Keep the status fresh while we wait for verification.
  useEffect(() => {
    if (!['awaiting_payment', 'payment_review'].includes(t.status)) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/bookings/${t.ref}`).then((r) => r.json()).catch(() => null);
      if (res?.ok) setT(res.data);
    }, 20_000);
    return () => clearInterval(id);
  }, [t.ref, t.status]);

  const refresh = async () => {
    const res = await fetch(`/api/bookings/${t.ref}`).then((r) => r.json());
    if (res.ok) setT(res.data);
  };

  return (
    <div className="container-page max-w-3xl py-8 sm:py-12 print:max-w-none print:p-0">
      <AnimatePresence mode="wait">
        {t.status === 'awaiting_payment' && (
          <motion.div key="pay" exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <PaymentStep ticket={t} payment={payment} onUploaded={refresh} />
          </motion.div>
        )}
        {t.status === 'cancelled' && (
          <motion.div key="cancel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-8 text-center">
            <h1 className="text-3xl">This booking is no longer active</h1>
            <p className="mt-2 text-navy-soft">{t.has_screenshot ? 'The booking was cancelled. Please contact us for help.' : 'The payment time ran out, so the slot was released.'}</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link href="/book"><Button size="lg">Book again</Button></Link>
              {whatsapp && <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hi, about booking ${t.ref}`)}`} target="_blank" rel="noreferrer"><Button size="lg" variant="secondary">WhatsApp us</Button></a>}
            </div>
          </motion.div>
        )}
        {['payment_review', 'confirmed', 'completed'].includes(t.status) && (
          <motion.div key="ticket" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <TicketCard t={t} notes={notes} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function useCountdown(until: string | null) {
  const [left, setLeft] = useState(() => (until ? Date.parse(until) - Date.now() : 0));
  useEffect(() => {
    if (!until) return;
    const id = setInterval(() => setLeft(Date.parse(until) - Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  return Math.max(0, left);
}

function PaymentStep({ ticket: t, payment, onUploaded }: { ticket: Ticket; payment: { upi_id: string; payee_name: string; advance_amount: number }; onUploaded: () => void }) {
  const amount = Math.min(payment.advance_amount, t.total);
  const upi = `upi://pay?pa=${encodeURIComponent(payment.upi_id)}&pn=${encodeURIComponent(payment.payee_name)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Movie Bash ${t.ref}`)}`;
  const [qr, setQr] = useState('');
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const left = useCountdown(t.hold_expires_at);

  useEffect(() => { QRCode.toDataURL(upi, { width: 520, margin: 1, color: { dark: '#0E2A47', light: '#FFFFFF' } }).then(setQr); }, [upi]);
  useEffect(() => { if (t.hold_expires_at && left === 0) onUploaded(); }, [left, t.hold_expires_at, onUploaded]);

  function choose(f?: File) {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError('');
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('screenshot', await resizeImage(file, 1280, 0.72), 'payment.webp');
      const res = await fetch(`/api/bookings/${t.ref}/payment`, { method: 'POST', body: fd }).then((r) => r.json());
      if (!res.ok) throw new Error(res.error);
      onUploaded();
    } catch (e: any) {
      setError(e.message || 'Upload failed, please try again');
      setBusy(false);
    }
  }

  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);

  return (
    <div>
      <div className="text-center">
        <p className="eyebrow">Step 5 of 5 · Payment</p>
        <h1 className="mt-2 text-3xl sm:text-4xl">Pay {inr(amount)} advance to confirm</h1>
        <p className="mt-2 text-navy-soft">{t.theatre_name} · {formatDate(t.booking_date, { weekday: 'short', day: 'numeric', month: 'short' })} · {t.slot_label}</p>
        {t.hold_expires_at && (
          <p className={cn('mx-auto mt-4 flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold', left < 180_000 ? 'bg-red-50 text-red-700' : 'bg-brand-50 text-brand-700')}>
            <Clock className="h-4 w-4" />Slot held for {mm}:{String(ss).padStart(2, '0')}
          </p>
        )}
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section className="card p-6 text-center">
          <h2 className="font-sans text-sm font-bold">1 · Scan & pay</h2>
          <div className="mx-auto mt-4 w-56 rounded-2xl border border-line bg-white p-3">
            {qr ? <img src={qr} alt={`UPI QR code to pay ${inr(amount)}`} className="w-full" /> : <div className="skeleton aspect-square" />}
          </div>
          <p className="mt-3 text-2xl font-bold">{inr(amount)}</p>
          <button onClick={() => { navigator.clipboard?.writeText(payment.upi_id); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
            className="mx-auto mt-2 flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-navy-soft transition hover:bg-cream-deep">
            {payment.upi_id}{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <a href={upi} className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-xl bg-navy text-sm font-semibold text-cream transition hover:bg-navy/90 md:hidden">
            Pay with UPI app
          </a>
          <p className="mt-3 text-xs text-navy-faint">Any UPI app works — GPay, PhonePe, Paytm, BHIM</p>
        </section>

        <section className="card flex flex-col p-6">
          <h2 className="text-center font-sans text-sm font-bold">2 · Upload payment screenshot</h2>
          <button onClick={() => input.current?.click()}
            className="mt-4 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-line bg-cream p-4 transition hover:border-brand-400">
            {preview
              ? <img src={preview} alt="Selected screenshot" className="max-h-64 rounded-lg object-contain" />
              : <span className="flex flex-col items-center gap-2 py-10 text-sm text-navy-soft"><Upload className="h-7 w-7 text-brand-500" />Tap to choose screenshot</span>}
          </button>
          <input ref={input} type="file" accept="image/*" hidden onChange={(e) => choose(e.target.files?.[0])} />
          {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button size="lg" className="mt-4 w-full" disabled={!file} loading={busy} onClick={upload}>Submit & get ticket</Button>
        </section>
      </div>
      <p className="mt-6 text-center text-sm text-navy-soft">Total {inr(t.total)} · balance {inr(t.total - amount)} payable at the venue · Booking ID {t.ref}</p>
    </div>
  );
}

function TicketCard({ t, notes }: { t: Ticket; notes: string[] }) {
  const [qr, setQr] = useState('');
  useEffect(() => { QRCode.toDataURL(`${window.location.origin}/ticket/${t.ref}`, { width: 240, margin: 0, color: { dark: '#0E2A47', light: '#FFFFFF' } }).then(setQr); }, [t.ref]);
  const confirmed = t.status === 'confirmed' || t.status === 'completed';
  const balance = t.total - t.amount_paid;

  async function share() {
    const url = window.location.href;
    const text = `Movie Bash booking ${t.ref} — ${formatDate(t.booking_date)} · ${t.slot_label} · ${t.theatre_name}, ${t.branch_name}`;
    if (navigator.share) await navigator.share({ title: 'Movie Bash ticket', text, url }).catch(() => {});
    else window.open(`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
  }

  return (
    <div>
      <div className="mb-6 text-center print:hidden">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className={cn('mx-auto flex h-14 w-14 items-center justify-center rounded-full', confirmed ? 'bg-emerald-100 text-emerald-700' : 'bg-brand-100 text-brand-700')}>
          {confirmed ? <PartyPopper className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
        </motion.div>
        <h1 className="mt-4 text-3xl sm:text-4xl">{confirmed ? 'Your celebration is booked!' : 'Booking received'}</h1>
        <p className="mt-2 text-navy-soft">
          {confirmed ? 'See you soon. This ticket is also on your WhatsApp.' : 'We are verifying your payment. This page updates automatically once confirmed.'}
        </p>
      </div>

      <article data-ticket className="overflow-hidden rounded-[28px] border border-line bg-cream-card shadow-lift">
        <header className="flex items-center justify-between gap-4 bg-navy px-6 py-5 text-cream">
          <div className="rounded-xl bg-cream px-2 py-1"><Logo className="h-8" /></div>
          <span className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold', confirmed ? 'bg-emerald-400/20 text-emerald-200' : 'bg-brand-400/20 text-brand-200')}>
            {!confirmed && <Loader2 className="h-3 w-3 animate-spin" />}{confirmed ? (t.status === 'completed' ? 'Completed' : 'Confirmed') : 'Payment under verification'}
          </span>
        </header>

        <div className="grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-navy-soft">{t.occasion || 'Celebration'} for</p>
            <p className="mt-1 font-display text-3xl">{t.special_person_name || t.customer_name}</p>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <TItem label="Date" value={formatDate(t.booking_date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} />
              <TItem label="Time" value={t.slot_label} />
              <TItem label="Theatre" value={t.theatre_name} />
              <TItem label="Branch" value={t.branch_name} />
              <TItem label="Package" value={`${t.package_name} · ${t.guests} guests`} />
              <TItem label="Cake" value={t.cake_name || '—'} />
              {t.package_includes.length > 0 && <TItem label={`Included in ${t.package_name}`} value={t.package_includes.join(' · ')} wide />}
              {t.items.length > 0 && <TItem label="Extra add-ons" value={t.items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ''}`).join(', ')} wide />}
              <TItem label="Booked by" value={`${t.customer_name} · ${t.phone_masked}`} wide />
            </dl>
          </div>
          <div className="flex flex-col items-center justify-start gap-2 sm:border-l sm:border-dashed sm:border-line sm:pl-6">
            {qr ? <img src={qr} alt="Ticket QR code" className="h-28 w-28" /> : <div className="skeleton h-28 w-28" />}
            <p className="font-mono text-sm font-semibold">{t.ref}</p>
            <p className="text-[11px] text-navy-faint">Show at reception</p>
          </div>
        </div>

        <div className="relative">
          <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" />
          <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-cream" />
          <div className="mx-6 border-t-2 border-dashed border-line" />
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <dl className="space-y-1.5 text-sm">
            <Row label="Total" value={inr(t.total)} />
            {t.extra_hours > 0 && <Row label={`Extra hours × ${t.extra_hours}`} value={inr(t.extra_hour_amount)} />}
            {t.discount > 0 && <Row label="Discount applied" value={`− ${inr(t.discount)}`} />}
            <Row label="Paid" value={inr(t.amount_paid)} />
            <div className="flex justify-between border-t border-line pt-2 text-base font-bold"><dt>Balance at venue</dt><dd className="tabular-nums">{inr(balance)}</dd></div>
          </dl>
          <div className="text-sm">
            <p className="flex gap-2 text-navy-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{t.branch_address}</p>
            <div className="mt-3 flex flex-wrap gap-2 print:hidden">
              {t.map_url && <a href={t.map_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white transition hover:bg-brand-700"><MapPin className="h-3.5 w-3.5" />Open in Maps</a>}
              {t.branch_phone && <a href={`tel:${t.branch_phone.replace(/\s/g, '')}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold transition hover:bg-cream-deep"><Phone className="h-3.5 w-3.5" />Call</a>}
            </div>
          </div>
        </div>
        {notes.length > 0 && (
          <div className="border-t border-line bg-cream px-6 py-5 sm:px-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-soft">Good to know</p>
            <ul className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {notes.map((n) => <li key={n} className="flex gap-2"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{n}</li>)}
            </ul>
          </div>
        )}
      </article>

      <div className="mt-6 flex justify-center gap-3 print:hidden">
        <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" />Print / Save PDF</Button>
        <Button variant="secondary" onClick={share}><Share2 className="h-4 w-4" />Share</Button>
      </div>
    </div>
  );
}

function TItem({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? 'col-span-2' : ''}><dt className="text-xs text-navy-soft">{label}</dt><dd className="mt-0.5 font-semibold">{value}</dd></div>;
}
function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><dt className="text-navy-soft">{label}</dt><dd className="tabular-nums">{value}</dd></div>;
}
