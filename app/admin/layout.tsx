'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Film, 
  LayoutDashboard, 
  CalendarCheck, 
  Trash2, 
  TrendingUp, 
  Settings, 
  Menu, 
  X, 
  LogOut, 
  ExternalLink,
  Shield,
  Layers
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // If on login page, skip admin layout shell
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!isLoginPage) {
      fetch('/api/admin/me')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setCurrentUser(data.data);
          } else {
            router.push('/admin/login');
          }
        })
        .catch(() => router.push('/admin/login'));
    }
  }, [isLoginPage, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
    { label: 'Deleted / Cancelled', href: '/admin/deleted', icon: Trash2 },
    { label: 'Revenue / Reports', href: '/admin/reports', icon: TrendingUp },
    { label: 'CMS & Settings', href: '/admin/cms', icon: Layers },
    { label: 'Security & Staff', href: '/admin/security', icon: Shield },
  ];

  return (
    <div className="min-h-screen flex bg-sand-50">
      
      {/* Desktop Dark-Royal Sidebar */}
      <aside className="hidden lg:flex w-64 bg-royal-950 text-white flex-col justify-between border-r border-royal-900 shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-royal-900 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-royal-700 text-amber-400 flex items-center justify-center font-black">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="font-playfair text-lg font-black tracking-tight block leading-none">
                MOVIE<span className="text-royal-400">BASH</span>
              </span>
              <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-royal-700 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-royal-900 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 text-amber-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-royal-900 space-y-3">
          <div className="px-3 py-2 rounded-xl bg-royal-900/60 text-xs">
            <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">Signed in as</span>
            <span className="font-bold text-white block truncate">{currentUser?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-300 capitalize">{currentUser?.role?.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Mobile Bar */}
        <header className="lg:hidden bg-royal-950 text-white p-4 flex items-center justify-between border-b border-royal-900">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-royal-700 text-amber-400 flex items-center justify-center font-black">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-playfair text-base font-bold">Movie Bash Admin</span>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-lg bg-royal-900 text-slate-200"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden bg-royal-950 text-white p-4 border-b border-royal-900 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold ${
                  pathname === item.href ? 'bg-royal-700 text-white' : 'text-slate-200'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-royal-900 flex justify-between">
              <Link href="/" target="_blank" className="text-xs text-slate-300">View Public Site</Link>
              <button onClick={handleLogout} className="text-xs text-rose-400">Logout</button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="p-4 sm:p-8 flex-1">
          {children}
        </main>
      </div>

    </div>
  );
}
