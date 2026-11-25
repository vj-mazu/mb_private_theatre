import 'server-only';
import { q } from './db';
import { cached } from './cache';

const LIVE_COUPON = `c.is_active AND (c.expires_on IS NULL OR c.expires_on >= CURRENT_DATE) AND (c.usage_limit IS NULL OR c.used_count < c.usage_limit)`;

export interface Promo { id: number; title: string; text: string; image_url: string; coupon_code: string; link_url: string; button_label: string; placement: 'popup' | 'banner' }

/** Active promotions for today. A promo tied to a coupon disappears when that coupon is switched off or expires. */
export const getLivePromos = cached(loadLivePromos, 'promos');

async function loadLivePromos(): Promise<Promo[]> {
  return q<Promo>(
    `SELECT p.id, p.title, p.text, p.image_url, p.coupon_code, p.link_url, p.button_label, p.placement
     FROM promos p LEFT JOIN coupons c ON c.code = p.coupon_code
     WHERE p.is_active AND (p.starts_on IS NULL OR p.starts_on <= CURRENT_DATE) AND (p.ends_on IS NULL OR p.ends_on >= CURRENT_DATE)
       AND (p.coupon_code = '' OR (${LIVE_COUPON}))
     ORDER BY p.sort_order, p.id DESC`);
}

/** Announcement-bar text. Custom text is dropped if it mentions a coupon code that is not live; otherwise the best live coupon is advertised. */
export const getAnnouncement = cached(loadAnnouncement, 'announcement');

async function loadAnnouncement(custom: { enabled: boolean; text: string }): Promise<string> {
  const coupons = await q<{ code: string; discount_type: string; value: number; live: boolean; show_on_site: boolean }>(
    `SELECT c.code, c.discount_type, c.value, c.show_on_site, (${LIVE_COUPON}) AS live FROM coupons c ORDER BY c.value DESC`);
  if (custom.enabled && custom.text.trim()) {
    const text = custom.text.toUpperCase();
    const mentionsDeadCoupon = coupons.some((c) => {
      if (c.live && c.show_on_site) return false;
      const esc = c.code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^A-Z0-9])${esc}([^A-Z0-9]|$)`).test(text);
    });
    if (!mentionsDeadCoupon) return custom.text;
  }
  const best = coupons.find((c) => c.live && c.show_on_site);
  return best ? `Use code ${best.code} for ${best.discount_type === 'percent' ? `${best.value}%` : `₹${best.value}`} off your booking` : '';
}
