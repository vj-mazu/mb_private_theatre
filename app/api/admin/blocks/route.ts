import { z } from 'zod';
import { q, one, audit } from '@/lib/server/db';
import { ok, route, requireStaff, HttpError } from '@/lib/server/api';
import { todayIST } from '@/lib/booking-rules';

export const dynamic = 'force-dynamic';

const schema = z.object({
  theatre_id: z.coerce.number().int().positive(),
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  slot_id: z.coerce.number().int().positive().nullable().optional().transform((v) => v || null),
  reason: z.string().trim().max(200).optional().default(''),
});

/** Upcoming blocks (today onwards). */
export const GET = route(async () => {
  await requireStaff('admin');
  return ok(await q(`SELECT b.*, t.name AS theatre_name, br.name AS branch_name, s.start_time, s.end_time
                     FROM slot_blocks b JOIN theatres t ON t.id=b.theatre_id JOIN branches br ON br.id=t.branch_id
                     LEFT JOIN slots s ON s.id=b.slot_id
                     WHERE b.block_date >= $1 ORDER BY b.block_date, t.name, s.start_time NULLS FIRST`, [todayIST()]));
});

export const POST = route(async (req: Request) => {
  const s = await requireStaff('admin');
  const d = schema.parse(await req.json());
  if (d.block_date < todayIST()) throw new HttpError(400, 'That date has already passed');
  if (d.slot_id) {
    const slot = await one('SELECT 1 FROM slots WHERE id=$1 AND theatre_id=$2', [d.slot_id, d.theatre_id]);
    if (!slot) throw new HttpError(400, 'That slot does not belong to this theatre');
  }
  const clash = await one<{ ref: string }>(
    `SELECT ref FROM bookings WHERE theatre_id=$1 AND booking_date=$2 AND status <> 'cancelled' AND NOT is_deleted ${d.slot_id ? 'AND slot_id=$3' : ''} LIMIT 1`,
    d.slot_id ? [d.theatre_id, d.block_date, d.slot_id] : [d.theatre_id, d.block_date]);
  if (clash) throw new HttpError(409, `Booking ${clash.ref} is in that time. Reschedule or cancel it first.`);
  const dup = await one(`SELECT 1 FROM slot_blocks WHERE theatre_id=$1 AND block_date=$2 AND slot_id IS NOT DISTINCT FROM $3`, [d.theatre_id, d.block_date, d.slot_id]);
  if (dup) throw new HttpError(409, 'This is already blocked');
  const row = await one('INSERT INTO slot_blocks (theatre_id, block_date, slot_id, reason, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [d.theatre_id, d.block_date, d.slot_id, d.reason, s.name]);
  await audit(s.name, 'create', 'slot_block', (row as any).id, d);
  return ok(row);
});

export const DELETE = route(async (req: Request) => {
  const s = await requireStaff('admin');
  const id = Number(new URL(req.url).searchParams.get('id'));
  await q('DELETE FROM slot_blocks WHERE id=$1', [id]);
  await audit(s.name, 'delete', 'slot_block', id);
  return ok();
});
