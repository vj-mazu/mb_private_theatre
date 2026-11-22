import { remove, update } from '@/lib/server/crud';
import { ok, route, requireStaff } from '@/lib/server/api';

type Ctx = { params: { entity: string; id: string } };

export const PUT = route(async (req: Request, { params }: Ctx) => {
  const s = requireStaff('admin');
  return ok(await update(params.entity, Number(params.id), await req.json(), s.name));
});

export const DELETE = route(async (_req: Request, { params }: Ctx) => {
  const s = requireStaff('admin');
  await remove(params.entity, Number(params.id), s.name);
  return ok();
});
