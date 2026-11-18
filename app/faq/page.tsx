import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import FaqSection from '@/components/FaqSection';
import FinalCtaBanner from '@/components/FinalCtaBanner';

export const metadata = {
  title: 'Frequently Asked Questions | Movie Bash Private Theatre',
  description: 'Everything you need to know about Movie Bash private screenings, rescheduling, food policy, decorations, and booking in Bengaluru.',
  alternates: {
    canonical: 'https://moviebash.in/faq',
  },
};

export default function FaqPage() {
  return (
    <main className="min-h-screen flex flex-col bg-cream text-ink">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-24 bg-gradient-to-b from-[#fff8f5] via-cream to-cream text-ink text-center relative overflow-hidden border-b border-sky-100">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#fff0df] text-[#f39a4b] border border-[#f39a4b]/30 text-xs font-bold shadow-xs">
            Help Center
          </span>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight text-ink">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto font-medium">
            Got queries regarding your private screening or surprise celebration? We&apos;ve got you covered.
          </p>
        </div>
      </section>

      <div className="bg-cream py-10">
        <FaqSection />
      </div>

      <FinalCtaBanner />
      <Footer />
      <FloatingContact />
    </main>
  );
}
