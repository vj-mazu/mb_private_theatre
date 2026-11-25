import { q } from '@/lib/server/db';
import { releaseExpiredHolds } from '@/lib/server/bookings';
import { ok, route, requireStaff } from '@/lib/server/api';
import { addDays, todayIST } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';

export const GET = route(async () => {
  const s = await requireStaff();
  await releaseExpiredHolds();
  const today = todayIST();
  const monthStart = `${today.slice(0, 7)}-01`;
  const scope = s.role === 'staff' && s.branch_id ? `AND bk.branch_id=${Number(s.branch_id)}` : '';
  // Unpaid website holds (guest opened the payment page, no screenshot sent) are not bookings yet: they stay out of
  // every count, list and revenue figure until the screenshot arrives.
  const live = `NOT bk.is_deleted AND bk.status NOT IN ('cancelled','awaiting_payment') ${scope}`;
  const toVerify = `bk.status='payment_review' AND bk.payment_screenshot <> ''`;

  const [[counts], todayList, daily, verify, upcoming, enquiries] = await Promise.all([
    q<any>(`SELECT
        count(*) FILTER (WHERE booking_date=$1)::int AS today,
        count(*) FILTER (WHERE ${toVerify})::int AS to_verify,
        count(*) FILTER (WHERE booking_date >= $1 AND status IN ('confirmed','payment_review'))::int AS upcoming,
        COALESCE(sum(amount_paid) FILTER (WHERE status='completed' AND booking_date >= $2 AND booking_date <= $1), 0)::int AS month_revenue,
        COALESCE(sum(amount_paid) FILTER (WHERE booking_date >= $2 AND booking_date <= $1), 0)::int AS month_collected,
        COALESCE(sum(total - amount_paid) FILTER (WHERE status='confirmed' AND booking_date <= $1), 0)::int AS pending_balance
      FROM bookings bk WHERE ${live}`, [today, monthStart]),
    q(`SELECT bk.id, bk.ref, bk.slot_label, bk.customer_name, bk.phone, bk.status, bk.total, bk.amount_paid, t.name AS theatre_name, br.name AS branch_name
       FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id JOIN branches br ON br.id=bk.branch_id
       WHERE bk.booking_date=$1 AND ${live} ORDER BY t.name, bk.slot_label`, [today]),
    q(`SELECT booking_date AS date, count(*)::int AS bookings, COALESCE(sum(amount_paid) FILTER (WHERE status='completed'),0)::int AS revenue
       FROM bookings bk WHERE ${live} AND booking_date BETWEEN $1 AND $2 GROUP BY booking_date ORDER BY booking_date`, [addDays(today, -13), today]),
    q(`SELECT bk.id, bk.ref, bk.booking_date, bk.slot_label, bk.customer_name, bk.phone, bk.total, bk.amount_paid, t.name AS theatre_name
       FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id
       WHERE ${toVerify} AND NOT bk.is_deleted ${scope} ORDER BY bk.created_at LIMIT 6`),
    q(`SELECT bk.id, bk.ref, bk.booking_date, bk.slot_label, bk.customer_name, bk.total, bk.amount_paid, bk.status, t.name AS theatre_name
       FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id
       WHERE bk.booking_date > $1 AND ${live} AND bk.status IN ('confirmed','payment_review') ORDER BY bk.booking_date, bk.slot_label LIMIT 6`, [today]),
    s.role === 'admin'
      ? q("SELECT id, name, phone, occasion, preferred_date, created_at FROM enquiries WHERE status='new' ORDER BY created_at DESC LIMIT 4")
      : Promise.resolve([]),
  ]);
  // Staff see operations only — no revenue totals (per-booking balances stay, they collect them at the venue).
  if (s.role !== 'admin') {
    for (const k of ['month_revenue', 'month_collected', 'pending_balance']) delete counts[k];
    return ok({ role: s.role, counts, today: todayList, daily: [], verify, upcoming, enquiries, date: today });
  }
  return ok({ role: s.role, counts, today: todayList, daily, verify, upcoming, enquiries, date: today });
});
