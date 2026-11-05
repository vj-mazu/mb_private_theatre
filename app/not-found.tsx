import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Film, Home, CalendarDays } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-12 rounded-3xl border border-sand-200 shadow-soft space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-royal-100 text-royal-700 flex items-center justify-center mx-auto">
            <Film className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-royal-700">Error 404</span>
            <h1 className="font-playfair text-3xl font-black text-royal-900 mt-1">
              Scene Not Found
            </h1>
            <p className="text-xs text-ink/70 mt-2">
              The page or screening room you are looking for has been moved or doesn&apos;t exist.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-royal-900 bg-sand-100 hover:bg-sand-200 border border-sand-200 flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Back Home</span>
            </Link>

            <Link
              href="/book-now"
              className="w-full sm:w-auto px-6 py-3 rounded-full text-xs font-bold text-white bg-royal-700 hover:bg-royal-600 shadow-royal-glow flex items-center justify-center gap-2"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Book Screening</span>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
