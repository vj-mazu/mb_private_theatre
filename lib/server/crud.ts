import 'server-only';
import { q, one, tx, audit } from './db';
import { HttpError } from './api';
import { invalidateContent } from './cache';
import { priceTiers } from '../booking-rules';

type ColType = 'text' | 'url' | 'int' | 'int?' | 'bool' | 'json' | 'time' | 'date?' | 'upper';
interface Entity { table: string; cols: Record<string, ColType>; order: string; required: string[] }

const common = { sort_order: 'int', is_active: 'bool' } as const;

export const ENTITIES: Record<string, Entity> = {
  branches: { table: 'branches', order: 'sort_order, id', required: ['name', 'slug'],
    cols: { name: 'text', slug: 'text', address: 'text', phone: 'text', map_url: 'url', image_url: 'url', story_text: 'text', story_image: 'url', ...common } },
  theatres: { table: 'theatres', order: 'branch_id, sort_order, id', required: ['name', 'branch_id'],
    cols: { branch_id: 'int', name: 'text', description: 'text', base_capacity: 'int', max_capacity: 'int', base_price: 'int',
      extra_person_price: 'int', extra_hour_price: 'int', image_url: 'url', images: 'json', video_url: 'url', ...common } },
  slots: { table: 'slots', order: 'theatre_id, start_time', required: ['theatre_id', 'start_time', 'end_time'],
    cols: { theatre_id: 'int', start_time: 'time', end_time: 'time', ...common } },
  packages: { table: 'packages', order: 'sort_order, id', required: ['name'],
    cols: { name: 'text', tagline: 'text', includes: 'json', includes_cake: 'bool', included_addons: 'json', image_url: 'url', highlight: 'bool', ...common } },
  cakes: { table: 'cakes', order: 'sort_order, id', required: ['name'], cols: { name: 'text', image_url: 'url', price: 'int', ...common } },
  addons: { table: 'addons', order: 'category, sort_order, id', required: ['name'],
    cols: { category: 'text', name: 'text', description: 'text', price: 'int', price_tiers: 'json', image_url: 'url', ...common } },
  occasions: { table: 'occasions', order: 'sort_order, id', required: ['name'], cols: { name: 'text', image_url: 'url', ...common } },
  gallery: { table: 'gallery', order: 'sort_order, id DESC', required: ['image_url'],
    cols: { image_url: 'url', caption: 'text', category: 'text', featured: 'bool', ...common } },
  testimonials: { table: 'testimonials', order: 'sort_order, id', required: ['name', 'text'],
    cols: { name: 'text', occasion: 'text', rating: 'int', text: 'text', image_url: 'url', ...common } },
  faqs: { table: 'faqs', order: 'sort_order, id', required: ['question', 'answer'],
    cols: { question: 'text', answer: 'text', ...common } },
  enquiries: { table: 'enquiries', order: 'created_at DESC', required: ['name', 'phone'],
    cols: { name: 'text', phone: 'text', email: 'text', branch: 'text', occasion: 'text', preferred_date: 'date?', message: 'text', status: 'text', notes: 'text' } },
  promos: { table: 'promos', order: 'sort_order, id DESC', required: ['title'],
    cols: { title: 'text', text: 'text', image_url: 'url', coupon_code: 'upper', link_url: 'url', button_label: 'text',
      placement: 'text', starts_on: 'date?', ends_on: 'date?', ...common } },
  coupons: { table: 'coupons', order: 'id DESC', required: ['code'],
    cols: { code: 'upper', discount_type: 'text', value: 'int', min_amount: 'int', usage_limit: 'int?', show_on_site: 'bool', expires_on: 'date?', is_active: 'bool' } },
  showcase_videos: { table: 'showcase_videos', order: 'sort_order, id', required: ['title', 'video_url'],
    cols: { title: 'text', room: 'text', video_url: 'url', poster_url: 'url', ...common } },
};

/** A link admins may save: a path on this site ("/images/…", "/api/files/…") or an https:// address. */
const SAFE_URL = /^(\/(?![/\\])\S*|https:\/\/\S+)$/i;

export function entity(name: string): Entity {
  const e = ENTITIES[name];
  if (!e) throw new HttpError(404, 'Unknown section');
  return e;
}

function coerce(type: ColType, v: unknown, col: string) {
  switch (type) {
    case 'int': { const n = Math.round(Number(v)); if (!Number.isFinite(n)) throw new HttpError(400, `${col.replace(/_/g, ' ')} must be a number`); return n; }
    case 'int?': return v === '' || v === null || v === undefined ? null : Math.round(Number(v));
    case 'bool': return v === true || v === 'true' || v === 1 || v === '1';
    case 'json': return JSON.stringify(Array.isArray(v) || typeof v === 'object' ? v : []);
    case 'time': { const s = String(v); if (!/^\d{2}:\d{2}$/.test(s)) throw new HttpError(400, 'Time must be HH:MM'); return s; }
    case 'date?': return v ? String(v) : null;
    case 'upper': return String(v ?? '').trim().toUpperCase();
    case 'url': {
      const s = String(v ?? '').trim();
      if (s && !SAFE_URL.test(s)) throw new HttpError(400, `${col.replace(/_/g, ' ')} must start with / or https://`);
      return s;
    }
    default: return String(v ?? '').trim();
  }
}

function pick(e: Entity, body: Record<string, unknown>, partial: boolean) {
  const out: Record<string, unknown> = {};
  for (const [col, type] of Object.entries(e.cols)) {
    if (!(col in body)) continue;
    if (col === 'images') {
      const list = Array.isArray(body[col]) ? (body[col] as unknown[]).map((x) => String(x ?? '').trim()).filter(Boolean) : [];
      if (list.some((x) => !SAFE_URL.test(x))) throw new HttpError(400, 'Photos must start with / or https://');
      out[col] = JSON.stringify(list);
      continue;
    }
    // Price options: keep only complete rows (label, qty, price), one per qty.
    out[col] = coerce(type, col === 'price_tiers' ? priceTiers({ price_tiers: body[col] }) : body[col], col);
  }
  if (!partial) for (const r of e.required) if (out[r] === undefined || out[r] === '') throw new HttpError(400, `${r.replace(/_/g, ' ')} is required`);
  return out;
}

export async function list(name: string) {
  const e = entity(name);
  const rows = await q(`SELECT * FROM ${e.table} ORDER BY ${e.order}`);
  if (name === 'packages') {
    const prices = await q('SELECT * FROM package_prices');
    return rows.map((p: any) => ({ ...p, prices: Object.fromEntries(prices.filter((x: any) => x.package_id === p.id).map((x: any) => [x.theatre_id, { price: x.price, original_price: x.original_price }])) }));
  }
  return rows;
}

async function savePrices(packageId: number, prices: unknown, c: any) {
  if (!prices || typeof prices !== 'object') return;
  for (const [theatreId, v] of Object.entries(prices as Record<string, any>)) {
    const price = v?.price === '' || v?.price == null ? null : Math.round(Number(v.price));
    if (price === null || !Number.isFinite(price)) {
      await q('DELETE FROM package_prices WHERE package_id=$1 AND theatre_id=$2', [packageId, Number(theatreId)], c);
    } else {
      const orig = v?.original_price ? Math.round(Number(v.original_price)) : null;
      await q(`INSERT INTO package_prices (package_id, theatre_id, price, original_price) VALUES ($1,$2,$3,$4)
               ON CONFLICT (package_id, theatre_id) DO UPDATE SET price=EXCLUDED.price, original_price=EXCLUDED.original_price`,
        [packageId, Number(theatreId), price, orig], c);
    }
  }
}

export async function create(name: string, body: any, actor: string) {
  const e = entity(name);
  const data = pick(e, body, false);
  const cols = Object.keys(data);
  const row = await tx(async (c) => {
    const r = await one<any>(`INSERT INTO ${e.table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) RETURNING *`, Object.values(data), c);
    if (name === 'packages') await savePrices(r.id, body.prices, c);
    return r;
  });
  invalidateContent();
  await audit(actor, 'create', name, row.id, data);
  return row;
}

export async function update(name: string, id: number, body: any, actor: string) {
  const e = entity(name);
  const data = pick(e, body, true);
  const cols = Object.keys(data);
  const row = await tx(async (c) => {
    const r = cols.length
      ? await one<any>(`UPDATE ${e.table} SET ${cols.map((k, i) => `${k}=$${i + 2}`).join(', ')} WHERE id=$1 RETURNING *`, [id, ...Object.values(data)], c)
      : await one<any>(`SELECT * FROM ${e.table} WHERE id=$1`, [id], c);
    if (!r) throw new HttpError(404, 'Not found');
    if (name === 'packages') await savePrices(id, body.prices, c);
    return r;
  });
  invalidateContent();
  await audit(actor, 'update', name, id, data);
  return row;
}

export async function remove(name: string, id: number, actor: string) {
  const e = entity(name);
  if (name === 'theatres' || name === 'slots' || name === 'branches') {
    const col = name === 'theatres' ? 'theatre_id' : name === 'slots' ? 'slot_id' : 'branch_id';
    const used = await one<{ n: number }>(`SELECT count(*)::int AS n FROM bookings WHERE ${col}=$1`, [id]);
    if (used && used.n > 0) throw new HttpError(409, `This has ${used.n} booking(s). Turn it off (inactive) instead of deleting.`);
  }
  await q(`DELETE FROM ${e.table} WHERE id=$1`, [id]);
  invalidateContent();
  await audit(actor, 'delete', name, id);
}
