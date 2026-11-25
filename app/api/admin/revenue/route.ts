import { z } from 'zod';
import { ok, route, requireStaff } from '@/lib/server/api';
import { revenueReport } from '@/lib/server/revenue';

export const dynamic = 'force-dynamic';

const schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  branch: z.coerce.number().int().optional(),
});

export const GET = route(async (req: Request) => {
  await requireStaff('admin');
  const p = schema.parse(Object.fromEntries(new URL(req.url).searchParams));
  return ok(await revenueReport(p.from, p.to, p.branch));
});
