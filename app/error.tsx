'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled application error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mb-4 font-black">
        !
      </div>
      <h2 className="text-xl sm:text-2xl font-black text-[#082052] mb-2">Something went wrong</h2>
      <p className="text-xs sm:text-sm text-slate-600 max-w-md mb-6">
        We encountered a temporary issue while loading this page. Please try again or return home.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-5 py-2.5 rounded-full bg-[#00A2E4] text-white text-xs font-bold hover:bg-[#0072AE] transition-all cursor-pointer"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-[#082052] text-white text-xs font-bold hover:bg-[#041224] transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
