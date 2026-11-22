'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Field, Input, api } from '@/components/ui';
import { Logo } from '@/components/site/Logo';

export default function AdminLoginPage() {
  return <Suspense><AdminLogin /></Suspense>;
}

function AdminLogin() {
  const router = useRouter();
  const next = useSearchParams().get('next') || '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { role } = await api<{ role: string }>('/api/admin/login', { method: 'POST', json: { username, password } });
      router.replace(role === 'admin' ? next : '/admin/bookings');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-4">
      <form onSubmit={submit} className="card w-full max-w-sm animate-fade-up p-7">
        <Logo className="mx-auto h-10" />
        <h1 className="mt-6 text-center font-sans text-lg font-bold">Admin sign in</h1>
        <p className="mt-1 text-center text-sm text-navy-soft">Staff and administrators only</p>
        <div className="mt-6 space-y-4">
          <Field label="Username"><Input autoFocus autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} /></Field>
          <Field label="Password"><Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" size="lg" className="w-full" loading={busy}>Sign in</Button>
        </div>
      </form>
    </main>
  );
}
