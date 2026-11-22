import { z } from 'zod';
import { q } from '@/lib/server/db';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

const schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  branch: z.coerce.number().int().optional(),
});

/** Revenue report for a date range (by booking date). Cancelled and deleted bookings are excluded. */
export const GET = route(async (req: Request) => {
  requireStaff('admin');
  const p = schema.parse(Object.fromEntries(new URL(req.url).searchParams));
  const params: unknown[] = [p.from, p.to];
  let where = `NOT bk.is_deleted AND bk.status <> 'cancelled' AND bk.status <> 'awaiting_payment' AND bk.booking_date BETWEEN $1 AND $2`;
  if (p.branch) { params.push(p.branch); where += ` AND bk.branch_id = $3`; }

  const group = (expr: string) => q(
    `SELECT ${expr} AS label, count(*)::int AS bookings, COALESCE(sum(bk.total),0)::int AS revenue, COALESCE(sum(bk.amount_paid),0)::int AS collected
     FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id JOIN branches br ON br.id=bk.branch_id
     WHERE ${where} GROUP BY 1 ORDER BY revenue DESC`, params);

  const [[totals], daily, byBranch, byTheatre, bySource, byPackage, methods] = await Promise.all([
    q<any>(`SELECT count(*)::int AS bookings, COALESCE(sum(total),0)::int AS revenue, COALESCE(sum(amount_paid),0)::int AS collected,
              COALESCE(sum(discount),0)::int AS discounts, COALESCE(sum(items_amount + cake_amount),0)::int AS addons,
              count(*) FILTER (WHERE status='completed')::int AS closed
            FROM bookings bk WHERE ${where}`, params),
    q(`SELECT bk.booking_date AS date, count(*)::int AS bookings, COALESCE(sum(bk.total),0)::int AS revenue, COALESCE(sum(bk.amount_paid),0)::int AS collected
       FROM bookings bk WHERE ${where} GROUP BY 1 ORDER BY 1`, params),
    group('br.name'),
    group(`t.name || ' · ' || br.name`),
    group('bk.source'),
    group('bk.package_name'),
    q(`SELECT pm.method AS label, count(*)::int AS payments, COALESCE(sum(pm.amount),0)::int AS amount
       FROM payments pm JOIN bookings bk ON bk.id=pm.booking_id WHERE ${where} GROUP BY 1 ORDER BY amount DESC`, params),
  ]);
  return ok({ totals, daily, byBranch, byTheatre, bySource, byPackage, methods });
});
