import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/admin/', '/api/', '/account/', '/booking-success/'],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Amazonbot'],
        allow: ['/', '/llms.txt'],
        disallow: ['/admin/', '/api/admin/', '/api/'],
      },
    ],
    sitemap: 'https://moviebash.in/sitemap.xml',
  };
}
