'use client';

import { usePathname } from 'next/navigation';
import { Phone } from 'lucide-react';

/** Floating contact buttons (bottom right): call and WhatsApp. Hidden on the booking and ticket pages. */
export function WhatsAppButton({ number, phone }: { number: string; phone?: string }) {
  const pathname = usePathname();
  if (pathname.startsWith('/book') || pathname.startsWith('/ticket')) return null;
  const wa = number.replace(/\D/g, '');
  const tel = (phone || '').replace(/[^\d+]/g, '');
  const btn = 'flex items-center justify-center rounded-full p-3.5 text-white shadow-lift transition-transform duration-300 ease-smooth hover:scale-105';
  return (
    <div className="fixed bottom-5 right-5 z-30 flex animate-fade-in flex-col items-center gap-3">
      {tel && (
        <a href={`tel:${tel}`} aria-label="Call us" className={`${btn} bg-brand-600`}>
          <Phone className="h-6 w-6" aria-hidden="true" />
        </a>
      )}
      {wa && (
        <a href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi Movie Bash, I would like to know more about booking.')}`}
          target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp" className={`${btn} bg-[#25D366]`}>
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35zM12.05 21.8h-.01a9.8 9.8 0 0 1-5-1.37l-.36-.21-3.72.97 1-3.62-.24-.37a9.78 9.78 0 0 1-1.5-5.22c0-5.4 4.4-9.8 9.83-9.8a9.77 9.77 0 0 1 9.8 9.82c0 5.41-4.4 9.8-9.8 9.8zm8.35-18.15A11.75 11.75 0 0 0 12.05.2C5.55.2.25 5.5.25 12a11.7 11.7 0 0 0 1.58 5.9L.15 24l6.27-1.64a11.8 11.8 0 0 0 5.63 1.43h.01c6.5 0 11.8-5.3 11.8-11.8 0-3.15-1.23-6.11-3.46-8.34z" />
          </svg>
        </a>
      )}
    </div>
  );
}
