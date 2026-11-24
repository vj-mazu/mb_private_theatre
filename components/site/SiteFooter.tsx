import Link from 'next/link';
import type { Settings } from '@/lib/server/catalog';
import { Logo } from './Logo';

const EXPLORE = [
  ['/', 'Home'], ['/our-story', 'Our story'], ['/#theatres', 'Venues'], ['/#packages', 'Packages'],
  ['/#reviews', 'Reviews'], ['/gallery', 'Gallery'], ['/#faq', 'FAQ'], ['/book', 'Book now'],
];
const POLICIES = [['/terms-and-conditions', 'Terms & conditions'], ['/refund-policy', 'Refund & cancellation'], ['/privacy-policy', 'Privacy policy']];

export function SiteFooter({ settings, branches }: { settings: Settings; branches: any[] }) {
  const b = settings.business;
  return (
    <footer className="border-t border-line bg-cream-deep/60">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo className="h-11" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-navy-soft">Private theatres for birthdays, anniversaries, proposals and movie nights in Bengaluru.</p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            {b.instagram && <a className="rounded-lg border border-line px-3 py-1.5 font-medium transition hover:border-brand-300 hover:text-brand-700" href={b.instagram} target="_blank" rel="noreferrer">Instagram</a>}
          </div>
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold">Explore</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-soft">
            {EXPLORE.map(([href, label]) => <li key={href}><Link href={href} className="transition hover:text-brand-700">{label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="font-sans text-sm font-bold">Policies</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-soft">
            {POLICIES.map(([href, label]) => <li key={href}><Link href={href} className="transition hover:text-brand-700">{label}</Link></li>)}
          </ul>
          <h3 className="mt-8 font-sans text-sm font-bold">Contact</h3>
          <ul className="mt-4 space-y-2.5 text-sm text-navy-soft">
            {b.phone && <li><a className="transition hover:text-brand-700" href={`tel:${b.phone.replace(/\s/g, '')}`}>{b.phone}</a></li>}
            {b.email && <li><a className="transition hover:text-brand-700" href={`mailto:${b.email}`}>{b.email}</a></li>}
          </ul>
        </div>
        <div className="space-y-6">
          {branches.map((br) => (
            <div key={br.slug}>
              <h3 className="font-sans text-sm font-bold">{br.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-soft">{br.address}</p>
              {br.map_url && <a href={br.map_url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-sm font-semibold text-brand-700 hover:underline">Get directions →</a>}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Movie Bash. All rights reserved.</p>
          <p>Electronic City · BTM 1st Stage · Bengaluru</p>
        </div>
      </div>
    </footer>
  );
}
