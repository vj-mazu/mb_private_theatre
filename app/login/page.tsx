'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import { Phone, Lock, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean })
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
        setInfoMsg(data.message || 'OTP sent! Use 123456 in dev mode.');
      } else {
        setErrorMsg(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp.trim()) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/account');
      } else {
        setErrorMsg(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorMsg('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-sand-200 shadow-elevated text-center space-y-6">
          
          <div className="w-12 h-12 rounded-2xl bg-royal-100 text-royal-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-black text-royal-900">
              Customer Login
            </h1>
            <p className="text-xs text-ink/70 mt-1">
              Access your celebration bookings, view invoices, or request rescheduling.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {infoMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold">
              {infoMsg}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-royal-900 mb-1">
                  Mobile Number (WhatsApp)
                </label>
                <div className="flex items-center">
                  <span className="px-4 py-3 rounded-l-2xl bg-sand-200 border border-r-0 border-sand-300 text-xs font-bold text-royal-900">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 rounded-r-2xl bg-sand-50 border border-sand-300 text-sm font-semibold text-royal-900 focus:outline-none focus:border-royal-700"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Sending OTP...' : 'Send OTP via SMS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-royal-900 mb-1">
                  Enter 6-Digit OTP sent to +91 {phone}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-2xl bg-sand-50 border border-sand-300 text-center font-mono text-xl tracking-widest font-black text-royal-900 focus:outline-none focus:border-royal-700"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full font-bold text-xs sm:text-sm text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow transition-all"
              >
                {loading ? 'Verifying...' : 'Verify OTP & Enter Account'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="text-xs text-royal-700 underline font-semibold"
              >
                Change mobile number
              </button>
            </form>
          )}

          <div className="pt-2 text-[11px] text-ink/60 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-royal-600" />
            <span>Secure passwordless authentication</span>
          </div>

        </div>
      </div>

      <Footer />
      <FloatingContact />
    </main>
  );
}
