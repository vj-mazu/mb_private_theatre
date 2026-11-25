'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { Badge, Button, Field, Input, Modal, Select, Toggle, api, useConfirm, useToast } from '@/components/ui';

export default function StaffPage() {
  const toast = useToast();
  const ask = useConfirm();
  const [users, setUsers] = useState<any[] | null>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api('/api/admin/users').then(setUsers).catch((e) => toast(e.message, 'error')), [toast]);
  useEffect(() => { load(); api('/api/admin/crud/branches').then(setBranches).catch(() => {}); }, [load]);

  async function save() {
    setBusy(true);
    try {
      await api('/api/admin/users', { method: 'POST', json: draft });
      toast('Account saved');
      setDraft(null);
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(u: any) {
    if (!(await ask({ title: 'Delete account?', message: `${u.name} will no longer be able to sign in.`, confirmLabel: 'Delete', danger: true }))) return;
    try { await api(`/api/admin/users?id=${u.id}`, { method: 'DELETE' }); toast('Account deleted'); load(); } catch (e: any) { toast(e.message, 'error'); }
  }

  return (
    <>
      <PageHeader title="Staff" subtitle="Staff can view and manage bookings for their branch. Admins can change everything."
        actions={<Button onClick={() => setDraft({ name: '', username: '', phone: '', role: 'staff', branch_id: branches[0]?.id ?? null, is_active: true, password: '' })}><Plus className="h-4 w-4" />Add staff</Button>} />

      <div className="card divide-y divide-line">
        {!users && <div className="skeleton m-4 h-16" />}
        {users?.map((u) => (
          <div key={u.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="font-semibold">{u.name} <span className="font-normal text-navy-soft">@{u.username}</span></p>
              <p className="text-xs text-navy-soft">
                {u.role === 'admin' ? 'All branches' : branches.find((b) => b.id === u.branch_id)?.name || 'All branches'}
                {u.phone && ` · ${u.phone}`}
                {u.last_login_at && ` · last login ${new Date(u.last_login_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={u.role === 'admin' ? 'sky' : 'slate'}>{u.role}</Badge>
              {!u.is_active && <Badge tone="red">Disabled</Badge>}
              <button onClick={() => setDraft({ ...u, password: '' })} className="rounded-lg p-2 text-navy-soft hover:bg-cream-deep" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => remove(u)} className="rounded-lg p-2 text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? 'Edit account' : 'New staff account'}
        footer={<><Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}>
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="Username"><Input value={draft.username} onChange={(e) => setDraft({ ...draft, username: e.target.value })} /></Field>
            <Field label="Phone"><Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></Field>
            <Field label="Role">
              <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value, branch_id: e.target.value === 'admin' ? null : draft.branch_id })}>
                <option value="staff">Staff</option><option value="admin">Admin</option>
              </Select>
            </Field>
            {draft.role === 'staff' && (
              <Field label="Branch">
                <Select value={draft.branch_id ?? ''} onChange={(e) => setDraft({ ...draft, branch_id: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">All branches</option>
                  {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </Select>
              </Field>
            )}
            <Field label={draft.id ? 'New password (optional)' : 'Password'} hint="At least 8 characters">
              <Input type="password" autoComplete="new-password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
            </Field>
            <div className="sm:col-span-2"><Toggle checked={draft.is_active} onChange={(v) => setDraft({ ...draft, is_active: v })} label="Account active" /></div>
          </div>
        )}
      </Modal>
    </>
  );
}
