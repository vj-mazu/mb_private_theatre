import 'server-only';
import { q } from './db';
import { cached } from './cache';
import { dayMinutes } from '../booking-rules';

export interface Settings {
  business: { name: string; phone: string; whatsapp: string; email: string; instagram: string; facebook: string; youtube: string };
  payment: { upi_id: string; payee_name: string; advance_amount: number };
  booking: { slot_cutoff_minutes: number; hold_minutes: number };
  hero: { title: string; subtitle: string; images: string[] };
  announcement: { enabled: boolean; text: string };
  stats: { rating: number; reviews: number; celebrations: number };
  story: { title: string; body: string; quote: string; image: string };
  visit: { notes: string[] };
  reels: { urls: string[] };
  /** The "Custom" (room only) option. Its price per theatre is the theatre's base price. */
  custom_package: CustomPackage;
}

export interface CustomPackage { enabled: boolean; tagline: string; includes: string[]; image_url: string }

export const DEFAULT_SETTINGS: Settings = {
  business: { name: 'Movie Bash', phone: '', whatsapp: '', email: '', instagram: '', facebook: '', youtube: '' },
  payment: { upi_id: '', payee_name: 'Movie Bash', advance_amount: 500 },
  booking: { slot_cutoff_minutes: 30, hold_minutes: 20 },
  hero: { title: 'Your private theatre for every celebration', subtitle: '', images: [] },
  announcement: { enabled: false, text: '' },
  stats: { rating: 5, reviews: 0, celebrations: 0 },
  story: { title: '', body: '', quote: '', image: '' },
  reels: { urls: [] },
  custom_package: {
    enabled: true,
    tagline: 'Just the room — add only what you want',
    includes: ['Private theatre for your full slot', '4K projector & Dolby sound', 'Choose your own guest count, cake, decor & add-ons'],
    image_url: '',
  },
  visit: {
    notes: [
      'Please arrive 10 minutes before your slot',
      'Dedicated parking at Electronic City only (none at BTM 2nd Stage)',
      'Outside food is allowed · alcohol and smoking are not',
      'Carry a valid ID for the booking name',
    ],
  },
};

export const getSettings = cached(loadSettings, 'settings');

/** Uncached read — use in admin where edits must show immediately. */
export async function loadSettings(): Promise<Settings> {
  const rows = await q<{ key: keyof Settings; value: any }>('SELECT key, value FROM settings');
  const out: any = structuredClone(DEFAULT_SETTINGS);
  for (const r of rows) if (r.key in out) out[r.key] = { ...out[r.key], ...r.value };
  return out as Settings;
}

export interface Theatre {
  id: number; branch_id: number; name: string; description: string; base_capacity: number; max_capacity: number;
  base_price: number; extra_person_price: number; extra_hour_price: number; image_url: string; images: string[]; video_url: string;
  slots: { id: number; start_time: string; end_time: string }[];
  prices: Record<number, { price: number; original_price: number | null }>; // packageId -> price
}

export const getCatalog = cached(loadCatalog, 'catalog');

async function loadCatalog() {
  const [branches, theatres, slots, packages, prices, cakes, addons, occasions, coupons, settings, testimonials, faqs] = await Promise.all([
    q('SELECT id, name, slug, address, phone, map_url, image_url, story_text, story_image FROM branches WHERE is_active ORDER BY sort_order, id'),
    q('SELECT id, branch_id, name, description, base_capacity, max_capacity, base_price, extra_person_price, extra_hour_price, image_url, images, video_url FROM theatres WHERE is_active ORDER BY sort_order, id'),
    q('SELECT id, theatre_id, start_time, end_time FROM slots WHERE is_active ORDER BY sort_order, start_time'),
    q('SELECT id, name, tagline, includes, includes_cake, included_addons, image_url, highlight FROM packages WHERE is_active ORDER BY sort_order, id'),
    q('SELECT package_id, theatre_id, price, original_price FROM package_prices'),
    q('SELECT id, name, image_url, price FROM cakes WHERE is_active ORDER BY sort_order, id'),
    q('SELECT id, category, name, description, price, price_tiers, image_url FROM addons WHERE is_active ORDER BY sort_order, id'),
    q('SELECT id, name, image_url FROM occasions WHERE is_active ORDER BY sort_order, id'),
    q(`SELECT code, discount_type, value, min_amount FROM coupons
       WHERE is_active AND show_on_site AND (expires_on IS NULL OR expires_on >= CURRENT_DATE)
         AND (usage_limit IS NULL OR used_count < usage_limit) ORDER BY value DESC`),
    getSettings(),
    q('SELECT id, name, occasion, rating, text, image_url FROM testimonials WHERE is_active ORDER BY sort_order, id'),
    q('SELECT id, question, answer FROM faqs WHERE is_active ORDER BY sort_order, id'),
  ]);

  const theatreList: Theatre[] = theatres.map((t: any) => ({
    ...t,
    // Time order of the business day (a 12:00 AM slot comes last, after the evening slots).
    slots: slots.filter((s: any) => s.theatre_id === t.id).map(({ theatre_id, ...s }: any) => s)
      .sort((a: any, b: any) => dayMinutes(a.start_time) - dayMinutes(b.start_time)),
    prices: Object.fromEntries(prices.filter((p: any) => p.theatre_id === t.id).map((p: any) => [p.package_id, { price: p.price, original_price: p.original_price }])),
  }));

  return { branches, theatres: theatreList, packages, customPackage: settings.custom_package, cakes, addons, occasions, coupons, settings, testimonials, faqs };
}

export type Catalog = Awaited<ReturnType<typeof loadCatalog>>;
