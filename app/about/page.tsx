import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import HomeStats from '@/components/HomeStats';
import WhyChooseUs from '@/components/WhyChooseUs';
import FinalCtaBanner from '@/components/FinalCtaBanner';
import { Sparkles, Heart, Film, ShieldCheck } from 'lucide-react';

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
      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fff8f5] via-cream to-cream text-ink relative overflow-hidden border-b border-sky-100">
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
              <span className="text-xs font-bold uppercase tracking-widest text-[#ef4a23]">
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

              <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-[0_12px_40px_rgba(22,48,79,0.06)] border-l-4 border-l-[#ef4a23]">
                <p className="font-playfair text-lg font-bold italic text-ink">
                  &ldquo;Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.&rdquo;
                </p>
                <span className="block mt-2 text-xs font-bold text-[#ef4a23] uppercase tracking-wider">
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
                <span className="font-playfair text-2xl font-black text-[#ef4a23] block">3,500+</span>
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

      {/* CTA */}
      <FinalCtaBanner />

      <Footer />
      <FloatingContact />
    </main>
  );
}
