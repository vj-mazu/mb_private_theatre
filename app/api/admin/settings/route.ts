import { q, audit } from '@/lib/server/db';
import { DEFAULT_SETTINGS, loadSettings } from '@/lib/server/catalog';
import { whatsappConfigured } from '@/lib/server/whatsapp';
import { ok, route, requireStaff } from '@/lib/server/api';
import { invalidateContent } from '@/lib/server/cache';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  requireStaff('admin');
  return ok({ settings: await loadSettings(), whatsapp: { configured: whatsappConfigured() } });
});

export const PUT = route(async (req: Request) => {
  const s = requireStaff('admin');
  const body = await req.json();
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!body[key] || typeof body[key] !== 'object') continue;
    await q(`INSERT INTO settings (key, value, updated_at) VALUES ($1,$2,now())
             ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`, [key, JSON.stringify(body[key])]);
  }
  invalidateContent();
  await audit(s.name, 'update', 'settings', '', Object.keys(body));
  return ok(await loadSettings());
});
