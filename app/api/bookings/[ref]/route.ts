import { getTicket } from '@/lib/server/ticket';
import { ok, route, HttpError } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

export const GET = route(async (_req: Request, { params }: { params: { ref: string } }) => {
  const ticket = await getTicket(params.ref);
  if (!ticket) throw new HttpError(404, 'Booking not found');
  return ok(ticket);
});
