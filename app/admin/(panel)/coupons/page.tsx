'use client';

import { PageHeader } from '@/components/admin/AdminShell';
import { CrudManager } from '@/components/admin/CrudManager';
import { Badge } from '@/components/ui';
import { inr } from '@/lib/booking-rules';

export default function CouponsAdmin() {
  return (
    <>
      <PageHeader title="Coupons" subtitle="Turning a coupon off removes it from the website and checkout immediately." />
      <CrudManager config={{
        entity: 'coupons', noun: 'Coupon', layout: 'rows',
        defaults: { code: '', discount_type: 'flat', value: 100, min_amount: 0, usage_limit: '', show_on_site: true, expires_on: '', is_active: true },
        title: (r) => r.code,
        subtitle: (r) => <>
          {r.discount_type === 'percent' ? `${r.value}% off` : `${inr(r.value)} off`}
          {r.min_amount > 0 && ` · min ${inr(r.min_amount)}`} · used {r.used_count}{r.usage_limit ? `/${r.usage_limit}` : ''}
          {r.expires_on && ` · until ${r.expires_on}`}
        </>,
        rowExtra: (r) => (r.show_on_site ? <Badge tone="sky" className="mt-1.5">Shown on website</Badge> : null),
        fields: [
          { key: 'code', label: 'Coupon code', type: 'code', hint: 'Type your own or press Generate', half: true },
          { key: 'discount_type', label: 'Type', type: 'select', half: true, options: [{ value: 'flat', label: 'Flat ₹ off' }, { value: 'percent', label: '% off' }] },
          { key: 'value', label: 'Discount value', type: 'number', half: true },
          { key: 'min_amount', label: 'Minimum booking ₹', type: 'number', half: true },
          { key: 'usage_limit', label: 'Usage limit', type: 'number', hint: 'Empty = unlimited', half: true },
          { key: 'expires_on', label: 'Valid until', type: 'date', half: true },
          { key: 'show_on_site', label: 'Show on website', type: 'toggle', half: true },
          { key: 'is_active', label: 'Active', type: 'toggle', half: true },
        ],
      }} />
    </>
  );
}
