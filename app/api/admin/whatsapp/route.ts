import { q } from '@/lib/server/db';
import { whatsappConfigured } from '@/lib/server/whatsapp';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: Request) => {
  await requireStaff('admin');
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get('page')) || 1);
  const per = 30;
  const status = sp.get('status');
  const params: unknown[] = [];
  let where = 'TRUE';
  if (status) { params.push(status); where = `m.status=$1`; }
  const [rows, [{ count }]] = await Promise.all([
    q(`SELECT m.*, b.ref, b.customer_name FROM whatsapp_messages m LEFT JOIN bookings b ON b.id=m.booking_id
       WHERE ${where} ORDER BY m.created_at DESC LIMIT ${per} OFFSET ${(page - 1) * per}`, params),
    q<{ count: number }>(`SELECT count(*)::int AS count FROM whatsapp_messages m WHERE ${where}`, params),
  ]);
  return ok({ rows, total: count, page, per, configured: whatsappConfigured() });
});
