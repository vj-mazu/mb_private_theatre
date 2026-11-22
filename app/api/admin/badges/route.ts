import { q } from '@/lib/server/db';
import { releaseExpiredHolds } from '@/lib/server/bookings';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

/** Counts shown as badges in the admin sidebar. */
export const GET = route(async () => {
  const s = requireStaff();
  await releaseExpiredHolds();
  const scope = s.role === 'staff' && s.branch_id ? `AND branch_id=${Number(s.branch_id)}` : '';
  const [[v], enq] = await Promise.all([
    q<{ n: number }>(`SELECT count(*)::int AS n FROM bookings WHERE status='payment_review' AND NOT is_deleted ${scope}`),
    s.role === 'admin' ? q<{ n: number }>("SELECT count(*)::int AS n FROM enquiries WHERE status='new'") : Promise.resolve([{ n: 0 }]),
  ]);
  return ok({ verify: v?.n ?? 0, enquiries: enq[0]?.n ?? 0 });
});
