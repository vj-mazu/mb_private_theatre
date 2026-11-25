import { z } from 'zod';
import { q } from '@/lib/server/db';
import { releaseExpiredHolds } from '@/lib/server/bookings';
import { daySchedule, minToTime } from '@/lib/server/occupancy';
import { ok, route } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

const schema = z.object({
  branch: z.coerce.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exclude: z.coerce.number().int().optional(),
});

/**
 * Slot availability for a branch + date: taken slots (bookings incl. their extra hours, and admin blocks)
 * and how many extra hours each free slot can take. Time-based expiry is applied on the client.
 */
export const GET = route(async (req: Request) => {
  const p = schema.parse(Object.fromEntries(new URL(req.url).searchParams));
  await releaseExpiredHolds();
  const theatres = await q<{ id: number }>('SELECT id FROM theatres WHERE branch_id=$1', [p.branch]);
  const day = await daySchedule(theatres.map((t) => t.id), p.date, p.exclude ?? 0);
  const key = (d: { theatreId: number; id: number }) => `${d.theatreId}:${d.id}`;
  return ok({
    booked: day.filter((d) => d.status === 'booked').map(key),
    blocked: day.filter((d) => d.status === 'blocked' || d.status === 'unavailable').map(key),
    extraMax: Object.fromEntries(day.filter((d) => d.status === 'open').map((d) => [key(d), d.maxExtra])),
    // Actual times today (free slots move later when an earlier booking takes extra hours; a squeezed one may be a short slot).
    // An unavailable slot with shifted=true was pushed out by an earlier booking's extra hours.
    times: Object.fromEntries(day.map((d) => [key(d), { start: minToTime(d.start), end: minToTime(d.end), shifted: d.shifted, short: d.short }])),
    serverTime: Date.now(),
  });
});
