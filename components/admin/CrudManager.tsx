'use client';

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Sparkles } from 'lucide-react';
import { Badge, Button, Empty, Field, ImageUpload, Input, Modal, Select, Textarea, Toggle, VideoUpload, api, cn, useConfirm, useToast } from '@/components/ui';

export type FieldDef =
  | { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'time' | 'date'; hint?: string; required?: boolean; half?: boolean }
  | { key: string; label: string; type: 'select'; options: { value: string | number; label: string }[]; half?: boolean; number?: boolean }
  | { key: string; label: string; type: 'image'; hint?: string }
  | { key: string; label: string; type: 'video'; hint?: string; /** field that gets the automatic cover photo when empty */ posterKey?: string }
  | { key: string; label: string; type: 'images' }
  | { key: string; label: string; type: 'list'; hint?: string }
  | { key: string; label: string; type: 'toggle'; half?: boolean }
  | { key: string; label: string; type: 'code'; prefix?: string; hint?: string; half?: boolean };

export interface CrudConfig {
  entity: string;
  noun: string;
  fields: FieldDef[];
  defaults: Record<string, any>;
  layout?: 'grid' | 'rows';
  title: (row: any) => string;
  subtitle?: (row: any) => React.ReactNode;
  image?: (row: any) => string;
  filter?: (row: any) => boolean;
  extra?: (draft: any, setDraft: (fn: (d: any) => any) => void) => React.ReactNode;
  rowExtra?: (row: any) => React.ReactNode;
  /** Edit-only list (e.g. branch story cards): no add, delete or show/hide buttons. */
  editOnly?: boolean;
}

export function CrudManager({ config, onChange }: { config: CrudConfig; onChange?: (rows: any[]) => void }) {
  const toast = useToast();
  const ask = useConfirm();
  const [rows, setRows] = useState<any[] | null>(null);
  const [draft, setDraft] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const data = await api<any[]>(`/api/admin/crud/${config.entity}`);
    setRows(data);
    onChange?.(data);
  }, [config.entity, onChange]);
  useEffect(() => { load().catch((e) => toast(e.message, 'error')); }, [load, toast]);

  async function save() {
    setBusy(true);
    try {
      if (draft.id) await api(`/api/admin/crud/${config.entity}/${draft.id}`, { method: 'PUT', json: draft });
      else await api(`/api/admin/crud/${config.entity}`, { method: 'POST', json: draft });
      toast(`${config.noun} saved`);
      setDraft(null);
      await load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function remove(row: any) {
    if (!(await ask({ title: `Delete ${config.noun.toLowerCase()}?`, message: `"${config.title(row)}" will be removed permanently. You can turn it off instead to hide it.`, confirmLabel: 'Delete', danger: true }))) return;
    try {
      await api(`/api/admin/crud/${config.entity}/${row.id}`, { method: 'DELETE' });
      toast(`${config.noun} deleted`);
      await load();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  }

  async function toggleActive(row: any) {
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, is_active: !r.is_active } : r)) || null);
    try {
      await api(`/api/admin/crud/${config.entity}/${row.id}`, { method: 'PUT', json: { is_active: !row.is_active } });
    } catch (e: any) {
      toast(e.message, 'error');
      load();
    }
  }

  const visible = rows?.filter(config.filter || (() => true));
  const grid = config.layout !== 'rows';

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-navy-soft">{visible ? `${visible.length} ${config.noun.toLowerCase()}${visible.length === 1 ? '' : 's'}` : ' '}</p>
        {!config.editOnly && <Button size="sm" onClick={() => setDraft({ ...config.defaults })}><Plus className="h-4 w-4" />Add {config.noun.toLowerCase()}</Button>}
      </div>

      {!visible && <div className={cn('grid gap-3', grid && 'sm:grid-cols-2 lg:grid-cols-3')}>{[0, 1, 2].map((i) => <div key={i} className="skeleton h-28" />)}</div>}
      {visible?.length === 0 && <Empty title={`No ${config.noun.toLowerCase()}s yet`} />}

      <motion.div layout className={cn('grid gap-3', grid ? 'sm:grid-cols-2 lg:grid-cols-3' : '')}>
        <AnimatePresence initial={false}>
          {visible?.map((row) => (
            <motion.div key={row.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className={cn('card flex overflow-hidden transition-shadow hover:shadow-lift', grid ? 'flex-col' : 'items-center', !row.is_active && 'opacity-60')}>
              {config.image && (
                grid
                  ? <div className="aspect-[16/10] overflow-hidden bg-cream-deep">{config.image(row) && <img src={config.image(row)} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
                  : <div className="m-3 h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-cream-deep">{config.image(row) && <img src={config.image(row)} alt="" className="h-full w-full object-cover" loading="lazy" />}</div>
              )}
              <div className={cn('flex min-w-0 flex-1 items-start justify-between gap-3', grid ? 'p-4' : 'px-4 py-3')}>
                <div className="min-w-0">
                  <p className="truncate font-semibold">{config.title(row)}</p>
                  {config.subtitle && <div className="mt-0.5 text-xs text-navy-soft">{config.subtitle(row)}</div>}
                  {!row.is_active && <Badge className="mt-1.5">Hidden</Badge>}
                  {config.rowExtra?.(row)}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {!config.editOnly && 'is_active' in row && <Toggle checked={!!row.is_active} onChange={() => toggleActive(row)} />}
                  <button onClick={() => setDraft({ ...row })} className="rounded-lg p-2 text-navy-soft transition hover:bg-cream-deep hover:text-navy" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  {!config.editOnly && <button onClick={() => remove(row)} className="rounded-lg p-2 text-navy-soft transition hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <Modal open={!!draft} onClose={() => setDraft(null)} title={draft?.id ? `Edit ${config.noun.toLowerCase()}` : `New ${config.noun.toLowerCase()}`} size="lg"
        footer={<><Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}>
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={draft[f.key]} onChange={(v, poster) => setDraft((d: any) => ({
                ...d, [f.key]: v,
                // A new video brings its own cover photo unless one was already chosen.
                ...(f.type === 'video' && f.posterKey && poster && !d[f.posterKey] ? { [f.posterKey]: poster } : {}),
              }))} />
            ))}
            {config.extra && <div className="sm:col-span-2">{config.extra(draft, setDraft)}</div>}
          </div>
        )}
      </Modal>
    </div>
  );
}

function FieldInput({ field: f, value, onChange }: { field: FieldDef; value: any; onChange: (v: any, poster?: string) => void }) {
  const span = 'half' in f && f.half ? '' : 'sm:col-span-2';
  switch (f.type) {
    case 'image':
      return (
        <div className="sm:col-span-2 sm:max-w-xs">
          <ImageUpload label={f.label} value={value || ''} onChange={onChange} />
          {f.hint && <p className="mt-1 text-xs text-navy-faint">{f.hint}</p>}
        </div>
      );
    case 'video':
      return <div className="sm:col-span-2"><VideoUpload label={f.label} hint={f.hint} value={value || ''} onChange={onChange} /></div>;
    case 'images': {
      const list: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-navy-soft">{f.label}</span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {list.map((src, i) => (
              <div key={src + i} className="group relative aspect-square overflow-hidden rounded-xl border border-line">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="absolute right-1 top-1 rounded-full bg-white/90 p-1 opacity-0 shadow transition group-hover:opacity-100" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
              </div>
            ))}
            <ImageUpload label="" aspect="aspect-square" value="" onChange={(url) => url && onChange([...list, url])} />
          </div>
        </div>
      );
    }
    case 'list': {
      const list: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-navy-soft">{f.label}</span>
          <div className="space-y-2">
            {list.map((item, i) => (
              <div key={i} className="flex gap-2">
                <Input value={item} onChange={(e) => onChange(list.map((x, j) => (j === i ? e.target.value : x)))} />
                <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="rounded-lg px-2 text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
            <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...list, ''])}><Plus className="h-4 w-4" />Add line</Button>
          </div>
          {f.hint && <p className="mt-1 text-xs text-navy-faint">{f.hint}</p>}
        </div>
      );
    }
    case 'code':
      return (
        <Field label={f.label} hint={f.hint} className={span}>
          <div className="flex gap-2">
            <Input value={value ?? ''} onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))} placeholder="e.g. SAVE200" />
            <Button type="button" variant="secondary" className="shrink-0" onClick={() => onChange(generateCode(f.prefix))}><Sparkles className="h-4 w-4" />Generate</Button>
          </div>
        </Field>
      );
    case 'toggle':
      return <div className={cn('flex items-center', span)}><Toggle checked={!!value} onChange={onChange} label={f.label} /></div>;
    case 'select':
      return (
        <Field label={f.label} className={span}>
          <Select value={value ?? ''} onChange={(e) => onChange(f.number ? Number(e.target.value) : e.target.value)}>
            {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      );
    case 'textarea':
      return <Field label={f.label} hint={f.hint} className="sm:col-span-2"><Textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} /></Field>;
    default:
      return (
        <Field label={f.label} hint={f.hint} required={f.required} className={span}>
          <Input type={f.type === 'number' ? 'text' : f.type} inputMode={f.type === 'number' ? 'numeric' : undefined} value={value ?? ''}
            onChange={(e) => onChange(f.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value.replace(/[^\d]/g, ''))) : e.target.value)} />
        </Field>
      );
  }
}

/** Random, easy-to-read coupon code (no 0/O/1/I). */
function generateCode(prefix = 'MB') {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return prefix + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}
