import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Inter_Tight, Playfair_Display, Poppins, Caveat } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#0A1F5C',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const interTight = Inter_Tight({
  weight: ['600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://moviebash.in'),
  title: {
    default: 'Movie Bash | Bengaluru’s #1 Private Theatre & Celebration Destination',
    template: '%s | Movie Bash Bengaluru'
  },
  description: 'Book luxury private cinema screens in Bengaluru (Electronic City & BTM 2nd Stage). Perfect for birthdays, anniversaries, romantic proposals, date nights, and family parties. 4K visuals, Dolby Atmos sound, and fairy light decor.',
  keywords: [
    'private theatre bangalore',
    'private cinema bangalore',
    'movie bash electronic city',
    'movie bash btm 2nd stage',
    'birthday celebration private theatre',
    'couple theatre bangalore',
    'private screening room bangalore',
    'anniversary surprise theatre bangalore'
  ],
  authors: [{ name: 'Movie Bash Private Theatres' }],
  creator: 'Movie Bash',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://moviebash.in',
    title: 'Movie Bash | Luxury Private Screening & Celebrations Bengaluru',
    description: 'Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special. Electronic City & BTM 2nd Stage.',
    siteName: 'Movie Bash',
    images: [
      {
        url: '/images/celebration_1.webp',
        width: 1200,
        height: 630,
        alt: 'Movie Bash Luxury Private Theatre Celebration'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Movie Bash | Premier Private Theatres Bengaluru',
    description: 'Book private cinema screens for couples, birthdays, and family parties in Electronic City & BTM 2nd Stage.',
    images: ['/images/celebration_1.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  name: 'Movie Bash Private Theatre',
  image: 'https://moviebash.in/images/celebration_1.webp',
  url: 'https://moviebash.in',
  telephone: '+919902923656',
  priceRange: '₹899 - ₹2499',
  address: [
    {
      '@type': 'PostalAddress',
      streetAddress: '4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand',
      addressLocality: 'Electronic City Post, Bengaluru',
      postalCode: '560100',
      addressRegion: 'Karnataka',
      addressCountry: 'IN'
    },
    {
      '@type': 'PostalAddress',
      streetAddress: '2nd Floor, 16th Main Road, Near Udupi Garden Signal',
      addressLocality: 'BTM 2nd Stage, Bengaluru',
      postalCode: '560076',
      addressRegion: 'Karnataka',
      addressCountry: 'IN'
    }
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '850',
    bestRating: '5',
    worstRating: '1'
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '09:30',
      closes: '01:00'
    }
  ]
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${interTight.variable} ${playfair.variable} ${poppins.variable} ${caveat.variable} scroll-smooth`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-sand-50 text-ink antialiased selection:bg-royal-100 selection:text-royal-900">
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
