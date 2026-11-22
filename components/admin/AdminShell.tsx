'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard, CalendarCheck, PlusCircle, Store, Images, TicketPercent, Users, MessageCircle, Settings, LogOut, Menu, X, ExternalLink,
  IndianRupee, Inbox, Globe, Megaphone, ArrowLeft, Ban,
} from 'lucide-react';
import { cn } from '@/components/ui';
import { Logo } from '@/components/site/Logo';

type NavItem = { href: string; label: string; icon: any; admin: boolean; exact?: boolean; badge?: 'verify' | 'enquiries' };
const GROUPS: { title: string; items: NavItem[] }[] = [
  { title: 'Daily', items: [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, admin: false, exact: true },
    { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck, admin: false, badge: 'verify' },
    { href: '/admin/bookings/new', label: 'New booking', icon: PlusCircle, admin: false },
    { href: '/admin/enquiries', label: 'Enquiries', icon: Inbox, admin: true, badge: 'enquiries' },
    { href: '/admin/blocks', label: 'Block slots', icon: Ban, admin: true },
  ] },
  { title: 'Business', items: [
    { href: '/admin/revenue', label: 'Revenue', icon: IndianRupee, admin: true },
    { href: '/admin/coupons', label: 'Coupons', icon: TicketPercent, admin: true },
    { href: '/admin/promotions', label: 'Promotions & ads', icon: Megaphone, admin: true },
    { href: '/admin/whatsapp', label: 'WhatsApp log', icon: MessageCircle, admin: true },
  ] },
  { title: 'Content', items: [
    { href: '/admin/catalog', label: 'Branches & packages', icon: Store, admin: true },
    { href: '/admin/gallery', label: 'Gallery', icon: Images, admin: true },
    { href: '/admin/website', label: 'Website', icon: Globe, admin: true },
  ] },
  { title: 'System', items: [
    { href: '/admin/staff', label: 'Staff', icon: Users, admin: true },
    { href: '/admin/settings', label: 'Settings & backup', icon: Settings, admin: true },
  ] },
];

export function AdminShell({ user, children }: { user: { name: string; role: string }; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [badges, setBadges] = useState<{ verify: number; enquiries: number }>({ verify: 0, enquiries: 0 });
  useEffect(() => setOpen(false), [pathname]);

  // Live counts for the sidebar (payments waiting for verification, new enquiries).
  useEffect(() => {
    let alive = true;
    const load = () => fetch('/api/admin/badges').then((r) => r.json()).then((j) => { if (alive && j.ok) setBadges(j.data); }).catch(() => {});
    load();
    const t = setInterval(load, 45_000);
    return () => { alive = false; clearInterval(t); };
  }, [pathname]);

  const groups = GROUPS.map((g) => ({ ...g, items: g.items.filter((n) => !n.admin || user.role === 'admin') })).filter((g) => g.items.length);
  const items = groups.flatMap((g) => g.items);
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || (pathname.startsWith(href + '/') && !items.some((i) => i.href !== href && pathname.startsWith(i.href) && i.href.length > href.length));

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
  }

  const nav = (
    <nav className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5"><Logo className="h-9" /></div>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-3 pt-1">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-navy-faint">{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map(({ href, label, icon: Icon, exact, badge }) => {
                const active = isActive(href, exact);
                const count = badge ? badges[badge] : 0;
                return (
                  <Link key={href} href={href}
                    className={cn('relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                      active ? 'text-navy' : 'text-navy-soft hover:bg-cream-deep hover:text-navy')}>
                    {active && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-brand-100" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                    <Icon className="relative h-[18px] w-[18px]" />
                    <span className="relative flex-1">{label}</span>
                    {count > 0 && <span className="relative min-w-[22px] rounded-full bg-amber-500 px-1.5 py-0.5 text-center text-[11px] font-bold leading-none text-white">{count}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-line p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-navy-soft hover:bg-cream-deep hover:text-navy">
          <ExternalLink className="h-4 w-4" /> View website
        </Link>
        <div className="mt-1 flex items-center justify-between rounded-xl px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="text-xs capitalize text-navy-faint">{user.role}</p>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-navy-soft transition hover:bg-red-50 hover:text-red-600" aria-label="Sign out">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-cream-card lg:block">{nav}</aside>

      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-cream-card/90 px-4 backdrop-blur lg:hidden">
        <Logo className="h-8" />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-cream-deep" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div className="absolute inset-0 bg-navy/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 bg-cream-card shadow-lift"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}>
              <button onClick={() => setOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 hover:bg-cream-deep" aria-label="Close menu"><X className="h-5 w-5" /></button>
              {nav}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
          {pathname !== '/admin' && (
            <button onClick={() => (window.history.length > 1 ? router.back() : router.push(pathname.split('/').slice(0, -1).join('/') || '/admin'))}
              className="group mb-4 inline-flex items-center gap-1.5 rounded-full border border-line bg-cream-card px-3 py-1.5 text-sm font-medium text-navy-soft transition hover:border-brand-300 hover:text-navy">
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />Back
            </button>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-navy-soft">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
