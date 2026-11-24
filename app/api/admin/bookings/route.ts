import { createBooking } from '@/lib/server/bookings';
import { listBookings, parseFilters } from '@/lib/server/booking-list';
import { ok, route, requireStaff } from '@/lib/server/api';
import { audit } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

export const GET = route(async (req: Request) => {
  const s = await requireStaff();
  return ok(await listBookings(parseFilters(req.url), s));
});

/** Manual booking (walk-in / WhatsApp / phone) — confirmed immediately. */
export const POST = route(async (req: Request) => {
  const s = await requireStaff();
  const booking = await createBooking(await req.json(), { kind: 'staff', name: s.name, role: s.role, branch_id: s.branch_id });
  await audit(s.name, 'create', 'booking', booking.id, { ref: booking.ref });
  return ok({ id: booking.id, ref: booking.ref });
});
