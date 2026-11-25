import { remove, update } from '@/lib/server/crud';
import { HttpError, ok, route, requireStaff } from '@/lib/server/api';

type Ctx = { params: { entity: string; id: string } };
const parseId = (id: string) => { const n = Number(id); if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'Invalid id'); return n; };

export const PUT = route(async (req: Request, { params }: Ctx) => {
  const s = await requireStaff('admin');
  return ok(await update(params.entity, parseId(params.id), await req.json(), s.name));
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const s = await requireStaff('admin');
  await remove(params.entity, parseId(params.id), s.name);
  return ok();
});
