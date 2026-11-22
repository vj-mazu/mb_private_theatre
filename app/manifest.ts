import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Movie Bash — Private Theatre Celebrations',
    short_name: 'Movie Bash',
    description: 'Book a private theatre for birthdays, anniversaries and proposals in Bengaluru.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF7EF',
    theme_color: '#2A9BD9',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
