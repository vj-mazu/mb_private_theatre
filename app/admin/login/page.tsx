'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Film, Lock, Mail, ArrowRight, ShieldAlert, Shield, Eye, EyeOff, User } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Clear stale session on visiting login page to guarantee clean authentication
  useEffect(() => {
    fetch('/api/admin/logout', { method: 'POST' }).catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedIdentifier = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedIdentifier || !trimmedPassword) {
      setErrorMsg('Please enter both your Username/Email and Password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedIdentifier, password: trimmedPassword }),
      });
      const data = await res.json();
      if (data.success) {
        // Staff goes directly to bookings terminal, Admin goes to manager dashboard
        if (data.data?.role === 'staff') {
          router.push('/admin/bookings');
        } else {
          router.push('/admin');
        }
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please verify your credentials.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF3E4] text-[#141110] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Warm Ambient Elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[420px] h-[420px] rounded-full bg-[#ef4a23]/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[380px] h-[380px] rounded-full bg-amber-200/25 blur-[90px] pointer-events-none" />

      <div className="max-w-md w-full bg-white border border-stone-200/80 rounded-3xl p-8 sm:p-10 text-[#141110] shadow-[0_20px_60px_rgba(20,17,16,0.08)] space-y-6 relative z-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-[#ef4a23] text-white flex items-center justify-center mx-auto shadow-md shadow-[#ef4a23]/25">
            <Film className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#141110]">
            Movie<span className="text-[#ef4a23]">Bash</span> Console
          </h1>
          <p className="text-xs text-stone-500 font-medium">
            Authorized Personnel Terminal &bull; Requires Manual Login
          </p>
        </div>

        {/* Security Badge */}
        <div className="py-2 px-3 rounded-xl bg-stone-50 border border-stone-200/80 text-[11px] text-stone-600 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-[#ef4a23] shrink-0" />
          <span>Restricted Portal: Enter your personal staff ID and password.</span>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#141110] uppercase tracking-wider mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your username or email"
                autoComplete="username"
                autoFocus
                spellCheck={false}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF3E4]/30 border border-stone-200 text-xs sm:text-sm font-semibold text-[#141110] placeholder:text-stone-400 focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-[#141110] uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] font-bold text-stone-500 hover:text-[#ef4a23] flex items-center gap-1 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Type your password"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#FAF3E4]/30 border border-stone-200 text-xs sm:text-sm font-semibold text-[#141110] placeholder:text-stone-400 focus:outline-none focus:border-[#ef4a23] focus:bg-white transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full font-extrabold text-xs sm:text-sm text-white bg-[#ef4a23] hover:bg-[#d93b16] shadow-md shadow-[#ef4a23]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Terminal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-1 border-t border-stone-100">
          <p className="text-[11px] text-stone-400 font-medium">
            Staff access is monitored &bull; Sessions automatically expire after 8 hours
          </p>
        </div>

      </div>
    </div>
  );
}
