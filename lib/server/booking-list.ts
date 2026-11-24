import 'server-only';
import { q } from './db';
import type { Session } from './auth';

export interface ListFilters {
  q?: string; status?: string; branch?: string; source?: string; from?: string; to?: string;
  page?: number; per?: number; deleted?: boolean;
}

export function parseFilters(url: string): ListFilters {
  const sp = new URL(url).searchParams;
  return {
    q: sp.get('q') || undefined, status: sp.get('status') || undefined, branch: sp.get('branch') || undefined,
    source: sp.get('source') || undefined, from: sp.get('from') || undefined, to: sp.get('to') || undefined,
    page: Math.max(1, Number(sp.get('page')) || 1), per: Math.min(200, Math.max(10, Number(sp.get('per')) || 25)),
    deleted: sp.get('deleted') === '1',
  };
}

function where(f: ListFilters, s: Session) {
  const cond: string[] = [f.deleted ? 'bk.is_deleted' : 'NOT bk.is_deleted'];
  const params: unknown[] = [];
  const add = (sql: string, v: unknown) => { params.push(v); cond.push(sql.replace('?', `$${params.length}`)); };

  if (s.role === 'staff' && s.branch_id) add('bk.branch_id = ?', s.branch_id);
  else if (f.branch) add('bk.branch_id = ?', Number(f.branch));
  if (f.status === 'active') cond.push("bk.status IN ('payment_review','confirmed')");
  else if (f.status) add('bk.status = ?', f.status);
  // A website guest who opened the payment page and left has an unpaid hold, not a booking yet: it only appears
  // here once the screenshot is sent, unless you filter by "Awaiting payment" or search for it.
  else if (!f.q) cond.push("bk.status <> 'awaiting_payment'");
  if (f.source) add('bk.source = ?', f.source);
  if (f.from) add('bk.booking_date >= ?', f.from);
  if (f.to) add('bk.booking_date <= ?', f.to);
  if (f.q) {
    params.push(`%${f.q.trim()}%`);
    const i = params.length;
    cond.push(`(bk.ref ILIKE $${i} OR bk.customer_name ILIKE $${i} OR bk.phone ILIKE $${i} OR bk.special_person_name ILIKE $${i})`);
  }
  return { sql: cond.join(' AND '), params };
}

const SELECT = `SELECT bk.id, bk.ref, bk.booking_date, bk.slot_label, bk.customer_name, bk.phone, bk.whatsapp, bk.special_person_name,
  bk.occasion, bk.package_name, bk.guests, bk.extra_persons, bk.extra_hours, bk.cake_name, bk.items, bk.discount, bk.total, bk.amount_paid,
  bk.status, bk.source, bk.payment_screenshot, bk.notes, bk.created_at, bk.created_by, bk.branch_id, bk.theatre_id,
  t.name AS theatre_name, br.name AS branch_name
  FROM bookings bk JOIN theatres t ON t.id=bk.theatre_id JOIN branches br ON br.id=bk.branch_id`;

export async function listBookings(f: ListFilters, s: Session) {
  const w = where(f, s);
  const per = f.per || 25;
  const offset = ((f.page || 1) - 1) * per;
  const [rows, [{ count }], [sums]] = await Promise.all([
    q(`${SELECT} WHERE ${w.sql} ORDER BY bk.booking_date DESC, bk.slot_label ASC, bk.id DESC LIMIT ${per} OFFSET ${offset}`, w.params),
    q<{ count: number }>(`SELECT count(*)::int AS count FROM bookings bk WHERE ${w.sql}`, w.params),
    q<any>(`SELECT COALESCE(sum(total),0)::int AS total, COALESCE(sum(amount_paid),0)::int AS paid FROM bookings bk WHERE ${w.sql} AND bk.status <> 'cancelled'`, w.params),
  ]);
  return { rows, total: count, page: f.page || 1, per, sums: s.role === 'admin' ? sums : null };
}

export async function exportBookings(f: ListFilters, s: Session) {
  const w = where(f, s);
  return q(`${SELECT} WHERE ${w.sql} ORDER BY bk.booking_date DESC, bk.id DESC LIMIT 20000`, w.params);
}
