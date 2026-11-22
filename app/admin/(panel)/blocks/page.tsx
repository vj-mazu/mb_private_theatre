'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { Button, Empty, Field, Input, Select, api, useConfirm, useToast } from '@/components/ui';
import { formatDate, slotLabel, todayIST } from '@/lib/booking-rules';

export default function BlocksPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [cat, setCat] = useState<any>(null);
  const [rows, setRows] = useState<any[] | null>(null);
  const [f, setF] = useState({ branch_id: 0, theatre_id: 0, block_date: todayIST(), slot_id: '', reason: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api<any[]>('/api/admin/blocks').then(setRows).catch((e) => toast(e.message, 'error')), [toast]);
  useEffect(() => {
    load();
    api('/api/catalog').then((c) => {
      setCat(c);
      const b = c.branches[0];
      setF((x) => ({ ...x, branch_id: b?.id || 0, theatre_id: c.theatres.find((t: any) => t.branch_id === b?.id)?.id || 0 }));
    }).catch(() => {});
  }, [load]);

  const theatres = useMemo(() => cat?.theatres.filter((t: any) => t.branch_id === f.branch_id) || [], [cat, f.branch_id]);
  const theatre = theatres.find((t: any) => t.id === f.theatre_id);

  async function save() {
    setBusy(true);
    try {
      await api('/api/admin/blocks', { method: 'POST', json: { ...f, slot_id: f.slot_id ? Number(f.slot_id) : null } });
      toast('Blocked — guests can no longer book this time');
      setF((x) => ({ ...x, slot_id: '', reason: '' }));
      load();
    } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  }

  async function remove(r: any) {
    if (!(await ask({ title: 'Unblock?', message: 'This time becomes bookable again.', confirmLabel: 'Unblock' }))) return;
    try { await api(`/api/admin/blocks?id=${r.id}`, { method: 'DELETE' }); toast('Unblocked'); load(); } catch (e: any) { toast(e.message, 'error'); }
  }

  return (
    <>
      <PageHeader title="Block slots" subtitle="Close a slot or a whole day (maintenance, private event, holiday). Blocked times disappear from booking." />
      <section className="card mb-6 grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        <Field label="Branch">
          <Select value={f.branch_id} onChange={(e) => { const id = Number(e.target.value); setF((x) => ({ ...x, branch_id: id, theatre_id: cat.theatres.find((t: any) => t.branch_id === id)?.id || 0, slot_id: '' })); }}>
            {cat?.branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </Select>
        </Field>
        <Field label="Theatre">
          <Select value={f.theatre_id} onChange={(e) => setF((x) => ({ ...x, theatre_id: Number(e.target.value), slot_id: '' }))}>
            {theatres.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </Select>
        </Field>
        <Field label="Date"><Input type="date" min={todayIST()} value={f.block_date} onChange={(e) => setF((x) => ({ ...x, block_date: e.target.value }))} /></Field>
        <Field label="Slot">
          <Select value={f.slot_id} onChange={(e) => setF((x) => ({ ...x, slot_id: e.target.value }))}>
            <option value="">Whole day</option>
            {theatre?.slots.map((s: any) => <option key={s.id} value={s.id}>{slotLabel(s.start_time, s.end_time)}</option>)}
          </Select>
        </Field>
        <Field label="Reason (internal)"><Input value={f.reason} onChange={(e) => setF((x) => ({ ...x, reason: e.target.value }))} placeholder="e.g. Maintenance" /></Field>
        <div className="sm:col-span-2 lg:col-span-5"><Button loading={busy} onClick={save}><Ban className="h-4 w-4" />Block</Button></div>
      </section>

      <div className="card divide-y divide-line">
        {!rows && <div className="skeleton m-4 h-12" />}
        {rows?.length === 0 && <div className="p-6"><Empty title="No upcoming blocks" /></div>}
        {rows?.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">{formatDate(r.block_date)} · {r.slot_id ? slotLabel(r.start_time, r.end_time) : 'Whole day'}</p>
              <p className="text-xs text-navy-soft">{r.theatre_name}, {r.branch_name}{r.reason && ` · ${r.reason}`} · by {r.created_by}</p>
            </div>
            <button onClick={() => remove(r)} className="rounded-lg p-2 text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Unblock"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </>
  );
}
