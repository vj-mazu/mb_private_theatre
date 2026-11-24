import { create, list } from '@/lib/server/crud';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';
type Ctx = { params: { entity: string } };

// Staff only need the catalogue to take and complete bookings; everything else is admin-only.
const STAFF_READABLE = new Set(['branches', 'theatres', 'slots', 'packages', 'cakes', 'addons', 'occasions']);

export const GET = route(async (_req: Request, { params }: Ctx) => {
  await requireStaff(STAFF_READABLE.has(params.entity) ? undefined : 'admin');
  return ok(await list(params.entity));
});

export const POST = route(async (req: Request, { params }: Ctx) => {
  const s = await requireStaff('admin');
  return ok(await create(params.entity, await req.json(), s.name));
});
