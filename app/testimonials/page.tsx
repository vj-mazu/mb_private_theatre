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
  description: 'Read verified 5.0-star Google reviews from guests celebrating birthdays, anniversaries, and romantic dates at Movie Bash.',
  alternates: {
    canonical: 'https://moviebash.in/testimonials',
  },
};

export default function TestimonialsPage() {
  const reviews = [
    {
      author: 'Neha Sultana',
      occasion: "Baby's Birthday Celebration • Electronic City",
      rating: 5,
      date: 'a month ago',
      avatar: '/images/couple_7.webp',
      text: "Had the absolute best time celebrating our baby's birthday here! The team provided outstanding service and genuine cooperation throughout the event. The photos and videos turned out stunning—crisp, well-lit, and beautiful memory-keepers. The cake was a huge hit too! The design was exactly what we asked for, and it tasted amazing. Thank you for making our baby's day so memorable!",
    },
    {
      author: 'Pavani Pandu',
      occasion: "Son's 2nd Birthday Party • Electronic City",
      rating: 5,
      date: '4 months ago',
      avatar: '/images/couple_8.webp',
      text: "We celebrated our son's 2nd birthday at Bash Movie yesterday, and it was an unforgettable experience! From the moment we arrived, everything was well organized and beautifully arranged. The decorations, lighting, and overall ambiance created a perfect setting for the celebration. The staff was extremely friendly, polite, and attentive. They took care of every little detail and made sure our event went smoothly without any stress. Our guests enjoyed the venue, and the kids had an amazing time. The service was excellent, and the entire team went above and beyond to make our special day memorable. Seeing the smiles on our son's face made it all the more special. Thank you to the entire Bash Movie team for making our little prince's 2nd birthday such a beautiful and cherished memory. We truly appreciate your effort and hospitality. We highly recommend this place for birthday parties and family celebrations, and we look forward to celebrating many more special occasions here! ❤️ 🎉 🎂",
    },
    {
      author: 'Rajesh raju',
      occasion: 'Birthday Celebration & Party • Electronic City',
      rating: 5,
      date: 'a month ago',
      avatar: '/images/celebration_3.webp',
      text: "Yesterday night we have celebrated birthday... 🎉 Really superb.. service's and I love your hospitality and prosperity.. 🤗 coming to the party hall and decor and snacks all such things are Really fabulous and our children had enjoyed and created thair own memories 🤩 🤩 You mad Hanish's day some more special 💖 ✨ He loved and got surprised 🥰 We were so happy about that 🫠 Thank you... Movie Bash for what you mad for us. 🤝",
    },
    {
      author: 'Naveen Sudarshan',
      occasion: 'Birthday Party Experience • Electronic City',
      rating: 5,
      date: 'a month ago',
      avatar: '/images/celebration_4.webp',
      text: "Had a really nice experience at Movie Bash, Bangalore! 😊 We celebrated a birthday here, and it was a lovely experience. The staff were very patient, friendly, and supportive throughout, and they made sure we felt comfortable. ❤️ The private theatre setup made the celebration feel extra special and gave us some wonderful memories. 🎂 🎬 It’s a great place to plan a birthday surprise or celebrate a special occasion with friends and family. Really appreciate the staff for their patience and support. Overall, we had a great time and would definitely recommend this place! ❤️ ✨",
    },
    {
      author: "Nandu's Quest",
      occasion: 'Small Gathering & Ample Parking • Electronic City',
      rating: 4,
      date: '3 months ago',
      avatar: '/images/couple_1.webp',
      text: 'This venue is good for small events, especially if food is not required. It has ample parking, which is a big advantage. They have two celebration rooms with nice decorations and screens, making them suitable for birthday parties and other small gatherings. However, it is not ideal for events that require food, as there is no dedicated dining area.',
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
            <span>5.0 / 5 Rating on Google (850+ Reviews)</span>
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
              Browse authentic 5-star Google reviews from verified guests at Electronic City.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((r, i) => (
              <div
                key={i}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-sand-200 shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(r.rating)].map((_, idx) => (
                        <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-[11px] text-ink/50 font-semibold">{r.date}</span>
                  </div>

                  <p className="font-playfair text-[11px] sm:text-xs font-medium italic text-stone-700 leading-relaxed mb-4">
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
