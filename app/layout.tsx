import type { Metadata, Viewport } from 'next';
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const display = Fraunces({ subsets: ['latin'], variable: '--font-display', display: 'swap', axes: ['opsz'] });

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://moviebash.in';

export const viewport: Viewport = {
  themeColor: '#FBF7EF',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: 'Movie Bash — Private Theatre Celebrations in Bengaluru', template: '%s · Movie Bash' },
  description:
    'Book a private theatre for birthdays, anniversaries, proposals and movie nights in Electronic City and BTM 2nd Stage, Bengaluru. Decor, cake and 4K screen included.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Movie Bash',
    images: [{ url: '/images/og-image.jpg', width: 1200, height: 630, alt: 'Movie Bash private theatre' }],
  },
  keywords: ['private theatre Bangalore', 'private theatre Electronic City', 'private theatre BTM', 'birthday celebration theatre',
    'anniversary surprise Bangalore', 'couple theatre Bangalore', 'private movie screening Bengaluru', 'Movie Bash'],
  twitter: { card: 'summary_large_image', images: ['/images/og-image.jpg'] },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico', sizes: 'any' }] },
  formatDetection: { telephone: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  name: 'Movie Bash',
  url: SITE,
  image: `${SITE}/images/hero-desktop.webp`,
  telephone: process.env.NEXT_PUBLIC_BUSINESS_PHONE || '+919902923656',
  priceRange: '₹₹',
  address: [
    { '@type': 'PostalAddress', streetAddress: '4th Floor, Srinivasam, Nagananthapura Main Road', addressLocality: 'Electronic City, Bengaluru', postalCode: '560100', addressCountry: 'IN' },
    { '@type': 'PostalAddress', streetAddress: '2nd Floor, 16th Main Road, Near Udupi Garden Signal', addressLocality: 'BTM 2nd Stage, Bengaluru', postalCode: '560076', addressCountry: 'IN' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
