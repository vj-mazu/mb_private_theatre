import Image from '@/components/Img';
import Link from 'next/link';
import { ArrowRight, Instagram, MapPin, MessageCircle, Phone, Mail, Star } from 'lucide-react';
import { getCatalog } from '@/lib/server/catalog';
import { Reveal } from '@/components/site/Reveal';
import { StoryCollage } from '@/components/site/StoryCollage';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Our story',
  description: 'How Movie Bash became a home for private celebrations in Bengaluru — two branches, private theatres, and thousands of birthdays, anniversaries and proposals.',
  alternates: { canonical: '/our-story' },
};

const VALUES = [
  ['Completely private', 'Only your group in the room for the whole slot — no strangers, no cameras inside.'],
  ['Decor that wows', 'Neon names, balloon arches, fog entries and cake moments set up before you walk in.'],
  ['Your movie, your way', 'Log in to your own OTT account — 4K screen and Dolby sound do the rest.'],
  ['Simple, honest pricing', 'Clear packages, a small advance to book, and the balance at the venue.'],
];

export default async function OurStoryPage() {
  const { branches, theatres, settings, testimonials } = await getCatalog();
  const { story, stats, business } = settings;
  const wa = business.whatsapp?.replace(/\D/g, '');
  const contacts = [
    business.phone && { href: `tel:${business.phone.replace(/\s/g, '')}`, label: 'Call us', sub: business.phone, icon: Phone, tone: 'bg-brand-600' },
    wa && { href: `https://wa.me/${wa}`, label: 'WhatsApp', sub: 'Quick replies', icon: MessageCircle, tone: 'bg-[#25D366]' },
    business.instagram && { href: business.instagram, label: 'Instagram', sub: 'Real setups & reels', icon: Instagram, tone: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
    business.email && { href: `mailto:${business.email}`, label: 'Email', sub: business.email, icon: Mail, tone: 'bg-navy' },
  ].filter(Boolean) as { href: string; label: string; sub: string; icon: any; tone: string }[];
  const paragraphs = story.body.split(/\n\s*\n/).filter(Boolean);

  return (
    <>
      {/* Intro */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 to-cream pb-20 pt-14">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-4 text-5xl leading-[1.02] sm:text-7xl">{story.title || 'Made for moments that matter'}</h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-navy-soft">{paragraphs[0]}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/book" className="inline-flex h-12 items-center gap-2 rounded-full bg-brand-600 px-6 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-700">Book a celebration <ArrowRight className="h-4 w-4" /></Link>
              {business.instagram && <a href={business.instagram} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-line bg-white px-6 font-semibold transition hover:border-brand-300"><Instagram className="h-4 w-4 text-[#DD2A7B]" />Instagram</a>}
            </div>
          </Reveal>
          <StoryCollage images={[story.image, ...branches.map((b: any) => b.image_url), '/images/occasion-farewell.webp'].filter(Boolean).slice(0, 4)} />
        </div>
      </section>

      {/* Numbers */}
      <section className="container-page -mt-8">
        <div className="grid grid-cols-2 gap-3 rounded-[28px] border border-line bg-white p-3 shadow-card sm:grid-cols-4">
          {[
            [`${stats.rating.toFixed(1)}`, 'Google rating', true],
            [`${branches.length}`, 'Branches in Bengaluru'],
            [`${theatres.length}`, 'Private theatres'],
            [stats.celebrations ? `${stats.celebrations.toLocaleString('en-IN')}+` : '1000s', 'Celebrations hosted'],
          ].map(([v, l, star], i) => (
            <Reveal key={String(l)} delay={i * 0.06} className="rounded-2xl bg-cream px-4 py-5 text-center">
              <p className="flex items-center justify-center gap-1 font-display text-4xl text-brand-700">{v}{star && <Star className="h-5 w-5 fill-amber-400 text-amber-400" />}</p>
              <p className="mt-1 text-xs font-medium text-navy-soft">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Story timeline */}
      <section className="container-page py-24">
        <div className="mx-auto max-w-3xl">
          <ol className="relative space-y-12 border-l-2 border-dashed border-brand-200 pl-8">
            {[
              ['The idea', paragraphs[0] || ''],
              ['The rooms', paragraphs[1] || 'Every room has a big screen, Dolby sound, recliners and a decorated celebration corner.'],
              ['Today', `${branches.map((b: any) => b.name).join(' and ')} — ${theatres.length} private theatres hosting birthdays, anniversaries, proposals and family movie nights every day.`],
            ].map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <li className="relative">
                  <span className="absolute -left-[43px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 ring-4 ring-cream"><span className="h-2 w-2 rounded-full bg-white" /></span>
                  <h2 className="text-3xl">{t}</h2>
                  <p className="mt-3 text-lg leading-relaxed text-navy-soft">{d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          {story.quote && (
            <Reveal className="mt-16">
              <blockquote className="rounded-[28px] bg-navy px-8 py-10 text-center font-display text-3xl italic leading-snug text-cream sm:text-4xl">“{story.quote}”</blockquote>
            </Reveal>
          )}
        </div>
      </section>

      {/* Values */}
      <section className="bg-cream-deep/60 py-24">
        <div className="container-page">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">What we care about</p>
            <h2 className="mt-3 text-4xl sm:text-5xl">Every celebration, <span className="italic text-brand-600">done right</span></h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.07}>
                <div className="h-full rounded-3xl border border-line bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                  <span className="font-display text-3xl text-brand-400">✦</span>
                  <h3 className="mt-3 font-sans text-lg font-semibold">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy-soft">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Branches */}
      <section className="container-page py-24">
        <Reveal className="text-center"><p className="eyebrow">Visit us</p><h2 className="mt-3 text-4xl sm:text-5xl">Two homes for your <span className="italic text-brand-600">celebrations</span></h2></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {branches.map((b: any, i: number) => (
            <Reveal key={b.slug} delay={i * 0.08}>
              <article className="group overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
                <div className="relative aspect-[16/10] overflow-hidden">
                  {b.image_url && <Image src={b.image_url} alt={b.name} fill sizes="(min-width: 768px) 75vw, 100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />}
                </div>
                <div className="p-6">
                  <h3 className="text-3xl">{b.name}</h3>
                  <p className="mt-2 flex gap-2 text-sm leading-relaxed text-navy-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{b.address}</p>
                  <p className="mt-1 text-sm text-navy-soft">{theatres.filter((t: any) => t.branch_id === b.id).map((t: any) => t.name).join(' · ')}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link href={`/book?branch=${b.slug}`} className="inline-flex h-10 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">Book here</Link>
                    {b.map_url && <a href={b.map_url} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line px-4 text-sm font-semibold transition hover:border-brand-300"><MapPin className="h-4 w-4 text-brand-600" />Directions</a>}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Words from guests */}
      {testimonials.length > 0 && (
        <section className="bg-gradient-to-b from-brand-50/70 to-cream py-24">
          <div className="container-page">
            <Reveal className="text-center"><p className="eyebrow">In their words</p><h2 className="mt-3 text-4xl sm:text-5xl">Why guests come back</h2></Reveal>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t: any, i: number) => (
                <Reveal key={t.id} delay={i * 0.08}>
                  <figure className="h-full rounded-3xl border border-line bg-white p-6 shadow-card">
                    <div className="flex">{Array.from({ length: t.rating }).map((_, k) => <Star key={k} className="h-4 w-4 fill-amber-400 text-amber-400" />)}</div>
                    <blockquote className="mt-3 line-clamp-6 leading-relaxed">{t.text}</blockquote>
                    <figcaption className="mt-4 text-sm font-semibold">{t.name}<span className="font-normal text-navy-soft"> · {t.occasion}</span></figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="container-page pb-24 pt-8">
        <Reveal className="rounded-[32px] bg-navy px-6 py-12 text-center text-cream sm:px-12">
          <h2 className="text-4xl text-cream sm:text-5xl">Let&apos;s plan your <span className="italic text-brand-300">moment</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-cream/75">Questions about slots, decor or cakes? We reply fast.</p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contacts.map((c) => (
              <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:bg-white/10">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-white ${c.tone}`}><c.icon className="h-5 w-5" /></span>
                <span className="text-sm font-semibold">{c.label}</span>
                <span className="max-w-full truncate text-xs text-cream/65">{c.sub}</span>
              </a>
            ))}
          </div>
        </Reveal>
      </section>
    </>
  );
}
