import { getCatalog } from '@/lib/server/catalog';
import { q } from '@/lib/server/db';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: Request) => {
  const { settings, ...catalog } = await getCatalog();
  let { cakes, addons } = catalog as { cakes: any[]; addons: any[] };
  // Staff editing or closing an older booking also need cakes/add-ons that were switched off since (shown as "hidden").
  if (new URL(req.url).searchParams.get('all') === '1') {
    await requireStaff();
    const [oldCakes, oldAddons] = await Promise.all([
      q('SELECT id, name, image_url, price FROM cakes WHERE NOT is_active ORDER BY sort_order, id'),
      q('SELECT id, category, name, description, price, price_tiers, image_url FROM addons WHERE NOT is_active ORDER BY sort_order, id'),
    ]);
    cakes = [...cakes, ...oldCakes.map((c: any) => ({ ...c, name: `${c.name} (hidden)` }))];
    addons = [...addons, ...oldAddons.map((a: any) => ({ ...a, name: `${a.name} (hidden)` }))];
  }
  // Only public settings leave the server.
  return ok({ ...catalog, cakes, addons, settings: { business: settings.business, payment: settings.payment, booking: settings.booking } });
});
