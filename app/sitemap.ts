import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://moviebash.in';
  return ['', '/book', '/our-story', '/gallery', '/terms-and-conditions', '/privacy-policy', '/refund-policy'].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : route === '/book' ? 0.9 : 0.5,
  }));
}
