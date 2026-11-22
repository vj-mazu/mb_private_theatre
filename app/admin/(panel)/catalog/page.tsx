'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager, type CrudConfig } from '@/components/admin/CrudManager';
import { CustomPackageCard } from '@/components/admin/CustomPackageCard';
import { Input, Select, api, cn } from '@/components/ui';
import { inr, slotLabel } from '@/lib/booking-rules';

const TABS = ['Branches', 'Theatres', 'Time slots', 'Packages', 'Cakes', 'Add-ons', 'Occasions'] as const;

export default function CatalogPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Branches');
  const [branches, setBranches] = useState<any[]>([]);
  const [theatres, setTheatres] = useState<any[]>([]);
  const [slotTheatre, setSlotTheatre] = useState<number>(0);

  const refresh = useCallback(() => {
    api('/api/admin/crud/branches').then(setBranches).catch(() => {});
    api('/api/admin/crud/theatres').then((t) => { setTheatres(t); setSlotTheatre((s) => s || t[0]?.id || 0); }).catch(() => {});
  }, []);
  useEffect(refresh, [refresh]);

  const branchName = (id: number) => branches.find((b) => b.id === id)?.name || '';
  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));

  const configs: Record<string, CrudConfig> = {
    Branches: {
      entity: 'branches', noun: 'Branch', layout: 'grid',
      defaults: { name: '', slug: '', address: '', phone: '', map_url: '', image_url: '', sort_order: 0, is_active: true },
      title: (r) => r.name, subtitle: (r) => r.address, image: (r) => r.image_url,
      fields: [
        { key: 'name', label: 'Branch name', type: 'text', required: true, half: true },
        { key: 'slug', label: 'URL name', type: 'text', hint: 'e.g. electronic-city', required: true, half: true },
        { key: 'address', label: 'Full address', type: 'textarea' },
        { key: 'phone', label: 'Phone', type: 'text', half: true },
        { key: 'map_url', label: 'Google Maps link', type: 'text', half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'image_url', label: 'Photo', type: 'image' },
      ],
    },
    Theatres: {
      entity: 'theatres', noun: 'Theatre', layout: 'grid',
      defaults: { branch_id: branches[0]?.id, name: '', description: '', base_capacity: 2, max_capacity: 6, base_price: 1499, extra_person_price: 150, extra_hour_price: 449, image_url: '', images: [], video_url: '', sort_order: 0, is_active: true },
      title: (r) => r.name, image: (r) => r.image_url,
      subtitle: (r) => <>{branchName(r.branch_id)} · {r.base_capacity}–{r.max_capacity} guests · Custom {inr(r.base_price)}</>,
      fields: [
        { key: 'branch_id', label: 'Branch', type: 'select', options: branchOptions, number: true, half: true },
        { key: 'name', label: 'Theatre name', type: 'text', required: true, half: true },
        { key: 'description', label: 'Short description', type: 'textarea' },
        { key: 'base_capacity', label: 'Guests included', type: 'number', half: true },
        { key: 'max_capacity', label: 'Maximum guests', type: 'number', half: true },
        { key: 'base_price', label: 'Custom (room only) price ₹', type: 'number', half: true },
        { key: 'extra_person_price', label: 'Extra person price ₹', type: 'number', half: true },
        { key: 'extra_hour_price', label: 'Extra hour price ₹', type: 'number', hint: 'Guests can add up to 2 extra hours if the next slot is free', half: true },
        { key: 'video_url', label: 'Video URL (optional)', type: 'text', half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'image_url', label: 'Main photo', type: 'image' },
        { key: 'images', label: 'More photos', type: 'images' },
      ],
    },
    'Time slots': {
      entity: 'slots', noun: 'Slot', layout: 'rows',
      defaults: { theatre_id: slotTheatre, start_time: '10:00', end_time: '12:00', sort_order: 0, is_active: true },
      filter: (r) => r.theatre_id === slotTheatre,
      title: (r) => slotLabel(r.start_time, r.end_time),
      fields: [
        { key: 'theatre_id', label: 'Theatre', type: 'select', options: theatres.map((t) => ({ value: t.id, label: `${t.name} · ${branchName(t.branch_id)}` })), number: true },
        { key: 'start_time', label: 'Start time', type: 'time', half: true },
        { key: 'end_time', label: 'End time', type: 'time', half: true },
      ],
    },
    Packages: {
      entity: 'packages', noun: 'Package', layout: 'grid',
      defaults: { name: '', tagline: '', includes: [], includes_cake: true, included_addons: [], image_url: '', highlight: false, sort_order: 0, is_active: true, prices: {} },
      title: (r) => r.name, image: (r) => r.image_url,
      subtitle: (r) => {
        const ps = Object.values(r.prices || {}).map((p: any) => p.price);
        return <>{ps.length ? `${inr(Math.min(...ps))} – ${inr(Math.max(...ps))}` : 'No prices set'} · {(r.includes || []).length} inclusions</>;
      },
      fields: [
        { key: 'name', label: 'Package name', type: 'text', required: true, half: true },
        { key: 'tagline', label: 'Tagline', type: 'text', half: true },
        { key: 'includes', label: "What's included", type: 'list', hint: 'One line per item — shown on the menu card' },
        { key: 'includes_cake', label: 'Cake included (customer picks flavour)', type: 'toggle', half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'image_url', label: 'Image (optional)', type: 'image' },
      ],
      extra: (draft, setDraft) => (
        <div className="space-y-5">
        <div>
          <span className="mb-1.5 block text-xs font-semibold text-navy-soft">Price per theatre (leave empty if not offered)</span>
          <div className="divide-y divide-line rounded-xl border border-line bg-white">
            {theatres.map((t) => {
              const p = draft.prices?.[t.id] || {};
              const upd = (k: string, v: string) => setDraft((d) => ({ ...d, prices: { ...d.prices, [t.id]: { ...(d.prices?.[t.id] || {}), [k]: v.replace(/\D/g, '') } } }));
              return (
                <div key={t.id} className="grid grid-cols-[1fr_100px_100px] items-center gap-2 px-3 py-2">
                  <span className="text-sm">{t.name}<span className="block text-xs text-navy-soft">{branchName(t.branch_id)}</span></span>
                  <Input placeholder="Price" inputMode="numeric" value={p.price ?? ''} onChange={(e) => upd('price', e.target.value)} />
                  <Input placeholder="Was (opt.)" inputMode="numeric" value={p.original_price ?? ''} onChange={(e) => upd('original_price', e.target.value)} />
                </div>
              );
            })}
          </div>
        </div>
        </div>
      ),
    },
    Cakes: {
      entity: 'cakes', noun: 'Cake', layout: 'grid',
      defaults: { name: '', image_url: '', price: 499, sort_order: 0, is_active: true },
      title: (r) => r.name, subtitle: (r) => `${inr(r.price)} per 500 g · up to 5 kg`, image: (r) => r.image_url,
      fields: [
        { key: 'name', label: 'Flavour', type: 'text', required: true, half: true },
        { key: 'price', label: 'Price per 500 g ₹', type: 'number', hint: 'Packages include the first 500 g', half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'image_url', label: 'Cake photo', type: 'image' },
      ],
    },
    'Add-ons': {
      entity: 'addons', noun: 'Add-on', layout: 'grid',
      defaults: { category: 'Extras', name: '', description: '', price: 0, image_url: '', sort_order: 0, is_active: true },
      title: (r) => r.name, subtitle: (r) => `${r.category} · ${inr(r.price)}`, image: (r) => r.image_url,
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, half: true },
        { key: 'category', label: 'Category', type: 'text', hint: 'Entry, Decor, Gifts, Photography…', half: true },
        { key: 'price', label: 'Price ₹', type: 'number', half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'description', label: 'Short description', type: 'textarea' },
        { key: 'image_url', label: 'Photo', type: 'image' },
      ],
    },
    Occasions: {
      entity: 'occasions', noun: 'Occasion', layout: 'grid',
      defaults: { name: '', image_url: '', sort_order: 0, is_active: true },
      title: (r) => r.name, image: (r) => r.image_url,
      fields: [
        { key: 'name', label: 'Occasion', type: 'text', required: true, half: true },
        { key: 'sort_order', label: 'Display order', type: 'number', half: true },
        { key: 'image_url', label: 'Photo', type: 'image' },
      ],
    },
  };

  return (
    <>
      <PageHeader title="Branches & packages" subtitle="Everything shown on the website and booking page" />
      <div className="no-scrollbar -mx-4 mb-6 overflow-x-auto px-4">
        <div className="inline-flex gap-1 rounded-2xl border border-line bg-cream-card p-1">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors', tab === t ? 'text-cream' : 'text-navy-soft hover:text-navy')}>
              {tab === t && <motion.span layoutId="catalog-tab" className="absolute inset-0 rounded-xl bg-navy" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'Time slots' && (
        <div className="mb-4 max-w-sm">
          <Select value={slotTheatre} onChange={(e) => setSlotTheatre(Number(e.target.value))}>
            {theatres.map((t) => <option key={t.id} value={t.id}>{t.name} · {branchName(t.branch_id)}</option>)}
          </Select>
        </div>
      )}

      <motion.div key={tab + slotTheatre} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
        {tab === 'Packages' && <CustomPackageCard theatres={theatres} branchName={branchName} onTheatresChanged={refresh} />}
        <CrudManager config={configs[tab]} onChange={tab === 'Branches' || tab === 'Theatres' ? refresh : undefined} />
      </motion.div>
    </>
  );
}
