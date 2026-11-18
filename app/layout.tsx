import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Inter, Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#141110',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  alternates: {
    canonical: 'https://moviebash.in',
  },
};

const jsonLdData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://moviebash.in/#website',
      url: 'https://moviebash.in',
      name: 'Movie Bash Private Theatre',
      description: 'Luxury private screening theatres and celebration spaces in Bengaluru.',
      inLanguage: 'en-IN',
      publisher: {
        '@id': 'https://moviebash.in/#business',
      },
    },
    {
      '@type': ['EntertainmentBusiness', 'LocalBusiness'],
      '@id': 'https://moviebash.in/#business',
      name: 'Movie Bash Private Theatre Bengaluru',
      alternateName: 'Movie Bash',
      url: 'https://moviebash.in',
      logo: 'https://moviebash.in/icon.svg',
      image: 'https://moviebash.in/images/celebration_1.webp',
      telephone: '+919902923656',
      priceRange: '₹899 - ₹2800',
      currenciesAccepted: 'INR',
      paymentAccepted: 'Cash, Credit Card, Debit Card, UPI, Net Banking',
      areaServed: [
        {
          '@type': 'City',
          name: 'Bengaluru',
        },
        {
          '@type': 'AdministrativeArea',
          name: 'Electronic City',
        },
        {
          '@type': 'AdministrativeArea',
          name: 'BTM Layout',
        },
      ],
      address: [
        {
          '@type': 'PostalAddress',
          streetAddress: '4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand',
          addressLocality: 'Electronic City Post, Bengaluru',
          postalCode: '560100',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
        {
          '@type': 'PostalAddress',
          streetAddress: '2nd Floor, 16th Main Road, Near Udupi Garden Signal',
          addressLocality: 'BTM 2nd Stage, Bengaluru',
          postalCode: '560076',
          addressRegion: 'Karnataka',
          addressCountry: 'IN',
        },
      ],
      geo: [
        {
          '@type': 'GeoCoordinates',
          latitude: 12.8452,
          longitude: 77.6602,
        },
        {
          '@type': 'GeoCoordinates',
          latitude: 12.9166,
          longitude: 77.6101,
        },
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '850',
        bestRating: '5',
        worstRating: '1',
      },
      review: [
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Neha Sultana',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          reviewBody:
            "Had the absolute best time celebrating our baby's birthday here! The team provided outstanding service and genuine cooperation throughout the event. The photos and videos turned out stunning—crisp, well-lit, and beautiful memory-keepers. The cake was a huge hit too! The design was exactly what we asked for, and it tasted amazing. Thank you for making our baby's day so memorable!",
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Pavani Pandu',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          reviewBody:
            "We celebrated our son's 2nd birthday at Bash Movie yesterday, and it was an unforgettable experience! From the moment we arrived, everything was well organized and beautifully arranged. The decorations, lighting, and overall ambiance created a perfect setting for the celebration. The staff was extremely friendly, polite, and attentive. They took care of every little detail and made sure our event went smoothly without any stress. Our guests enjoyed the venue, and the kids had an amazing time. The service was excellent, and the entire team went above and beyond to make our special day memorable.",
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Rajesh raju',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          reviewBody:
            "Yesterday night we have celebrated birthday... 🎉 Really superb.. service's and I love your hospitality and prosperity.. 🤗 coming to the party hall and decor and snacks all such things are Really fabulous and our children had enjoyed and created thair own memories 🤩 🤩 You mad Hanish's day some more special 💖 ✨ He loved and got surprised 🥰 We were so happy about that 🫠 Thank you... Movie Bash for what you mad for us. 🤝",
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: 'Naveen Sudarshan',
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '5',
            bestRating: '5',
          },
          reviewBody:
            "Had a really nice experience at Movie Bash, Bangalore! 😊 We celebrated a birthday here, and it was a lovely experience. The staff were very patient, friendly, and supportive throughout, and they made sure we felt comfortable. ❤️ The private theatre setup made the celebration feel extra special and gave us some wonderful memories. 🎂 🎬 It’s a great place to plan a birthday surprise or celebrate a special occasion with friends and family. Really appreciate the staff for their patience and support. Overall, we had a great time and would definitely recommend this place! ❤️ ✨",
        },
        {
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: "Nandu's Quest",
          },
          reviewRating: {
            '@type': 'Rating',
            ratingValue: '4',
            bestRating: '5',
          },
          reviewBody:
            'This venue is good for small events, especially if food is not required. It has ample parking, which is a big advantage. They have two celebration rooms with nice decorations and screens, making them suitable for birthday parties and other small gatherings. However, it is not ideal for events that require food, as there is no dedicated dining area.',
        },
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Private Theatre Celebration Packages',
        itemListElement: [
          {
            '@type': 'Offer',
            name: 'Couple Private Cinema Package',
            price: '899',
            priceCurrency: 'INR',
            description: 'Intimate private screening experience for 2 people with luxury recliner seating and immersive audio.',
          },
          {
            '@type': 'Offer',
            name: 'Friends & Family Cinema Suite',
            price: '1399',
            priceCurrency: 'INR',
            description: 'Celebration hall for small groups up to 6 people with personalized birthday/anniversary lighting.',
          },
          {
            '@type': 'Offer',
            name: 'Grand Celebration Hall',
            price: '2199',
            priceCurrency: 'INR',
            description: 'Large private theatre for group gatherings up to 15 people with 4K laser projection and celebration effects.',
          },
        ],
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:30',
          closes: '01:00',
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${poppins.variable} scroll-smooth`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Archivo:wdth,wght@62..125,100..900&family=Playfair:ital,opsz,wdth,wght@0,5..1200,87.5..112.5,300..900;1,5..1200,87.5..112.5,300..900&family=Yellowtail&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        {/* Suppress PWA "Install App" browser prompts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();return false;});`,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-cream text-ink antialiased selection:bg-[#fff0ea] selection:text-[#ef4a23]">
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
