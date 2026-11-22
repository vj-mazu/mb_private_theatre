'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Button, Field, Input, Select, Textarea, api } from '@/components/ui';
import { phoneDigits, todayIST } from '@/lib/booking-rules';

export function EnquiryForm({ branches, occasions }: { branches: any[]; occasions: any[] }) {
  const empty = { name: '', phone: '', email: '', branch: branches[0]?.name || '', occasion: '', preferred_date: '', message: '' };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/enquiries', { method: 'POST', json: f });
      setDone(true);
      setF(empty);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative rounded-[28px] border border-line bg-cream-card p-6 shadow-lift sm:p-8">
      <AnimatePresence mode="wait">
        {done ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[420px] flex-col items-center justify-center text-center">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}>
              <CheckCircle2 className="h-14 w-14 text-emerald-500" />
            </motion.span>
            <h3 className="mt-4 text-2xl">Thank you!</h3>
            <p className="mt-2 max-w-xs text-navy-soft">We received your enquiry and will call or WhatsApp you shortly.</p>
            <Button variant="secondary" className="mt-6" onClick={() => setDone(false)}>Send another</Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" required><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} autoComplete="name" /></Field>
            <Field label="Phone / WhatsApp" required><Input type="tel" inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: phoneDigits(e.target.value) })} autoComplete="tel" placeholder="10-digit mobile number" /></Field>
            <Field label="Branch">
              <Select value={f.branch} onChange={(e) => setF({ ...f, branch: e.target.value })}>
                {branches.map((b) => <option key={b.id}>{b.name}</option>)}
              </Select>
            </Field>
            <Field label="Occasion">
              <Select value={f.occasion} onChange={(e) => setF({ ...f, occasion: e.target.value })}>
                <option value="">Select</option>
                {occasions.map((o) => <option key={o.id}>{o.name}</option>)}
                <option>Other</option>
              </Select>
            </Field>
            <Field label="Preferred date"><Input type="date" min={todayIST()} value={f.preferred_date} onChange={(e) => setF({ ...f, preferred_date: e.target.value })} /></Field>
            <Field label="Email (optional)"><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
            <Field label="Tell us what you're planning" className="sm:col-span-2">
              <Textarea value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} placeholder="Number of guests, theme, surprise ideas…" />
            </Field>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:col-span-2">{error}</p>}
            <Button type="submit" size="lg" loading={busy} className="sm:col-span-2">Send enquiry</Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
