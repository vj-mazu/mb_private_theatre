'use client';

import React from 'react';
import Image from 'next/image';
import { Instagram, Heart, ExternalLink } from 'lucide-react';

export default function SocialHighlights() {
  const posts = [
    { id: 1, image: '/images/couple_1.webp', likes: '1.2K', caption: 'Dreamy anniversary proposal setup ✨' },
    { id: 2, image: '/images/celebration_2.webp', likes: '890', caption: 'Dense fog entry for birthday boy 🎂' },
    { id: 3, image: '/images/ambience_3.webp', likes: '2.1K', caption: 'Family cinema weekend with kids 🍿' },
    { id: 4, image: '/images/celebration_4.webp', likes: '1.5K', caption: 'Cold pyro cake cutting surprise 🔥' },
  ];

  return (
    <section className="py-10 sm:py-24 bg-sand-100/60 border-t border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-bold mb-2">
              <Instagram className="w-3.5 h-3.5" />
              <span>@moviebash_privatetheatre</span>
            </div>
            <h2 className="font-playfair text-3xl sm:text-5xl font-black text-royal-900 tracking-tight">
              Latest from Our Instagram
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Stories, moments, and real celebrations shared by our community (24.5K+ Followers).
            </p>
          </div>

          <a
            href="https://instagram.com/moviebash_privatetheatre"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-royal-700 text-white font-bold text-xs sm:text-sm hover:bg-royal-600 transition-colors shadow-royal-glow self-start md:self-auto"
          >
            <span>Follow on Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://instagram.com/moviebash_privatetheatre"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-3xl overflow-hidden aspect-square min-h-[160px] sm:min-h-[220px] shadow-soft border border-sand-200 block"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
                sizes="(max-width: 768px) 50vw, 300px"
              />
              <div className="absolute inset-0 bg-royal-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white mb-1">
                  <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                  <span>{post.likes}</span>
                </div>
                <p className="text-xs text-slate-100 line-clamp-2 leading-tight">
                  {post.caption}
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}
