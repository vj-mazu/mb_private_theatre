'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, Field, Input, Modal, Toggle, api, cn, useToast } from '@/components/ui';
import { ImageUpload } from '@/components/admin/MediaUpload';
import { inr } from '@/lib/booking-rules';

interface Custom { enabled: boolean; tagline: string; includes: string[]; image_url: string }

/**
 * The "Custom" (room only) option. It is not a row in the packages table: its text lives in settings
 * and its price per theatre is each theatre's base price — both editable here.
 */
export function CustomPackageCard({ theatres, branchName, onTheatresChanged }: {
  theatres: any[]; branchName: (id: number) => string; onTheatresChanged: () => void;
}) {
  const toast = useToast();
  const [custom, setCustom] = useState<Custom | null>(null);
  const [draft, setDraft] = useState<(Custom & { prices: Record<number, string> }) | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<any>('/api/admin/settings').then((d) => setCustom(d.settings.custom_package)).catch((e) => toast(e.message, 'error'));
  }, [toast]);

  if (!custom) return <div className="skeleton mb-3 h-28" />;

  const prices = theatres.map((t) => t.base_price).filter((p) => p > 0);

  async function saveSettings(next: Custom) {
    await api('/api/admin/settings', { method: 'PUT', json: { custom_package: next } });
    setCustom(next);
  }

  async function toggle() {
    const next = { ...custom!, enabled: !custom!.enabled };
    setCustom(next);
    try { await saveSettings(next); } catch (e: any) { toast(e.message, 'error'); setCustom(custom); }
  }

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const { prices: p, ...rest } = draft;
      await saveSettings({ ...rest, includes: rest.includes.map((x) => x.trim()).filter(Boolean) });
      const changed = theatres.filter((t) => p[t.id] !== '' && Number(p[t.id]) !== t.base_price);
      for (const t of changed) await api(`/api/admin/crud/theatres/${t.id}`, { method: 'PUT', json: { base_price: Number(p[t.id]) } });
      if (changed.length) onTheatresChanged();
      toast('Custom package saved');
      setDraft(null);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const image = custom.image_url || theatres[0]?.image_url;

  return (
    <>
      <div className={cn('card mb-3 flex flex-col overflow-hidden transition-shadow hover:shadow-lift sm:flex-row', !custom.enabled && 'opacity-60')}>
        <div className="aspect-[16/10] bg-cream-deep sm:aspect-auto sm:w-56 sm:shrink-0">
          {image && <img src={image} alt="" className="h-full w-full object-cover" loading="lazy" />}
        </div>
        <div className="flex min-w-0 flex-1 items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="font-semibold">Custom <span className="font-normal text-navy-soft">(room only)</span></p>
            <p className="mt-0.5 text-xs text-navy-soft">
              {prices.length ? `${inr(Math.min(...prices))} – ${inr(Math.max(...prices))}` : 'No prices set'} · {custom.includes.length} inclusions · no cake included
            </p>
            <p className="mt-1 text-xs text-navy-faint">{custom.tagline}</p>
            {!custom.enabled && <Badge className="mt-1.5">Hidden on website</Badge>}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Toggle checked={custom.enabled} onChange={toggle} />
            <button onClick={() => setDraft({ ...custom, prices: Object.fromEntries(theatres.map((t) => [t.id, String(t.base_price ?? '')])) })}
              className="rounded-lg p-2 text-navy-soft transition hover:bg-cream-deep hover:text-navy" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <Modal open={!!draft} onClose={() => setDraft(null)} title="Edit Custom package" size="lg"
        footer={<><Button variant="secondary" onClick={() => setDraft(null)}>Cancel</Button><Button loading={busy} onClick={save}>Save</Button></>}>
        {draft && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Tagline" className="sm:col-span-2">
              <Input value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} />
            </Field>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-navy-soft">What&apos;s included</span>
              <div className="space-y-2">
                {draft.includes.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={item} onChange={(e) => setDraft({ ...draft, includes: draft.includes.map((x, j) => (j === i ? e.target.value : x)) })} />
                    <button type="button" onClick={() => setDraft({ ...draft, includes: draft.includes.filter((_, j) => j !== i) })}
                      className="rounded-lg px-2 text-navy-soft hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button type="button" size="sm" variant="secondary" onClick={() => setDraft({ ...draft, includes: [...draft.includes, ''] })}><Plus className="h-4 w-4" />Add line</Button>
              </div>
            </div>
            <div className="sm:col-span-2 sm:max-w-xs">
              <ImageUpload label="Image (optional — otherwise the room photo is used)" value={draft.image_url} onChange={(url) => setDraft({ ...draft, image_url: url })} />
            </div>
            <div className="flex items-center sm:col-span-2">
              <Toggle checked={draft.enabled} onChange={(v: boolean) => setDraft({ ...draft, enabled: v })} label="Show on website" />
            </div>
            <div className="sm:col-span-2">
              <span className="mb-1.5 block text-xs font-semibold text-navy-soft">Room-only price per theatre</span>
              <div className="divide-y divide-line rounded-xl border border-line bg-white">
                {theatres.map((t) => (
                  <div key={t.id} className="grid grid-cols-[1fr_120px] items-center gap-2 px-3 py-2">
                    <span className="text-sm">{t.name}<span className="block text-xs text-navy-soft">{branchName(t.branch_id)}</span></span>
                    <Input placeholder="Price" inputMode="numeric" value={draft.prices[t.id] ?? ''}
                      onChange={(e) => setDraft({ ...draft, prices: { ...draft.prices, [t.id]: e.target.value.replace(/\D/g, '') } })} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
