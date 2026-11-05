import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import { Calendar, User, ArrowLeft, CalendarDays, Share2 } from 'lucide-react';

export default function BlogPostDetail({ params }: { params: { slug: string } }) {
  const { slug } = params;

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <article className="py-12 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-royal-700 hover:text-royal-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>

        <div className="space-y-4">
          <span className="px-3 py-1 rounded-full bg-royal-100 text-royal-700 text-xs font-bold">
            Celebration Ideas
          </span>

          <h1 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 leading-tight">
            Top 5 Surprise Anniversary Ideas in Bengaluru
          </h1>

          <div className="flex items-center gap-4 text-xs text-ink/60 border-b border-sand-200 pb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-royal-700" />
              November 02, 2026
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-royal-700" />
              By Movie Bash Team
            </span>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden my-8 shadow-elevated">
          <Image
            src="/images/couple_3.webp"
            alt="Anniversary Celebration at Movie Bash"
            fill
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div className="prose prose-royal max-w-none text-ink/80 text-sm sm:text-base leading-relaxed space-y-6">
          <p>
            Celebrating an anniversary in Bengaluru should be as unique as your love story. Instead of noisy public restaurants or crowded halls, private theatres like Movie Bash offer a secluded, personalized sanctuary.
          </p>

          <h3 className="font-playfair text-xl sm:text-2xl font-bold text-royal-900 mt-6">
            1. Private Screen, Endless Memories
          </h3>
          <p>
            Relive your wedding video, montage of trips, or your favorite romantic film in 4K resolution on a 135-inch screen. With complete private climate control and plush recliners, you have the entire space strictly to yourselves.
          </p>

          <h3 className="font-playfair text-xl sm:text-2xl font-bold text-royal-900 mt-6">
            2. Magical Fog Entry &amp; Candles
          </h3>
          <p>
            Walk hand-in-hand through dense dramatic cloud fog with candlelit aisles and glowing neon letters. The moment she walks through the door into a room filled with fairy lights and rose petals, it turns into an unforgettable memory.
          </p>

          <h3 className="font-playfair text-xl sm:text-2xl font-bold text-royal-900 mt-6">
            3. Personalized Name on Screen &amp; Cake
          </h3>
          <p>
            Have your custom message beamed big on the screen the moment you step in. Pair it with our fresh cream Dutch chocolate truffle cake or red velvet heart cake baked fresh for your slot.
          </p>
        </div>

        {/* CTA Card Inside Blog */}
        <div className="my-12 p-8 rounded-3xl royal-gradient text-white text-center space-y-4 shadow-elevated">
          <h3 className="font-playfair text-2xl sm:text-3xl font-bold">
            Ready to Plan Your Surprise Anniversary?
          </h3>
          <p className="text-sm text-sand-100 max-w-lg mx-auto">
            Slots for weekend evenings fill up quickly. Choose your preferred branch in Electronic City or BTM 2nd Stage.
          </p>
          <div className="pt-2">
            <Link
              href="/book-now"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs sm:text-sm font-bold text-royal-900 bg-sand-400 hover:bg-sand-300 shadow-md transition-all hover:scale-105"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Book Your Private Screen Now</span>
            </Link>
          </div>
        </div>
      </article>

      <Footer />
      <FloatingContact />
    </main>
  );
}
