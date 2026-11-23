import { Star, Quote } from 'lucide-react';

function Stars({ n = 5, className = 'h-4 w-4' }: { n?: number; className?: string }) {
  return (
    <span className="flex gap-0.5" role="img" aria-label={`${n} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`${className} ${i < n ? 'fill-amber-400 text-amber-400' : 'text-line'}`} />)}
    </span>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" />
    </svg>
  );
}

function Card({ t }: { t: any }) {
  return (
    <figure className="w-[320px] shrink-0 rounded-3xl border border-line bg-cream-card p-6 shadow-card sm:w-[380px]">
      <div className="flex items-center justify-between">
        <Stars n={t.rating} />
        <Quote className="h-6 w-6 text-brand-200" />
      </div>
      <blockquote className="mt-4 line-clamp-5 text-[15px] leading-relaxed text-navy">{t.text}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-display text-lg text-brand-700">{t.name[0]}</span>
        <span>
          <span className="block text-sm font-semibold">{t.name}</span>
          {t.occasion && <span className="block text-xs text-navy-soft">{t.occasion}</span>}
        </span>
      </figcaption>
    </figure>
  );
}

export function Testimonials({ items, rating, reviews }: { items: any[]; rating: number; reviews: number }) {
  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);
  const rows = [items.slice(0, half), items.slice(half).length ? items.slice(half) : items];
  return (
    <section id="reviews" className="scroll-mt-20 overflow-hidden bg-gradient-to-b from-brand-50/70 to-cream py-24">
      <div className="container-page text-center">
        <p className="eyebrow">Reviews</p>
        <h2 className="mt-3 text-3xl sm:text-5xl">Loved by every <span className="italic text-brand-600">celebration</span></h2>
        <div className="mx-auto mt-8 inline-flex items-center gap-4 rounded-2xl border border-line bg-cream-card px-6 py-4 shadow-card">
          <GoogleG />
          <div className="text-left">
            <div className="flex items-center gap-2"><span className="text-3xl font-bold">{rating.toFixed(1)}</span><Stars className="h-5 w-5" /></div>
            <p className="text-xs text-navy-soft">Google rating{reviews ? ` · ${reviews.toLocaleString('en-IN')} reviews` : ''}</p>
          </div>
        </div>
      </div>
      <div className="mt-12 space-y-5 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        {rows.map((row, r) => (
          <div key={r} className="group flex overflow-hidden">
            <div className={`flex gap-5 pr-5 group-hover:[animation-play-state:paused] ${r === 0 ? 'animate-marquee-slow' : 'animate-marquee-slow [animation-direction:reverse]'}`}>
              {[...row, ...row, ...row, ...row].map((t, i) => <Card key={`${t.id}-${i}`} t={t} />)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
