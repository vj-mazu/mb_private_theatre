import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import HomeStats from '@/components/HomeStats';
import WhyChooseUs from '@/components/WhyChooseUs';
import FinalCtaBanner from '@/components/FinalCtaBanner';
import { Sparkles, Heart, Film, ShieldCheck, Instagram, Play } from 'lucide-react';

const INSTAGRAM_URL = 'https://www.instagram.com/moviebash_privatetheatre/';

export const metadata = {
  title: 'About Us | Movie Bash Private Theatre Bengaluru',
  description: 'Learn how Movie Bash became Bengaluru’s premier private screening theatre for birthdays, anniversaries, and exclusive celebrations.',
  alternates: {
    canonical: 'https://moviebash.in/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />

      {/* Hero Banner */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#F6FAFD] via-cream to-cream text-ink relative overflow-hidden border-b border-sky-100">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#f39a4b]" />
            <span>Bengaluru’s Premier Private Cinema</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-6xl font-black tracking-tight text-ink">
            Our Story, Your Celebrations
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
            Welcome to Movie Bash Private Theatre, Bengaluru&apos;s premier destination for private movie screenings and exclusive cinema experiences.
          </p>
        </div>
      </section>

      {/* Main Narrative Block */}
      <section className="py-20 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00A2E4]">
                The Movie Bash Journey
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-black text-ink leading-tight">
                Crafting Intimate Cinema Moments That Last a Lifetime
              </h2>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Nestled in the heart of the city, our theatre offers a luxurious and intimate setting perfect for movie enthusiasts, families, and corporate events. What began as a passion to reinvent movie nights has grown into Bengaluru&apos;s favorite surprise celebration hub.
              </p>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                Whether it is reliving cherished wedding videos on a 135-inch screen, surprising your partner with an enchanted fog entry, or watching a blockbuster in total peace without screaming crowds, Movie Bash gives you the theater entirely to yourselves.
              </p>

              <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] border-l-4 border-l-[#00A2E4]">
                <p className="font-playfair text-lg font-bold italic text-ink">
                  &ldquo;Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.&rdquo;
                </p>
                <span className="block mt-2 text-xs font-bold text-[#00A2E4] uppercase tracking-wider">
                  — The Movie Bash Founding Vision
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-[0_16px_50px_rgba(22,48,79,0.08)] border-4 border-white aspect-[4/3]">
                <Image
                  src="/images/celebration_1.webp"
                  alt="Movie Bash Luxury Private Theatre Celebration Experience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-[0_12px_40px_rgba(22,48,79,0.08)] border border-sky-100 max-w-[200px]">
                <span className="font-playfair text-2xl font-black text-[#00A2E4] block">3,500+</span>
                <span className="text-xs font-bold text-slate-700">Celebrations Hosted</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Stats Counter */}
      <HomeStats />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Instagram Reels */}
      <section className="py-16 sm:py-24 bg-cream border-t border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#833ab4]/10 via-[#fd1d1d]/10 to-[#fcb045]/10 border border-pink-200 text-[#C13584] text-xs font-black uppercase tracking-wider">
                <Instagram className="w-3.5 h-3.5" />
                On Instagram
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-black text-ink leading-tight">
                Top reels from our celebrations
              </h2>
              <p className="text-sm text-slate-600 max-w-xl font-medium">
                Surprise reveals, fog entries and cake-cutting moments — filmed inside our private theatres and posted on our official handle.
              </p>
            </div>

            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white text-sm font-black shadow-md hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              <Instagram className="w-4 h-4" />
              Follow @moviebash_privatetheatre
            </a>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { src: '/images/couple_1.webp', title: 'Valentine heart reveal', views: '12.4K' },
              { src: '/images/celebration_1.webp', title: 'Golden arch birthday', views: '9.8K' },
              { src: '/images/rooms/btm-scarlet-red.webp', title: 'Scarlet Red walkthrough', views: '7.2K' },
              { src: '/images/couple_6.webp', title: 'Anniversary surprise', views: '5.6K' },
            ].map((reel) => (
              <a
                key={reel.title}
                href={`${INSTAGRAM_URL}reels/`}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl aspect-[9/16] bg-slate-900 border border-sky-100 shadow-soft hover:shadow-[0_18px_45px_rgba(22,48,79,0.18)] transition-all"
              >
                <Image
                  src={reel.src}
                  alt={reel.title}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

                <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-black flex items-center gap-1">
                  <Play className="w-3 h-3 fill-white" />
                  {reel.views}
                </div>

                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#ffd46e]">
                    <Instagram className="w-3 h-3" /> Reel
                  </span>
                  <h3 className="mt-1 text-sm font-bold leading-snug">{reel.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white/90 group-hover:text-[#8fd6f5] transition-colors">
                    Watch on Instagram <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <FinalCtaBanner />

      <Footer />
      <FloatingContact />
    </main>
  );
}
