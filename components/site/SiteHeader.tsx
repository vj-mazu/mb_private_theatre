'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Phone, Instagram, MapPin, MessageCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { Logo } from './Logo';
import { cn } from '@/components/ui';

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/our-story', label: 'Our story', mega: true },
  { href: '/#theatres', label: 'Venues' },
  { href: '/#packages', label: 'Packages' },
  { href: '/#reviews', label: 'Reviews' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/#contact', label: 'Contact' },
];

interface Business { phone: string; whatsapp: string; instagram: string; email: string }

function quickLinks(b: Business) {
  const wa = b.whatsapp?.replace(/\D/g, '');
  return [
    b.phone && { href: `tel:${b.phone.replace(/\s/g, '')}`, label: 'Call us', sub: b.phone, icon: Phone, tone: 'bg-brand-600' },
    wa && { href: `https://wa.me/${wa}?text=${encodeURIComponent('Hi Movie Bash, I would like to book a celebration.')}`, label: 'WhatsApp', sub: 'Chat with us', icon: MessageCircle, tone: 'bg-[#25D366]' },
    b.instagram && { href: b.instagram, label: 'Instagram', sub: 'See real setups', icon: Instagram, tone: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]' },
  ].filter(Boolean) as { href: string; label: string; sub: string; icon: any; tone: string }[];
}

function Socials({ b, className }: { b: Business; className?: string }) {
  const items = [
    b.instagram && { href: b.instagram, icon: Instagram, label: 'Instagram' },
  ].filter(Boolean) as { href: string; icon: any; label: string }[];
  return (
    <div className={cn('flex gap-2', className)}>
      {items.map(({ href, icon: Icon, label }) => (
        <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-cream-card text-navy-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:text-brand-700">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

/** Solid fixed header with an "Our story" mega panel (about + quick links + socials). */
export function SiteHeader({ business, branches, bar }: { business: Business; branches: any[]; bar?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const [height, setHeight] = useState(0);
  const ref = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => { setOpen(false); setMega(false); }, [pathname]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => {
      setHeight(e.contentRect.height);
      // Lets full-screen sections (the home hero) fill exactly the space below the header.
      // The open phone menu is left out, so the hero does not resize while the menu is open.
      const bars = Array.from((e.target as HTMLElement).children).filter((c) => c.tagName !== 'NAV');
      const h = bars.reduce((sum, c) => sum + c.getBoundingClientRect().height, 0);
      document.documentElement.style.setProperty('--chrome-h', `${Math.round(h)}px`);
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const showMega = () => { clearTimeout(closeTimer.current); setMega(true); };
  const hideMega = () => { closeTimer.current = setTimeout(() => setMega(false), 160); };
  const links = quickLinks(business);

  return (
    <>
      <header data-site-chrome ref={ref} className="fixed inset-x-0 top-0 z-40">
        {bar && <div className="bg-navy px-4 py-2 text-center text-xs font-medium text-cream sm:text-sm">{bar}</div>}
        <div className={cn('relative border-b transition-all duration-500 ease-smooth',
          scrolled ? 'glass glass-glow border-white/30' : 'border-transparent bg-cream')}>
          <div className="container-page flex h-[72px] items-center justify-between gap-4">
            <Link href="/" aria-label="Movie Bash home"><Logo className="h-10" /></Link>

            <nav className="hidden items-center gap-0.5 xl:flex">
              {NAV_LINKS.map((l) => {
                const active = l.href === '/' ? pathname === '/' : l.href === pathname;
                const megaLink = 'mega' in l && l.mega;
                return (
                  <div key={l.href} onMouseEnter={megaLink ? showMega : undefined} onMouseLeave={megaLink ? hideMega : undefined}>
                    <Link href={l.href} onFocus={megaLink ? showMega : undefined}
                      className={cn('group relative flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-300',
                        active || (megaLink && mega) ? 'text-navy' : 'text-navy-soft hover:text-navy')}>
                      {l.label}
                      {megaLink && <ChevronDown className={cn('h-3.5 w-3.5 transition-transform duration-300', mega && 'rotate-180')} />}
                      <span className={cn('absolute inset-x-3.5 bottom-1 h-0.5 origin-left rounded-full bg-brand-500 transition-transform duration-300 ease-smooth',
                        active || (megaLink && mega) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
                    </Link>
                  </div>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <Socials b={business} className="hidden 2xl:flex" />
              <Link href="/book" className="inline-flex h-11 items-center rounded-full bg-brand-600 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_-10px_rgba(42,155,217,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand-700">
                Book now
              </Link>
              <button suppressHydrationWarning onClick={() => setOpen(!open)} className="rounded-full p-2.5 text-navy transition xl:hidden" aria-label="Menu" aria-expanded={open}>
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* "Our story" mega panel */}
          <AnimatePresence>
            {mega && (
              <motion.div onMouseEnter={showMega} onMouseLeave={hideMega}
                className="absolute inset-x-0 top-full hidden xl:block" style={{ perspective: 1200 }}>
                <motion.div className="container-page origin-top"
                  initial={{ opacity: 0, rotateX: -14, y: -8 }} animate={{ opacity: 1, rotateX: 0, y: 0 }} exit={{ opacity: 0, rotateX: -10, y: -6 }}
                  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
                  <div className="mt-2 grid grid-cols-[1.2fr_1fr_1fr] gap-6 overflow-hidden rounded-3xl glass-strong glass-glow-strong p-6">
                    <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 }}>
                      <p className="eyebrow">About Movie Bash</p>
                      <p className="mt-3 font-display text-2xl leading-snug">Private theatres made for celebrations.</p>
                      <p className="mt-2 text-sm leading-relaxed text-navy-soft">Birthdays, anniversaries, proposals and movie nights — with decor, cake and a big screen that&apos;s all yours.</p>
                      <Link href="/our-story" onClick={() => setMega(false)} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 transition-all hover:gap-2.5">Read our story <ArrowRight className="h-4 w-4" /></Link>
                      <Socials b={business} className="mt-5" />
                    </motion.div>
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-faint">Quick links</p>
                      {links.map((q, i) => (
                        <motion.a key={q.label} href={q.href} target={q.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                          className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
                          <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl text-white', q.tone)}><q.icon className="h-5 w-5" /></span>
                          <span><span className="block text-sm font-semibold">{q.label}</span><span className="block text-xs text-navy-soft">{q.sub}</span></span>
                          <ArrowRight className="ml-auto h-4 w-4 text-navy-faint transition-transform group-hover:translate-x-1" />
                        </motion.a>
                      ))}
                    </div>
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-navy-faint">Visit us</p>
                      {branches.map((br, i) => (
                        <motion.a key={br.slug} href={br.map_url || '#'} target="_blank" rel="noreferrer"
                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 + i * 0.06 }}
                          className="group block rounded-2xl border border-line bg-white p-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card">
                          <span className="flex items-center gap-2 text-sm font-semibold"><MapPin className="h-4 w-4 text-brand-600" />{br.name}</span>
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-navy-soft">{br.address}</span>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {open && (
            <motion.nav initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="max-h-[80vh] overflow-y-auto border-b border-white/30 glass xl:hidden">
              <div className="container-page py-3">
                {NAV_LINKS.map((l, i) => (
                  <motion.div key={l.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.035 * i }}>
                    <Link href={l.href} onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-base font-medium text-navy hover:bg-brand-50">{l.label}</Link>
                  </motion.div>
                ))}
                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-4">
                  {links.map((q) => (
                    <a key={q.label} href={q.href} target={q.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer"
                      className="flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-white py-3 text-xs font-semibold">
                      <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl text-white', q.tone)}><q.icon className="h-4 w-4" /></span>{q.label}
                    </a>
                  ))}
                </div>
                <Socials b={business} className="mt-4 justify-center" />
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
      <div data-site-chrome aria-hidden style={{ height: height || 72 }} />
    </>
  );
}
