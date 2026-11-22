'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';
import { Button, Field, ImageUpload, Input, Textarea, Toggle, api, cn, useToast } from '@/components/ui';

const TABS = ['Home & story', 'Testimonials', 'FAQs'] as const;
const NL = String.fromCharCode(10);

export default function WebsitePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Home & story');
  return (
    <>
      <PageHeader title="Website" subtitle="Everything visitors see on the home page"
        actions={<a href="/" target="_blank" rel="noreferrer"><Button variant="secondary"><ExternalLink className="h-4 w-4" />Open website</Button></a>} />
      <div className="mb-6 inline-flex gap-1 rounded-2xl border border-line bg-cream-card p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('relative rounded-xl px-4 py-2 text-sm font-medium transition-colors', tab === t ? 'text-cream' : 'text-navy-soft hover:text-navy')}>
            {tab === t && <motion.span layoutId="website-tab" className="absolute inset-0 rounded-xl bg-navy" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'Home & story' && <HomeContent />}
        {tab === 'Testimonials' && (
          <CrudManager config={{
            entity: 'testimonials', noun: 'Testimonial', layout: 'rows',
            defaults: { name: '', occasion: '', rating: 5, text: '', image_url: '', sort_order: 0, is_active: true },
            title: (r) => `${r.name}${r.occasion ? ` · ${r.occasion}` : ''}`, subtitle: (r) => <span className="line-clamp-2">{'★'.repeat(r.rating)} {r.text}</span>,
            image: (r) => r.image_url,
            fields: [
              { key: 'name', label: 'Customer name', type: 'text', required: true, half: true },
              { key: 'occasion', label: 'Occasion', type: 'text', half: true },
              { key: 'rating', label: 'Stars', type: 'select', half: true, number: true, options: [5, 4, 3].map((n) => ({ value: n, label: `${n} stars` })) },
              { key: 'sort_order', label: 'Display order', type: 'number', half: true },
              { key: 'text', label: 'Review', type: 'textarea' },
              { key: 'image_url', label: 'Photo (optional)', type: 'image' },
            ],
          }} />
        )}
        {tab === 'FAQs' && (
          <CrudManager config={{
            entity: 'faqs', noun: 'FAQ', layout: 'rows',
            defaults: { question: '', answer: '', sort_order: 0, is_active: true },
            title: (r) => r.question, subtitle: (r) => r.answer,
            fields: [
              { key: 'question', label: 'Question', type: 'text', required: true },
              { key: 'answer', label: 'Answer', type: 'textarea' },
              { key: 'sort_order', label: 'Display order', type: 'number', half: true },
            ],
          }} />
        )}
      </motion.div>
    </>
  );
}

function HomeContent() {
  const toast = useToast();
  const [s, setS] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/api/admin/settings').then((d) => setS(d.settings)).catch((e) => toast(e.message, 'error')); }, [toast]);
  const upd = (g: string, k: string, v: any) => setS((x: any) => ({ ...x, [g]: { ...x[g], [k]: v } }));

  async function save() {
    setBusy(true);
    try {
      await api('/api/admin/settings', { method: 'PUT', json: { hero: s.hero, story: s.story, stats: s.stats, announcement: s.announcement, reels: { urls: (s.reels?.urls || []).map((u: string) => u.trim()).filter(Boolean).slice(0, 4) } } });
      toast('Website updated');
    } catch (e: any) { toast(e.message, 'error'); } finally { setBusy(false); }
  }
  if (!s) return <div className="skeleton h-96" />;
  const num = (v: string) => Number(v.replace(/[^\d.]/g, '')) || 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card title="Hero (top of home page)" wide>
        <Field label="Headline"><Input value={s.hero.title} onChange={(e) => upd('hero', 'title', e.target.value)} /></Field>
        <Field label="Sub-headline"><Textarea value={s.hero.subtitle} onChange={(e) => upd('hero', 'subtitle', e.target.value)} /></Field>
        <span className="block text-xs font-semibold text-navy-soft">Hero photos (first photo shows first, they slowly cross-fade)</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {s.hero.images.map((src: string, i: number) => (
            <div key={src + i} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
              <img src={src} alt="" className="h-full w-full object-cover" />
              <button onClick={() => upd('hero', 'images', s.hero.images.filter((_: string, j: number) => j !== i))} className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 shadow" aria-label="Remove"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <ImageUpload label="" value="" onChange={(url) => url && upd('hero', 'images', [...s.hero.images, url])} />
        </div>
      </Card>

      <Card title="Our story" wide>
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <div className="space-y-4">
            <Field label="Title"><Input value={s.story.title} onChange={(e) => upd('story', 'title', e.target.value)} /></Field>
            <Field label="Story" hint="Leave an empty line between paragraphs"><Textarea className="min-h-[160px]" value={s.story.body} onChange={(e) => upd('story', 'body', e.target.value)} /></Field>
            <Field label="Highlighted quote"><Input value={s.story.quote} onChange={(e) => upd('story', 'quote', e.target.value)} /></Field>
          </div>
          <ImageUpload label="Story photo" aspect="aspect-[3/4]" value={s.story.image} onChange={(v) => upd('story', 'image', v)} />
        </div>
      </Card>

      <Card title="Google rating & numbers">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Google rating"><Input value={s.stats.rating} onChange={(e) => upd('stats', 'rating', Math.min(5, num(e.target.value)))} /></Field>
          <Field label="No. of reviews"><Input value={s.stats.reviews || ''} onChange={(e) => upd('stats', 'reviews', num(e.target.value))} /></Field>
          <Field label="Celebrations"><Input value={s.stats.celebrations || ''} onChange={(e) => upd('stats', 'celebrations', num(e.target.value))} /></Field>
        </div>
        <p className="text-xs text-navy-faint">Leave a number empty to hide it on the website.</p>
      </Card>

      <Card title="Instagram reels (home page gallery)" wide>
        <Field label="Reel links — one per line, up to 4" hint="Paste links like https://www.instagram.com/reel/ABC123/ · leave empty to hide the reels row">
          <Textarea className="min-h-[110px]" value={(s.reels?.urls || []).join(NL)}
            onChange={(e) => setS((x: any) => ({ ...x, reels: { urls: e.target.value.split(NL) } }))}
            onBlur={() => setS((x: any) => ({ ...x, reels: { urls: (x.reels?.urls || []).map((u: string) => u.trim()).filter(Boolean).slice(0, 4) } }))} />
        </Field>
      </Card>

      <Card title="Announcement bar">
        <Toggle checked={s.announcement.enabled} onChange={(v) => upd('announcement', 'enabled', v)} label="Show announcement" />
        <Field label="Text" hint="When off, the best active coupon is shown instead"><Input value={s.announcement.text} onChange={(e) => upd('announcement', 'text', e.target.value)} /></Field>
      </Card>

      <div className="lg:col-span-2"><Button size="lg" loading={busy} onClick={save}>Save website content</Button></div>
    </div>
  );
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <section className={cn('card space-y-4 p-5', wide && 'lg:col-span-2')}><h2 className="font-sans text-sm font-bold">{title}</h2>{children}</section>;
}
