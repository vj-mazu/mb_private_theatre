import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import { MapPin, Phone, Star, Check, CalendarDays, ExternalLink } from 'lucide-react';

export const metadata = {
  title: 'Movie Bash BTM 2nd Stage | Private Theatre Bengaluru',
  description: 'Book private theatre celebrations in BTM 2nd Stage near Udupi Garden. Couple, Celebration, and Family 4K screens.',
};

export default function BTMPage() {
  const screens = [
    {
      name: 'Couple Theater',
      capacity: 'Up to 2 Guests',
      price: '₹899',
      image: '/images/couple_2.webp',
      amenities: ['4K Ultra HD Visuals', 'Dolby Atmos Sound', 'Recliner Loungers', 'Romantic Fairy Lights']
    },
    {
      name: 'Celebration Theater',
      capacity: 'Up to 6 Guests',
      price: '₹1,499',
      image: '/images/celebration_3.webp',
      amenities: ['135-inch Cinema Screen', 'JBL Audio', 'Balloon Decor Space', 'Fog Entry Compatible']
    },
    {
      name: 'Family Theater',
      capacity: 'Up to 12-20 Guests',
      price: '₹1,699',
      image: '/images/ambience_3.webp',
      amenities: ['150-inch Curved Screen', 'Luxury Sofa Seating', 'Karaoke Microphones', 'Dining Space']
    },
    {
      name: 'VIP Celebration Suite',
      capacity: 'Up to 8 Guests',
      price: '₹1,599',
      image: '/images/celebration_6.webp',
      amenities: ['140-inch Laser 4K Cinema', 'Luxury Recliner Suite', 'Dolby Audio Pro Subwoofer', 'Fog & Pyro Ready']
    }
  ];

  return (
    <main className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#f0f7ff] via-cream to-cream text-ink relative overflow-hidden border-b border-sky-100">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold shadow-xs">
            Newly Launched &bull; BTM 2nd Stage
          </span>
          <h1 className="font-playfair text-3xl sm:text-5xl font-black text-ink">
            Movie Bash – BTM 2nd Stage
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium">
            Located near Udupi Garden Signal, 16th Main Road, BTM 2nd Stage, Bengaluru 560076.
          </p>
          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/book-now?branch=btm-stage-2"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#f39a4b] to-[#e6832e] hover:shadow-[0_8px_25px_rgba(243,154,75,0.35)] shadow-md transition-all hover:scale-105"
            >
              Book BTM 2nd Stage Slot &rarr;
            </Link>
            <a
              href="https://maps.google.com/?q=BTM+2nd+Stage+Bengaluru"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-[#155fbd] bg-[#d9ebff]/70 border border-sky-200 hover:bg-[#d9ebff] transition-all"
            >
              Get Directions &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Screens showcase */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-playfair text-3xl font-black text-ink">
              Theatres at BTM 2nd Stage
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Four brand new private celebration suites with Dolby acoustics.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {screens.map((s, idx) => (
              <div key={idx} className="rounded-3xl bg-white border border-sky-100 overflow-hidden shadow-[0_12px_40px_rgba(22,48,79,0.06)] flex flex-col justify-between hover:border-sky-300 transition-all">
                <div className="relative h-48 w-full">
                  <Image src={s.image} alt={s.name} fill sizes="(max-width: 768px) 100vw, 350px" className="object-cover" />
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <h3 className="font-bold text-lg text-ink">{s.name}</h3>
                      <span className="font-playfair font-black text-[#237eea] text-lg">{s.price}</span>
                    </div>
                    <span className="text-xs text-slate-500 block mb-3 font-medium">{s.capacity}</span>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {s.amenities.map((a, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#237eea]" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Link
                    href={`/book-now?branch=btm-stage-2`}
                    className="w-full py-3 rounded-full text-center text-xs font-bold text-white bg-gradient-to-r from-[#237eea] to-[#155fbd] hover:opacity-95 shadow-md block mt-4 transition-all"
                  >
                    Select &amp; Book &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </main>
  );
}
