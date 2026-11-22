import { q, audit } from '@/lib/server/db';
import { route, requireStaff } from '@/lib/server/api';
import { todayIST } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';

const TABLES = ['settings', 'branches', 'theatres', 'slots', 'packages', 'package_prices', 'cakes', 'addons', 'occasions', 'gallery',
  'coupons', 'promos', 'testimonials', 'faqs', 'enquiries', 'users', 'bookings', 'payments', 'booking_events', 'whatsapp_messages', 'audit_log', 'slot_blocks'];

/** Full JSON backup. Add ?files=1 to include uploaded images (base64). */
export const GET = route(async (req: Request) => {
  const s = requireStaff('admin');
  const withFiles = new URL(req.url).searchParams.get('files') === '1';
  const data: Record<string, unknown[]> = {};
  for (const t of TABLES) data[t] = await q(`SELECT * FROM ${t} ORDER BY 1`);
  if (withFiles) {
    data.files = (await q<any>('SELECT id, mime, size, name, created_at, encode(data, \'base64\') AS data FROM files ORDER BY created_at'));
  }
  await audit(s.name, 'backup', 'database', '', { withFiles });
  const body = JSON.stringify({ app: 'moviebash', version: 2, created_at: new Date().toISOString(), tables: data });
  return new Response(body, {
    headers: { 'Content-Type': 'application/json', 'Content-Disposition': `attachment; filename="moviebash-backup-${todayIST()}${withFiles ? '-with-images' : ''}.json"` },
  });
});
