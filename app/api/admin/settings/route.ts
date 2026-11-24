import { q, audit } from '@/lib/server/db';
import { DEFAULT_SETTINGS, loadSettings } from '@/lib/server/catalog';
import { whatsappConfigured } from '@/lib/server/whatsapp';
import { HttpError, ok, route, requireStaff } from '@/lib/server/api';
import { invalidateContent } from '@/lib/server/cache';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  await requireStaff('admin');
  return ok({ settings: await loadSettings(), whatsapp: { configured: whatsappConfigured() } });
});

/** Links and photos in settings must be a path on this site or an https:// address (never javascript: etc.). */
const SAFE_URL = /^(\/(?![/\\])\S*|https:\/\/\S+)$/i;
const LINK_FIELDS: [string, string][] = [['business', 'instagram'], ['business', 'facebook'], ['business', 'youtube'], ['story', 'image']];

function checkLinks(body: any) {
  for (const [group, key] of LINK_FIELDS) {
    const v = body?.[group]?.[key];
    if (typeof v === 'string' && v.trim() && !SAFE_URL.test(v.trim())) throw new HttpError(400, `${group} ${key}: links must start with https://`);
  }
  const images = body?.hero?.images;
  if (images !== undefined && (!Array.isArray(images) || images.some((x: unknown) => typeof x !== 'string' || !SAFE_URL.test(x)))) {
    throw new HttpError(400, 'Hero photos must be uploaded images');
  }
}

export const PUT = route(async (req: Request) => {
  const s = await requireStaff('admin');
  const body = await req.json();
  checkLinks(body);
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!body[key] || typeof body[key] !== 'object') continue;
    await q(`INSERT INTO settings (key, value, updated_at) VALUES ($1,$2,now())
             ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`, [key, JSON.stringify(body[key])]);
  }
  invalidateContent();
  await audit(s.name, 'update', 'settings', '', Object.keys(body));
  return ok(await loadSettings());
});
