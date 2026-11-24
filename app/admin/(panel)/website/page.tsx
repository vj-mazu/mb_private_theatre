'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';
import { Button, Field, ImageUpload, Input, Textarea, Toggle, api, cn, useToast } from '@/components/ui';

const TABS = ['Home & story', 'Hero slides', 'Story cards', 'Videos', 'Testimonials', 'FAQs'] as const;
const NL = String.fromCharCode(10);

export default function WebsitePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Home & story');
  return (
    <>
      <PageHeader title="Website" subtitle="Everything visitors see on the home page"
        actions={<a href="/" target="_blank" rel="noreferrer"><Button variant="secondary"><ExternalLink className="h-4 w-4" />Open website</Button></a>} />
      <div className="mb-6 inline-flex max-w-full flex-wrap gap-1 rounded-2xl border border-line bg-cream-card p-1">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('relative rounded-xl px-4 py-2 text-sm font-medium transition-colors', tab === t ? 'text-cream' : 'text-navy-soft hover:text-navy')}>
            {tab === t && <motion.span layoutId="website-tab" className="absolute inset-0 rounded-xl bg-navy" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'Home & story' && <HomeContent onOpen={setTab} />}
        {tab === 'Hero slides' && (
          <>
            <Note>
              Each slide at the top of the home page is an <b>occasion with a photo</b>, in display order. The slide&apos;s button books that occasion.
              Remove a photo to take an occasion out of the hero but keep it in the booking form; turning an occasion off hides it everywhere.
              Square or portrait photos fit the frame best.
            </Note>
            <CrudManager config={{
              entity: 'occasions', noun: 'Occasion', layout: 'grid',
              defaults: { name: '', image_url: '', sort_order: 0, is_active: true },
              title: (r) => r.name, image: (r) => r.image_url,
              subtitle: (r) => (!r.is_active ? 'Turned off · not in the hero or booking' : r.image_url ? `In the hero · order ${r.sort_order}` : 'No photo · not in the hero'),
              fields: [
                { key: 'name', label: 'Occasion (shown on the slide)', type: 'text', required: true, half: true },
                { key: 'sort_order', label: 'Display order', type: 'number', half: true },
                { key: 'image_url', label: 'Slide photo', type: 'image', hint: 'Square or portrait photo' },
              ],
            }} />
          </>
        )}
        {tab === 'Story cards' && (
          <>
            <Note>
              The &ldquo;Our story&rdquo; section shows the story card first (edit it under <b>Home &amp; story</b>), then one card per branch.
              Leave the text or photo empty to use the branch address and branch photo.
            </Note>
            <CrudManager config={{
              entity: 'branches', noun: 'Story card', layout: 'grid', editOnly: true, defaults: {},
              title: (r) => r.name, image: (r) => r.story_image || r.image_url,
              subtitle: (r) => <span className="line-clamp-2">{r.story_text || r.address}</span>,
              fields: [
                { key: 'story_text', label: 'Card text', type: 'textarea' },
                { key: 'story_image', label: 'Card photo', type: 'image', hint: 'Empty = the branch photo' },
              ],
            }} />
          </>
        )}
        {tab === 'Videos' && (
          <>
            <Note>Videos in the &ldquo;Our celebrations, in motion&rdquo; strip on the home page, in display order. Turn one off to hide it. The strip is hidden when there are none.</Note>
            <CrudManager config={{
              entity: 'showcase_videos', noun: 'Video', layout: 'grid',
              defaults: { title: '', room: '', video_url: '', poster_url: '', sort_order: 0, is_active: true },
              title: (r) => r.title, subtitle: (r) => r.room || 'Movie Bash', image: (r) => r.poster_url,
              fields: [
                { key: 'title', label: 'Title', type: 'text', required: true, half: true },
                { key: 'room', label: 'Room', type: 'text', hint: 'e.g. Couple room — shown above the title', half: true },
                { key: 'sort_order', label: 'Display order', type: 'number', half: true },
                { key: 'video_url', label: 'Video', type: 'video', posterKey: 'poster_url' },
                { key: 'poster_url', label: 'Cover photo', type: 'image', hint: 'Shown before the video plays. Filled in automatically from the video; upload your own to change it.' },
              ],
            }} />
          </>
        )}
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

function HomeContent({ onOpen }: { onOpen: (tab: (typeof TABS)[number]) => void }) {
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
        <p className="text-sm text-navy-soft">
          Hero photos and their order: <button type="button" onClick={() => onOpen('Hero slides')} className="font-semibold text-brand-700 underline">Hero slides</button>.
        </p>
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

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 max-w-3xl rounded-xl border border-brand-200 bg-brand-50/60 px-4 py-3 text-sm leading-relaxed text-navy-soft">{children}</p>;
}

function Card({ title, children, wide }: { title: string; children: React.ReactNode; wide?: boolean }) {
  return <section className={cn('card space-y-4 p-5', wide && 'lg:col-span-2')}><h2 className="font-sans text-sm font-bold">{title}</h2>{children}</section>;
}
