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
    <div className="min-h-screen bg-royal-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-royal-900 border border-royal-800 rounded-3xl p-8 sm:p-10 text-white shadow-elevated space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-royal-700 text-amber-400 flex items-center justify-center mx-auto shadow-royal-glow">
            <Film className="w-6 h-6" />
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black">
            Movie Bash Admin Portal
          </h1>
          <p className="text-xs text-slate-300">
            Internal console for venue managers &amp; operations
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Admin Email or Staff Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-royal-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@moviebash.in or staff_ec"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-royal-950 border border-royal-800 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
              Password / Security PIN
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-royal-400 absolute left-3 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password or PIN"
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-royal-950 border border-royal-800 text-xs text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* Quick Credential Switchers */}
          <div className="p-3.5 rounded-2xl bg-royal-950/70 border border-royal-800/80 text-[11px] text-slate-300 space-y-2">
            <span className="font-bold text-amber-400 block text-[10px] uppercase tracking-wider">
              One-Click Test Accounts:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setEmail('admin@moviebash.in');
                  setPassword('Admin@MovieBash2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-royal-800 hover:bg-amber-400 hover:text-royal-950 text-[10px] font-bold text-white transition-colors"
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff_ec@moviebash.in');
                  setPassword('Staff@EC2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-royal-800 hover:bg-amber-400 hover:text-royal-950 text-[10px] font-bold text-white transition-colors"
              >
                Staff (Electronic City)
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail('staff_btm@moviebash.in');
                  setPassword('Staff@BTM2026!');
                }}
                className="px-2.5 py-1 rounded-lg bg-royal-800 hover:bg-amber-400 hover:text-royal-950 text-[10px] font-bold text-white transition-colors"
              >
                Staff (BTM 2nd Stage)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-extrabold text-xs sm:text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-all shadow-royal-glow flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
