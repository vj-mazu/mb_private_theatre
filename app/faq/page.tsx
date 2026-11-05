import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import FaqSection from '@/components/FaqSection';
import FinalCtaBanner from '@/components/FinalCtaBanner';

export const metadata = {
  title: 'Frequently Asked Questions | Movie Bash Private Theatre',
  description: 'Everything you need to know about Movie Bash private screenings, rescheduling, food policy, decorations, and booking in Bengaluru.',
};

export default function FaqPage() {
  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-royal-950 to-royal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Help Center</span>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-normal">
            Got queries regarding your private screening or surprise celebration? We&apos;ve got you covered.
          </p>
        </div>
      </section>

      <FaqSection />

      <FinalCtaBanner />
      <Footer />
      <FloatingContact />
    </main>
  );
}
