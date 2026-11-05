import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import TestimonialsSection from '@/components/TestimonialsSection';
import FinalCtaBanner from '@/components/FinalCtaBanner';
import Image from 'next/image';
import { Star, ShieldCheck, Heart } from 'lucide-react';

export const metadata = {
  title: 'Guest Testimonials & Reviews | Movie Bash Private Theatre Bengaluru',
  description: 'Read verified 4.9-star Google reviews from guests celebrating birthdays, anniversaries, and romantic dates at Movie Bash.',
};

export default function TestimonialsPage() {
  const reviews = [
    {
      author: 'Kavin',
      occasion: 'Family Gathering',
      rating: 5,
      date: '2 weeks ago',
      avatar: '/images/couple_7.webp',
      text: 'Great place to spend time with friends and family on a special day. Lovely decoration, cozy and neat, great service, easy to book and add on. Outside food is allowed and you can use your own OTT platforms.',
    },
    {
      author: 'Shreya',
      occasion: 'Couple Celebration',
      rating: 5,
      date: '1 month ago',
      avatar: '/images/couple_8.webp',
      text: 'One of the best places to celebrate. Booked the couple theatre for 4 members; the fog effect and everything was amazing.',
    },
    {
      author: 'Mani',
      occasion: 'Birthday Surprise',
      rating: 5,
      date: '1 month ago',
      avatar: '/images/celebration_3.webp',
      text: "Good arrangements, great for surprising loved ones. Thanks for making my husband's birthday memorable.",
    },
    {
      author: 'Kumar',
      occasion: 'Wedding Anniversary',
      rating: 5,
      date: '2 months ago',
      avatar: '/images/celebration_4.webp',
      text: 'Amazing experience for our anniversary. Fog entry, cake, decoration and photo shoot were fabulous.',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-royal-950 to-royal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-400 text-royal-900 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-royal-900" />
            <span>4.9 / 5 Rating on Google (850+ Reviews)</span>
          </div>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight">
            Guest Testimonials &amp; Stories
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-normal">
            Honest feedback from people who trusted us with their most cherished milestones.
          </p>
        </div>
      </section>

      {/* Continuous Automatic Horizontal Testimonial Scroller */}
      <TestimonialsSection />

      <section className="py-12 bg-white border-t border-sand-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-playfair text-2xl sm:text-4xl font-black text-royal-900">
              More Google Reviews
            </h2>
            <p className="text-xs sm:text-sm text-ink/75 mt-2">
              Browse reviews shared by recent guests across Electronic City &amp; BTM 2nd Stage.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="p-8 rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(r.rating)].map((_, idx) => (
                        <Star key={idx} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-ink/50 font-semibold">{r.date}</span>
                  </div>

                  <p className="font-playfair text-base font-medium italic text-royal-900 leading-relaxed mb-6">
                    &ldquo;{r.text}&rdquo;
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-sand-200">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-royal-700">
                    <Image src={r.avatar} alt={r.author} fill sizes="48px" className="object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-royal-900">{r.author}</h4>
                    <span className="text-xs text-royal-600 font-semibold">{r.occasion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCtaBanner />
      <Footer />
      <FloatingContact />
    </main>
  );
}
