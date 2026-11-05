import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://moviebash.in';

  const routes = [
    '',
    '/about',
    '/gallery',
    '/blog',
    '/testimonials',
    '/faq',
    '/contact',
    '/book-now',
    '/book-now-electronic-city',
    '/book-now-btm-stage-2',
    '/venues/electronic-city',
    '/venues/btm-stage-2',
    '/terms-and-conditions',
    '/privacy-policy',
    '/refund-policy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
