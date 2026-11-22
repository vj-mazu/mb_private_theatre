'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-2 max-w-md text-sm text-navy-soft">A temporary problem stopped this page from loading. Please try again.</p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="h-11 rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">Try again</button>
        <Link href="/" className="flex h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold transition hover:bg-cream-deep">Home</Link>
      </div>
    </main>
  );
}
