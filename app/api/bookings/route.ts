import { createBooking } from '@/lib/server/bookings';
import { ok, route } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

/** Website booking: creates a slot hold that waits for the advance payment screenshot. */
export const POST = route(async (req: Request) => {
  rateLimit(req, 'booking', 8, 60_000);
  const booking = await createBooking(await req.json(), { kind: 'customer' });
  return ok({ ref: booking.ref, total: booking.total, hold_expires_at: booking.hold_expires_at });
});
