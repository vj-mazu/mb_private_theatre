'use client';

import React from 'react';
import Image from 'next/image';

interface MovieBashLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'full' | 'compact' | 'monochrome';
  dark?: boolean;
  priority?: boolean;
}

/**
 * Official Movie Bash logo (copied from moviebash.in, background removed).
 * `dark` is used on the navy footer, where the wordmark sits on a cream plate
 * so the exact official colours stay readable.
 */
export default function MovieBashLogo({
  className = 'w-full h-auto',
  width = 740,
  height = 320,
  dark = false,
  priority = false,
}: MovieBashLogoProps) {
  const w = typeof width === 'number' ? width : Number(width) || 740;
  const h = typeof height === 'number' ? height : Number(height) || 320;

  const logo = (
    <Image
      src="/images/moviebash-logo.png"
      alt="Movie Bash — The Private Theater Celebration"
      width={w}
      height={h}
      priority={priority}
      className={`${className} object-contain`}
      sizes="(max-width: 640px) 150px, 210px"
    />
  );

  if (dark) {
    return (
      <span className="inline-flex items-center justify-center rounded-xl bg-[#F8F0E5] px-3 py-2">
        {logo}
      </span>
    );
  }

  return logo;
}
