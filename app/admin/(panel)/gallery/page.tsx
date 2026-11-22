'use client';

import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';

export default function GalleryAdmin() {
  return (
    <>
      <PageHeader title="Gallery" subtitle="Photos shown on the website gallery. Turn a photo off to hide it without deleting." />
      <CrudManager config={{
        entity: 'gallery', noun: 'Photo', layout: 'grid',
        defaults: { image_url: '', caption: '', category: 'Celebrations', featured: false, sort_order: 0, is_active: true },
        title: (r) => r.caption || r.category, subtitle: (r) => <>{r.category}{r.featured && ' · On home page'}</>, image: (r) => r.image_url,
        fields: [
          { key: 'image_url', label: 'Photo', type: 'image' },
          { key: 'caption', label: 'Caption (optional)', type: 'text', half: true },
          { key: 'category', label: 'Category', type: 'select', half: true, options: ['Electronic City', 'BTM 2nd Stage', 'Celebrations', 'Couples', 'Ambience', 'Decor', 'Cakes'].map((c) => ({ value: c, label: c })) },
          { key: 'sort_order', label: 'Display order', type: 'number', half: true },
          { key: 'featured', label: 'Show on home page', type: 'toggle', half: true },
        ],
      }} />
    </>
  );
}
