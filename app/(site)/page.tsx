import Image from '@/components/Img';
import Link from 'next/link';
import { MapPin, Phone, ArrowRight, MessageCircle, PartyPopper } from 'lucide-react';
import { getCatalog } from '@/lib/server/catalog';
import { getLivePromos } from '@/lib/server/promos';
import { getHomeGallery, getShowcaseVideos } from '@/lib/server/content';
import { HeroStage, type HeroSlide } from '@/components/site/HeroStage';
import { IntroLoader } from '@/components/site/IntroLoader';
import { TheatresSection } from '@/components/site/TheatresSection';
import { PackageSpotlight } from '@/components/site/PackageSpotlight';
import { Testimonials } from '@/components/site/Testimonials';
import { EnquiryForm } from '@/components/site/EnquiryForm';
import { Reveal } from '@/components/site/Reveal';
import { InstagramReels } from '@/components/site/InstagramReels';
import { CelebrationVideos } from '@/components/site/CelebrationVideos';
import { StoryScroll, type StoryChapter } from '@/components/site/StoryScroll';
import { inr, priceTiers } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Private Theatre for Birthdays & Anniversaries in Bengaluru',
  description: 'Celebrate in your own private theatre at Movie Bash, Electronic City & BTM 2nd Stage. Decor, cake, fog entry and a 4K screen — book online in two minutes.',
  alternates: { canonical: '/' },
};

const STEPS = [
  ['Pick your slot', 'Choose branch, theatre, date and time — live availability.'],
  ['Package & cake', 'Pick a package or go custom, then your cake flavour and extras.'],
  ['Pay the advance', 'Scan the UPI QR, pay the advance and upload the screenshot.'],
  ['Get your ticket', 'Ticket with location on screen and on WhatsApp instantly.'],
];

function Heading({ eyebrow, title, accent, text, center = true }: { eyebrow: string; title: string; accent?: string; text?: string; center?: boolean }) {
  return (
    <Reveal className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-5xl">{title}{accent && <> <span className="italic text-brand-600">{accent}</span></>}</h2>
      {text && <p className="mt-4 text-lg text-navy-soft">{text}</p>}
    </Reveal>
  );
}

export default async function Home() {
  const [catalog, gallery, promos, videos] = await Promise.all([
    getCatalog(),
    getHomeGallery(),
    getLivePromos(),
    getShowcaseVideos(),
  ]);
  const { branches, theatres, packages, customPackage, cakes, addons, occasions, settings, testimonials, faqs } = catalog;
  const lowest = theatres.length ? Math.min(...theatres.map((t) => t.base_price)) : 0;
  const heroImages = settings.hero.images.length ? settings.hero.images : ['/images/hero_8388.webp'];
  const { rating, reviews } = settings.stats;
  const story = settings.story;
  const storyChapters: StoryChapter[] = [
    { title: story.title, body: story.body, quote: story.quote, image: story.image },
    ...branches.map((b: any): StoryChapter => {
      const count = theatres.filter((t) => t.branch_id === b.id).length;
      // Admin → Website → Story cards; empty text/photo falls back to the address and the branch photo.
      return {
        title: b.name,
        body: b.story_text?.trim() || `${b.address}

${count} private ${count === 1 ? 'theatre' : 'theatres'} · pick a slot online in under two minutes.`,
        image: b.story_image || b.image_url || story.image,
        cta: { href: `/book?branch=${b.slug}`, label: `Book ${b.name}` }, mapUrl: b.map_url,
      };
    }),
  ];
  // Hero slides = active occasions with a photo (Admin → Website → Hero slides), in their display order.
  const withPhoto = occasions.filter((o: any) => o.image_url);
  const heroSlides: HeroSlide[] = withPhoto.length
    ? withPhoto.map((o: any) => ({ name: o.name, image: o.image_url, href: `/book?occasion=${encodeURIComponent(o.name)}` }))
    : heroImages.map((img, k) => ({ name: ['Kids Birthday', 'Anniversary', 'Date night', 'Celebration'][k % 4], image: img, href: '/book' }));
  const ticker = occasions.length ? occasions.map((o: any) => o.name) : ['Birthdays', 'Anniversaries', 'Proposals', 'Movie nights'];

  return (
    <>
      {/* ---------- Hero ---------- */}
      <HeroStage title={settings.hero.title} slides={heroSlides} rating={rating} from={inr(lowest)} />
      {/* Rendered after the hero so the page's first element is not position:fixed (keeps Next's scroll-to-top working). */}
      <IntroLoader />

      <section>
        {/* Occasions ticker */}
        <div className="bg-brand-600 py-4 text-white">
          <div className="flex overflow-hidden">
            <div className="flex shrink-0 animate-marquee items-center gap-8 pr-8">
              {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
                <span key={i} className="flex items-center gap-8 whitespace-nowrap font-display text-xl italic">{t}<span className="text-sm not-italic text-white/70">•</span></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Offers (admin-managed banner ads) ---------- */}
      {promos.some((pr) => pr.placement === 'banner') && (
        <section className="container-page pt-16">
          <div className="grid gap-4 md:grid-cols-2">
            {promos.filter((pr) => pr.placement === 'banner').map((pr, k) => (
              <Reveal key={pr.id} delay={k * 0.08}>
                <Link href={pr.link_url || '/book'} className="group relative flex h-full min-h-[180px] overflow-hidden rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lift">
                  {pr.image_url && <Image src={pr.image_url} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-40 transition-transform duration-700 ease-smooth group-hover:scale-105" />}
                  <div className="relative flex flex-col justify-center p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Offer</p>
                    <h3 className="mt-2 text-3xl text-white">{pr.title}</h3>
                    {pr.text && <p className="mt-1 max-w-md text-white/85">{pr.text}</p>}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      {pr.coupon_code && <span className="rounded-lg border-2 border-dashed border-white/70 px-3 py-1 font-mono text-sm font-bold tracking-wider">{pr.coupon_code}</span>}
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5">{pr.button_label || 'Book now'} <ArrowRight className="h-4 w-4" /></span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Our story (3D scroll) ---------- */}
      {story.title && (
        <section id="story" className="scroll-mt-0">
          <StoryScroll chapters={storyChapters} heading={<>
            <p className="eyebrow">Our story</p>
            <h2 className="mt-3 text-3xl sm:text-5xl">One idea, <span className="italic text-brand-600">two homes for celebrations</span></h2>
            <Link href="/our-story" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-all hover:gap-2.5">Read the full story <ArrowRight className="h-4 w-4" /></Link>
          </>} />
        </section>
      )}

      {/* ---------- Venues ---------- */}
      <section id="theatres" className="scroll-mt-20 bg-cream-deep/50 py-24">
        <div className="container-page text-center">
          <Heading eyebrow="Our venues" title="Pick the room for" accent="your moment" text="Every theatre has a big screen, Dolby sound, comfortable recliners and a decorated celebration corner." />
          <TheatresSection branches={branches} theatres={theatres} />
        </div>
      </section>

      {/* ---------- Packages: colourful 3D menu ---------- */}
      <PackageSpotlight branches={branches} theatres={theatres} packages={packages} customPackage={customPackage} />

      {/* ---------- Celebration videos (Admin → Website → Videos) ---------- */}
      {videos.length > 0 && (
      <section id="videos" className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-cream via-[#F4F8FC] to-cream py-24">
        <div aria-hidden className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(231,199,125,0.28),transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,rgba(22,125,186,0.16),transparent)]" />
        <div className="container-page relative">
          <Heading eyebrow="See it live" title="Our celebrations," accent="in motion" text="Real setups from our Electronic City rooms. Tap a video to play." />
          <CelebrationVideos videos={videos} />
        </div>
      </section>
      )}

      {/* ---------- Cakes ---------- */}
      <section id="cakes" className="scroll-mt-20 bg-cream-deep/60 py-24">
        <div className="container-page">
          <Heading eyebrow="Cake menu" title="Choose your" accent="cake flavour" text="A fresh 500g cake comes with every package. Cake designs may vary slightly." />
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {cakes.map((c: any, i: number) => (
              <Reveal key={c.id} delay={(i % 4) * 0.06} className="h-full">
                <figure className="group flex h-full flex-col rounded-3xl bg-cream-card p-2 shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[#E1C9AF]">
                    <Image src={c.image_url} alt={`${c.name} cake`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]" />
                  </div>
                  <figcaption className="flex flex-1 items-center justify-center px-2 pb-2 pt-3 text-center font-display text-lg leading-tight">{c.name}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>

          {addons.length > 0 && (
            <div className="mt-24">
              <Heading eyebrow="Add-ons" title="Make it" accent="extra special" />
              <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                {addons.map((a: any, i: number) => (
                  <Reveal key={a.id} delay={(i % 4) * 0.06} className="h-full">
                    <figure className="group flex h-full flex-col rounded-3xl bg-cream-card p-2 shadow-card transition-all duration-500 ease-smooth hover:-translate-y-1 hover:shadow-lift">
                      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-brand-50">
                        {a.image_url
                          ? <Image src={a.image_url} alt={a.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-[1.06]" />
                          : <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-300 via-brand-400 to-brand-600 text-white"><PartyPopper className="h-14 w-14" /></span>}
                        <span className="absolute right-2.5 top-2.5 rounded-full bg-cream/95 px-3 py-1 text-sm font-bold text-brand-700 shadow-card backdrop-blur">
                          {priceTiers(a)[0] ? <>{inr(priceTiers(a)[0].price)}<span className="font-medium text-navy-soft"> / {priceTiers(a)[0].label}</span></> : inr(a.price)}
                        </span>
                      </div>
                      <figcaption className="flex flex-1 flex-col items-center justify-center px-2 pb-2 pt-3 text-center">
                        <span className="font-display text-lg leading-tight">{a.name}</span>
                        {a.description && <span className="mt-1 line-clamp-2 text-xs text-navy-soft">{a.description}</span>}
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="relative overflow-hidden bg-navy py-24 text-cream">
        <div aria-hidden className="absolute -right-24 -top-24 h-72 w-72 animate-spin-slow rounded-full border border-dashed border-brand-300/30" />
        <div className="container-page relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">How booking works</p>
            <h2 className="mt-3 text-3xl text-cream sm:text-5xl">Booked in <span className="italic text-brand-300">two minutes</span></h2>
          </Reveal>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([t, d], i) => (
              <Reveal key={t} delay={i * 0.1}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-brand-300/40 hover:bg-white/[0.07]">
                  <span className="font-display text-4xl text-brand-300">0{i + 1}</span>
                  <h3 className="mt-4 font-sans text-lg font-semibold text-cream">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/70">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/book" className="inline-flex h-14 items-center gap-2 rounded-2xl bg-brand-400 px-8 text-base font-semibold text-navy transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-300">Start booking <ArrowRight className="h-5 w-5" /></Link>
          </div>
        </div>
      </section>

      {/* ---------- Testimonials ---------- */}
      <Testimonials items={testimonials} rating={rating} reviews={reviews} />

      {/* ---------- Gallery ---------- */}
      {gallery.length > 0 && (
        <section className="container-page py-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <Heading eyebrow="Gallery" title="Real moments," accent="real setups" center={false} />
            <Link href="/gallery" className="inline-flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold transition-all hover:gap-2.5 hover:border-brand-300">View all photos <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-10 grid auto-rows-[150px] grid-cols-2 gap-3 [grid-auto-flow:dense] sm:auto-rows-[200px] md:grid-cols-4">
            {gallery.map((g: any, i: number) => (
              <Reveal key={g.id} delay={(i % 4) * 0.06} className={i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'row-span-2' : ''}>
                <Link href="/gallery" className="group relative block h-full overflow-hidden rounded-3xl bg-cream-deep">
                  <Image src={g.image_url} alt={g.caption || 'Movie Bash celebration'} fill sizes={i === 0 ? '75vw' : '38vw'} className="object-cover transition-transform duration-700 ease-smooth group-hover:scale-105" />
                </Link>
              </Reveal>
            ))}
          </div>
          <InstagramReels urls={settings.reels.urls} profile={settings.business.instagram} />
        </section>
      )}

      {/* ---------- FAQ ---------- */}
      {faqs.length > 0 && (
        <section id="faq" className="scroll-mt-20 bg-cream-deep/50 py-24">
          <div className="container-page grid gap-12 lg:grid-cols-[1fr_1.4fr]">
            <Heading eyebrow="FAQ" title="Good" accent="to know" text="Anything else? Message us on WhatsApp — we reply fast." center={false} />
            <Reveal className="divide-y divide-line rounded-3xl border border-line bg-cream-card">
              {faqs.map((f: any) => (
                <details key={f.id} className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold transition-colors group-open:text-brand-700">
                    {f.question}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-lg leading-none text-brand-600 transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 leading-relaxed text-navy-soft">{f.answer}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ---------- Enquiry / contact ---------- */}
      <section id="contact" className="container-page scroll-mt-20 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <div>
            <Heading eyebrow="Enquire" title="Plan your" accent="celebration" text="Tell us what you have in mind and we'll get back to you with the best slot and setup." center={false} />
            <div className="mt-8 space-y-4">
              {branches.map((b: any, i: number) => (
                <Reveal key={b.id} delay={i * 0.08}>
                  <div className="rounded-3xl border border-line bg-cream-card p-5 transition-shadow hover:shadow-card">
                    <h3 className="text-xl">{b.name}</h3>
                    <p className="mt-2 flex gap-2 text-sm leading-relaxed text-navy-soft"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />{b.address}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {b.map_url && <a href={b.map_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand-600 px-3 text-xs font-semibold text-white transition hover:bg-brand-700"><MapPin className="h-3.5 w-3.5" />Directions</a>}
                      {b.phone && <a href={`tel:${b.phone.replace(/\s/g, '')}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold transition hover:bg-cream-deep"><Phone className="h-3.5 w-3.5" />Call</a>}
                      {settings.business.whatsapp && <a href={`https://wa.me/${settings.business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold transition hover:bg-cream-deep"><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <Reveal delay={0.1}><EnquiryForm branches={branches} occasions={occasions} /></Reveal>
        </div>
      </section>
    </>
  );
}
