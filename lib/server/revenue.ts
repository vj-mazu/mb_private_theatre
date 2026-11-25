import 'server-only';
import { q } from './db';
import { todayIST } from '../booking-rules';

/**
 * Revenue report for a date range (by booking date). Only CLOSED (completed) bookings count, and revenue is the money actually
 * received (advance + final payment), so later price or package changes never alter past figures.
 */
export async function revenueReport(from: string, to: string, branch?: number, today = todayIST()) {
  const params: unknown[] = [from, to];
  let where = `NOT bk.is_deleted AND bk.status = 'completed' AND bk.booking_date BETWEEN $1 AND $2`;
  if (branch) { params.push(branch); where += ` AND bk.branch_id = $3`; }

  // Advances held on bookings that are not closed: coming up, or the booking date passed and it was never closed (guest did not come).
  // Not revenue - shown separately.
  const advParams: unknown[] = [from, to, today];
  let advWhere = `NOT bk.is_deleted AND bk.status IN ('confirmed','payment_review') AND bk.amount_paid > 0 AND bk.booking_date BETWEEN $1 AND $2`;
  if (branch) { advParams.push(branch); advWhere += ` AND bk.branch_id = $4`; }

  const group = (expr: string) => q(
    `SELECT ${expr} AS label, count(*)::int AS bookings, COALESCE(sum(bk.amount_paid),0)::int AS revenue, COALESCE(sum(bk.amount_paid),0)::int AS collected
     FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id JOIN branches br ON br.id=bk.branch_id
     WHERE ${where} GROUP BY 1 ORDER BY revenue DESC`, params);

  const [[totals], [advances], daily, byBranch, byTheatre, bySource, byPackage, methods] = await Promise.all([
    q<any>(`SELECT count(*)::int AS bookings, COALESCE(sum(amount_paid),0)::int AS revenue, COALESCE(sum(amount_paid),0)::int AS collected,
              COALESCE(sum(discount),0)::int AS discounts, COALESCE(sum(items_amount + cake_amount),0)::int AS addons,
              count(*) FILTER (WHERE status='completed')::int AS closed
            FROM bookings bk WHERE ${where}`, params),
    q<any>(`SELECT
              COALESCE(sum(bk.amount_paid) FILTER (WHERE bk.booking_date >= $3), 0)::int AS upcoming,
              count(*) FILTER (WHERE bk.booking_date >= $3)::int AS upcoming_count,
              COALESCE(sum(bk.amount_paid) FILTER (WHERE bk.booking_date < $3), 0)::int AS no_show,
              count(*) FILTER (WHERE bk.booking_date < $3)::int AS no_show_count
            FROM bookings bk WHERE ${advWhere}`, advParams),
    q(`SELECT bk.booking_date AS date, count(*)::int AS bookings, COALESCE(sum(bk.amount_paid),0)::int AS revenue, COALESCE(sum(bk.amount_paid),0)::int AS collected
       FROM bookings bk WHERE ${where} GROUP BY 1 ORDER BY 1`, params),
    group('br.name'),
    group(`t.name || ' · ' || br.name`),
    group('bk.source'),
    group('bk.package_name'),
    q(`SELECT pm.method AS label, count(*)::int AS payments, COALESCE(sum(pm.amount),0)::int AS amount
       FROM payments pm JOIN bookings bk ON bk.id=pm.booking_id WHERE ${where} GROUP BY 1 ORDER BY amount DESC`, params),
  ]);
  return { totals, advances, daily, byBranch, byTheatre, bySource, byPackage, methods };
}
