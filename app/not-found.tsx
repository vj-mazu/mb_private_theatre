import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-4xl">This page isn&apos;t showing</h1>
      <p className="mt-2 max-w-md text-sm text-navy-soft">The page you were looking for has moved or no longer exists.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="flex h-11 items-center rounded-xl border border-line px-5 text-sm font-semibold transition hover:bg-cream-deep">Home</Link>
        <Link href="/book" className="flex h-11 items-center rounded-xl bg-brand-600 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">Book a slot</Link>
      </div>
    </main>
  );
}
