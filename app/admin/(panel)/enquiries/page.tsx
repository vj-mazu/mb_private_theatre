'use client';

import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';
import { Badge } from '@/components/ui';
import { formatDate } from '@/lib/booking-rules';

const STATUS: Record<string, { label: string; tone: 'amber' | 'sky' | 'green' | 'slate' }> = {
  new: { label: 'New', tone: 'amber' },
  contacted: { label: 'Contacted', tone: 'sky' },
  converted: { label: 'Booked', tone: 'green' },
  closed: { label: 'Closed', tone: 'slate' },
};

export default function EnquiriesPage() {
  return (
    <>
      <PageHeader title="Enquiries" subtitle="Messages sent from the website enquiry form" />
      <CrudManager config={{
        entity: 'enquiries', noun: 'Enquiry', layout: 'rows',
        defaults: { name: '', phone: '', email: '', branch: '', occasion: '', preferred_date: '', message: '', status: 'new', notes: '' },
        title: (r) => `${r.name} · ${r.phone}`,
        subtitle: (r) => (
          <>
            {[r.branch, r.occasion, r.preferred_date && `for ${formatDate(r.preferred_date, { day: 'numeric', month: 'short' })}`].filter(Boolean).join(' · ')}
            {r.message && <span className="mt-1 block whitespace-pre-line text-navy">{r.message}</span>}
            <span className="mt-1 block text-navy-faint">Received {new Date(r.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
          </>
        ),
        rowExtra: (r) => (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge tone={STATUS[r.status]?.tone || 'slate'}>{STATUS[r.status]?.label || r.status}</Badge>
            <a href={`https://wa.me/91${r.phone}`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline">WhatsApp</a>
            <a href={`tel:${r.phone}`} className="text-xs font-semibold text-brand-700 hover:underline">Call</a>
          </div>
        ),
        fields: [
          { key: 'status', label: 'Status', type: 'select', half: true, options: Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })) },
          { key: 'name', label: 'Name', type: 'text', half: true },
          { key: 'phone', label: 'Phone', type: 'text', half: true },
          { key: 'email', label: 'Email', type: 'text', half: true },
          { key: 'branch', label: 'Branch', type: 'text', half: true },
          { key: 'occasion', label: 'Occasion', type: 'text', half: true },
          { key: 'preferred_date', label: 'Preferred date', type: 'date', half: true },
          { key: 'message', label: 'Message', type: 'textarea' },
          { key: 'notes', label: 'Internal notes', type: 'textarea' },
        ],
      }} />
    </>
  );
}
