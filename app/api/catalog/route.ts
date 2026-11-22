import { getCatalog } from '@/lib/server/catalog';
import { ok, route } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const { settings, ...catalog } = await getCatalog();
  // Only public settings leave the server.
  return ok({ ...catalog, settings: { business: settings.business, payment: settings.payment, booking: settings.booking } });
});
