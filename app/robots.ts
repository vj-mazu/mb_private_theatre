import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://moviebash.in';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin/', '/api/', '/ticket/'] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
