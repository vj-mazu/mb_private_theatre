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
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      {/* Hero Banner */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-royal-950 to-royal-900 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-royal-800 text-amber-300 text-xs font-bold border border-royal-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Bengaluru’s Premier Private Cinema</span>
          </div>

          <h1 className="font-playfair text-4xl sm:text-6xl font-black tracking-tight text-white">
            Our Story, Your Celebrations
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed">
            Welcome to Movie Bash Private Theatre, Bengaluru&apos;s premier destination for private movie screenings and exclusive cinema experiences.
          </p>
        </div>
      </section>

      {/* Main Narrative Block */}
      <section className="py-20 bg-sand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-royal-700">
                The Movie Bash Journey
              </span>
              <h2 className="font-playfair text-3xl sm:text-4xl font-black text-royal-900 leading-tight">
                Crafting Intimate Cinema Moments That Last a Lifetime
              </h2>
              <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
                Nestled in the heart of the city, our theatre offers a luxurious and intimate setting perfect for movie enthusiasts, families, and corporate events. What began as a passion to reinvent movie nights has grown into Bengaluru&apos;s favorite surprise celebration hub.
              </p>
              <p className="text-sm sm:text-base text-ink/80 leading-relaxed">
                Whether it is reliving cherished wedding videos on a 135-inch screen, surprising your partner with an enchanted fog entry, or watching a blockbuster in total peace without screaming crowds, Movie Bash gives you the theater entirely to yourselves.
              </p>

              <div className="p-6 rounded-3xl bg-sand-100 border-l-4 border-royal-700">
                <p className="font-playfair text-lg font-bold italic text-royal-900">
                  &ldquo;Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.&rdquo;
                </p>
                <span className="block mt-2 text-xs font-bold text-royal-600 uppercase tracking-wider">
                  — The Movie Bash Founding Vision
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-elevated border-4 border-white aspect-[4/3]">
                <Image
                  src="/images/ambience_2.webp"
                  alt="Movie Bash Private Screen Ambience"
                  fill
                  sizes="(max-width: 1024px) 100vw, 500px"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-elevated border border-sand-200 max-w-[200px]">
                <span className="font-playfair text-2xl font-black text-royal-700 block">12,500+</span>
                <span className="text-xs font-bold text-ink/80">Celebrations Hosted</span>
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
