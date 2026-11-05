import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingContact from '@/components/FloatingContact';
import AnnouncementBar from '@/components/AnnouncementBar';
import { Calendar, User, ArrowRight, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Blog & Celebration Ideas | Movie Bash Private Theatre',
  description: 'Party ideas, surprise tips, and guides for planning birthdays, anniversaries, and private screenings in Bengaluru.',
};

export default function BlogListingPage() {
  const posts = [
    {
      id: 1,
      slug: 'top-5-surprise-anniversary-ideas-bengaluru',
      title: 'Top 5 Surprise Anniversary Ideas in Bengaluru',
      excerpt: 'Discover how booking a private cinema with magical fog entry and personalized videos creates an unforgettable anniversary.',
      category: 'Celebration Ideas',
      author: 'Movie Bash Team',
      date: 'Nov 02, 2026',
      image: '/images/couple_3.webp',
    },
    {
      id: 2,
      slug: 'why-private-theatres-best-birthday-celebration',
      title: 'Why Private Theatres are the Best Place for Birthday Celebrations',
      excerpt: 'From zero crowd hassle to playing your own OTT watchlist, here is why Bengaluru is falling in love with private screenings.',
      category: 'Movie Nights',
      author: 'Movie Bash Team',
      date: 'Oct 28, 2026',
      image: '/images/celebration_4.webp',
    },
    {
      id: 3,
      slug: 'magical-fog-entry-and-cold-pyro-safety',
      title: 'How Magical Fog Entry & Cold Pyro Sparklers Elevate Private Parties',
      excerpt: 'Everything you need to know about our indoor safe cold fire effects, dense cloud fog machines, and cinematic cake cutting moments.',
      category: 'Venues & Ambience',
      author: 'Movie Bash Team',
      date: 'Oct 15, 2026',
      image: '/images/ambience_6.webp',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-sand-50">
      <AnnouncementBar />
      <Navbar />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-royal-950 to-royal-900 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Celebration Guides</span>
          <h1 className="font-playfair text-4xl sm:text-5xl font-black tracking-tight">
            The Movie Bash Blog
          </h1>
          <p className="text-sm sm:text-base text-slate-200 max-w-xl mx-auto font-normal">
            Inspiration, party tips, and curated surprises for planning your dream celebration in Bengaluru.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-3xl bg-white border border-sand-200 overflow-hidden shadow-soft hover:shadow-elevated transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-white/95 text-[10px] font-bold text-royal-900">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-4 text-[11px] text-ink/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-royal-600" />
                        {post.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-royal-600" />
                        {post.author}
                      </span>
                    </div>

                    <h2 className="font-playfair text-xl font-bold text-royal-900 group-hover:text-royal-600 transition-colors leading-snug">
                      <Link href={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h2>

                    <p className="text-xs text-ink/75 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-royal-700 group-hover:text-royal-500 transition-colors"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <FloatingContact />
    </main>
  );
}
