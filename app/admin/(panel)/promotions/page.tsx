'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';
import { Badge, api } from '@/components/ui';
import { formatDate } from '@/lib/booking-rules';

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  useEffect(() => { api('/api/admin/crud/coupons').then(setCoupons).catch(() => {}); }, []);
  const couponOptions = [{ value: '', label: 'No coupon' }, ...coupons.map((c) => ({ value: c.code, label: `${c.code}${c.is_active ? '' : ' (off)'}` }))];

  return (
    <>
      <PageHeader title="Promotions & ads" subtitle="Popups and offer banners on the website. An ad linked to a coupon hides itself when that coupon is turned off." />
      <CrudManager config={{
        entity: 'promos', noun: 'Promotion', layout: 'grid',
        defaults: { title: '', text: '', image_url: '', coupon_code: '', link_url: '/book', button_label: 'Book now', placement: 'popup', starts_on: '', ends_on: '', sort_order: 0, is_active: true },
        title: (r) => r.title, image: (r) => r.image_url,
        subtitle: (r) => <>{r.placement === 'popup' ? 'Popup' : 'Banner'}{r.coupon_code && ` · ${r.coupon_code}`}{(r.starts_on || r.ends_on) && ` · ${r.starts_on ? formatDate(r.starts_on, { day: 'numeric', month: 'short' }) : '…'} – ${r.ends_on ? formatDate(r.ends_on, { day: 'numeric', month: 'short' }) : '…'}`}</>,
        rowExtra: (r) => <Badge tone={r.placement === 'popup' ? 'sky' : 'amber'} className="mt-1.5">{r.placement === 'popup' ? 'Shows as popup' : 'Shows as banner on home'}</Badge>,
        fields: [
          { key: 'title', label: 'Headline', type: 'text', required: true },
          { key: 'text', label: 'Text', type: 'textarea' },
          { key: 'placement', label: 'Show as', type: 'select', half: true, options: [{ value: 'popup', label: 'Popup (once per visit)' }, { value: 'banner', label: 'Banner on home page' }] },
          { key: 'coupon_code', label: 'Linked coupon', type: 'select', half: true, options: couponOptions },
          { key: 'button_label', label: 'Button text', type: 'text', half: true },
          { key: 'link_url', label: 'Button link', type: 'text', hint: 'e.g. /book or /book?branch=btm-stage-2', half: true },
          { key: 'starts_on', label: 'Start date (optional)', type: 'date', half: true },
          { key: 'ends_on', label: 'End date (optional)', type: 'date', half: true },
          { key: 'sort_order', label: 'Display order', type: 'number', half: true },
          { key: 'image_url', label: 'Image', type: 'image' },
        ],
      }} />
    </>
  );
}
