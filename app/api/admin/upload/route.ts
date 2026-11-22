import { saveUpload } from '@/lib/server/files';
import { ok, route, requireStaff } from '@/lib/server/api';

export const POST = route(async (req: Request) => {
  requireStaff();
  return ok({ url: await saveUpload(await req.formData()) });
});
