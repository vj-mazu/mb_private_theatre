'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { Badge, Button, Field, Input, Textarea, api, useToast } from '@/components/ui';

const NL = String.fromCharCode(10);

export default function SettingsPage() {
  const toast = useToast();
  const [s, setS] = useState<any>(null);
  const [wa, setWa] = useState<boolean>(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api('/api/admin/settings').then((d) => { setS(d.settings); setWa(d.whatsapp.configured); }).catch((e) => toast(e.message, 'error')); }, [toast]);
  const upd = (group: string, key: string, value: any) => setS((x: any) => ({ ...x, [group]: { ...x[group], [key]: value } }));

  async function save() {
    setBusy(true);
    try { setS(await api('/api/admin/settings', { method: 'PUT', json: s })); toast('Settings saved'); } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  }

  if (!s) return <div className="skeleton h-96" />;
  const num = (v: string) => Number(v.replace(/\D/g, '')) || 0;

  return (
    <>
      <PageHeader title="Settings & backup" subtitle="Home page text, photos and rating are under Website" actions={<Button loading={busy} onClick={save}>Save settings</Button>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Business details">
          <Field label="Phone"><Input value={s.business.phone} onChange={(e) => upd('business', 'phone', e.target.value)} /></Field>
          <Field label="WhatsApp number" hint="With country code, e.g. 919902923656"><Input value={s.business.whatsapp} onChange={(e) => upd('business', 'whatsapp', e.target.value)} /></Field>
          <Field label="Email"><Input value={s.business.email} onChange={(e) => upd('business', 'email', e.target.value)} /></Field>
          <Field label="Instagram link"><Input value={s.business.instagram} onChange={(e) => upd('business', 'instagram', e.target.value)} /></Field>
        </Card>

        <Card title="Payment (UPI advance)">
          <Field label="UPI ID"><Input value={s.payment.upi_id} onChange={(e) => upd('payment', 'upi_id', e.target.value.trim())} /></Field>
          <Field label="Payee name"><Input value={s.payment.payee_name} onChange={(e) => upd('payment', 'payee_name', e.target.value)} /></Field>
          <Field label="Advance amount (₹)"><Input inputMode="numeric" value={s.payment.advance_amount} onChange={(e) => upd('payment', 'advance_amount', num(e.target.value))} /></Field>
        </Card>

        <Card title="Booking rules">
          <Field label="Close a slot this many minutes after it starts" hint="Website customers cannot book a slot after this. 0 = closes at start time.">
            <Input inputMode="numeric" value={s.booking.slot_cutoff_minutes} onChange={(e) => upd('booking', 'slot_cutoff_minutes', num(e.target.value))} />
          </Field>
          <Field label="Hold a slot for payment (minutes)" hint="If the payment screenshot isn't uploaded in time, the slot is released.">
            <Input inputMode="numeric" value={s.booking.hold_minutes} onChange={(e) => upd('booking', 'hold_minutes', Math.max(5, num(e.target.value)))} />
          </Field>
        </Card>

        <Card title="Ticket & WhatsApp notes">
          <Field label="Good-to-know notes" hint="One per line — shown on the ticket and in WhatsApp confirmations (parking, timing, food rules…)">
            <Textarea className="min-h-[140px]" value={(s.visit?.notes || []).join(NL)}
              onChange={(e) => setS((x: any) => ({ ...x, visit: { notes: e.target.value.split(NL) } }))}
              onBlur={() => setS((x: any) => ({ ...x, visit: { notes: (x.visit?.notes || []).map((l: string) => l.trim()).filter(Boolean) } }))} />
          </Field>
        </Card>

        <Card title="WhatsApp Cloud API">
          <div className="flex items-center gap-2 text-sm">Status: {wa ? <Badge tone="green">Connected</Badge> : <Badge tone="amber">Not configured</Badge>}</div>
          <p className="text-sm text-navy-soft">
            Set <code>WHATSAPP_TOKEN</code> and <code>WHATSAPP_PHONE_NUMBER_ID</code> on the server. For messages outside the 24-hour window,
            create approved templates in Meta and set <code>WHATSAPP_TEMPLATE_CONFIRMATION</code>, <code>…_RECEIVED</code>, <code>…_RESCHEDULE</code>, <code>…_CANCELLATION</code>, <code>…_REMINDER</code>.
          </p>
        </Card>

        <Card title="Backup">
          <p className="text-sm text-navy-soft">Download a complete copy of the database — bookings, payments, packages, settings and staff.</p>
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/backup"><Button variant="secondary"><Download className="h-4 w-4" />Data backup</Button></a>
            <a href="/api/admin/backup?files=1"><Button variant="secondary"><Download className="h-4 w-4" />Backup with images</Button></a>
            <a href="/api/admin/bookings/export"><Button variant="secondary"><Download className="h-4 w-4" />All bookings (Excel)</Button></a>
          </div>
        </Card>
      </div>
    </>
  );
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <section className={`card space-y-4 p-5 ${wide ? 'lg:col-span-2' : ''}`}>
      <h2 className="font-sans text-sm font-bold">{title}</h2>
      {children}
    </section>
  );
}
