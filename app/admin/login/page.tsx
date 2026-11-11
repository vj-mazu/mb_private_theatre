'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@moviebash.in');
  const [password, setPassword] = useState('Admin@MovieBash2026!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/admin');
      } else {
        setErrorMsg(data.error || 'Authentication failed');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="hero-orb orb-one" />
      <div className="hero-orb orb-two" />

      <div className="max-w-md w-full bg-white border border-sky-100 rounded-3xl p-8 sm:p-10 text-ink shadow-[0_20px_60px_rgba(35,126,234,0.1)] space-y-6 relative z-10">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#237eea] text-white flex items-center justify-center mx-auto shadow-md shadow-[#237eea]/25">
            <Film className="w-6 h-6 text-sky-200" />
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-ink">
            Movie<span className="text-[#f39a4b]">Bash</span> Admin
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Internal console for venue managers &amp; operations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
              Admin Email or Staff Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#237eea] absolute left-3 top-3.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@moviebash.in or staff_ec"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#fffdf9] border border-sky-200 text-xs font-semibold text-ink focus:outline-none focus:border-[#237eea]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-1">
              Password / Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#237eea] absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or PIN"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-[#fffdf9] border border-sky-200 text-xs font-semibold text-ink focus:outline-none focus:border-[#237eea]"
                required
              />
            </div>
          </div>

          {/* Quick Credential Switchers */}
          <div className="p-3.5 rounded-2xl bg-[#f0f7ff] border border-sky-100 text-[11px] text-slate-600 space-y-2">
            <span className="font-bold text-[#237eea] block text-[10px] uppercase tracking-wider">
              One-Click Test Accounts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@moviebash.in');
                  setPassword('Admin@MovieBash2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 hover:bg-[#237eea] hover:text-white text-[10px] font-bold text-[#155fbd] transition-colors cursor-pointer shadow-xs"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff_ec@moviebash.in');
                  setPassword('Staff@EC2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 hover:bg-[#237eea] hover:text-white text-[10px] font-bold text-[#155fbd] transition-colors cursor-pointer shadow-xs"
              >
                Staff (Electronic City)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff_btm@moviebash.in');
                  setPassword('Staff@BTM2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-sky-200 hover:bg-[#237eea] hover:text-white text-[10px] font-bold text-[#155fbd] transition-colors cursor-pointer shadow-xs"
              >
                Staff (BTM 2nd Stage)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-extrabold text-xs sm:text-sm text-white bg-gradient-to-r from-[#f39a4b] to-[#e6832e] hover:shadow-[0_8px_25px_rgba(243,154,75,0.35)] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
