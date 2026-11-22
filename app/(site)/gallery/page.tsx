import { getGallery } from '@/lib/server/content';
import { GalleryGrid } from '@/components/site/GalleryGrid';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gallery', description: 'Photos of birthdays, anniversaries and celebrations at Movie Bash private theatres in Bengaluru.' };

export default async function GalleryPage() {
  const photos = await getGallery();
  return (
    <section className="container-page py-14">
      <p className="eyebrow">Gallery</p>
      <h1 className="mt-3 text-4xl sm:text-5xl">Celebrations at Movie Bash</h1>
      <GalleryGrid photos={photos} />
    </section>
  );
}
