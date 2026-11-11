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
    <div className="min-h-screen flex bg-cream text-ink">
      
      {/* Desktop Royal Sky Blue & Cream Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white text-ink flex-col justify-between border-r border-sky-100 shadow-[2px_0_20px_rgba(35,126,234,0.03)] shrink-0">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-sky-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#237eea] text-white flex items-center justify-center font-black shadow-md shadow-[#237eea]/25">
              <Film className="w-5 h-5 text-sky-200" />
            </div>
            <div>
              <span className="font-playfair text-lg font-black tracking-tight block leading-none text-ink">
                MOVIE<span className="text-[#f39a4b]">BASH</span>
              </span>
              <span className="text-[10px] text-[#237eea] font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#237eea] text-white shadow-md shadow-[#237eea]/20'
                      : 'text-slate-600 hover:bg-[#d9ebff]/50 hover:text-[#155fbd]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#237eea]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-sky-100 space-y-3">
          <div className="px-3.5 py-2.5 rounded-2xl bg-[#fffaf0] border border-sky-100 text-xs shadow-xs">
            <span className="text-[10px] text-[#237eea] uppercase font-black tracking-wider block">Signed in as</span>
            <span className="font-bold text-ink block truncate">{currentUser?.name || 'Administrator'}</span>
            <span className="text-[10px] text-slate-500 capitalize">{currentUser?.role?.replace('_', ' ')}</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href="/"
              target="_blank"
              className="text-xs text-[#155fbd] hover:text-[#237eea] flex items-center gap-1 font-bold transition-colors"
            >
              <span>View Site</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <button
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-bold transition-colors cursor-pointer"
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
        <header className="lg:hidden bg-white text-ink p-4 flex items-center justify-between border-b border-sky-100 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#237eea] text-white flex items-center justify-center font-black shadow-xs">
              <Film className="w-4 h-4 text-sky-200" />
            </div>
            <span className="font-playfair text-base font-black text-ink">
              Movie<span className="text-[#f39a4b]">Bash</span> Admin
            </span>
          </div>

          <button
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            className="p-2 rounded-xl bg-sky-50 text-[#155fbd] hover:bg-sky-100 transition-colors cursor-pointer"
          >
            {mobileDrawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileDrawerOpen && (
          <div className="lg:hidden bg-white text-ink p-4 border-b border-sky-100 space-y-2 shadow-lg animate-in slide-in-from-top-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-xs font-bold ${
                  pathname === item.href ? 'bg-[#237eea] text-white' : 'text-slate-700 hover:bg-sky-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-sky-100 flex justify-between">
              <Link href="/" target="_blank" className="text-xs text-[#155fbd] font-bold">View Public Site</Link>
              <button onClick={handleLogout} className="text-xs text-rose-600 font-bold">Logout</button>
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
