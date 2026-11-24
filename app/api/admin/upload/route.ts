import { saveUpload, saveVideo } from '@/lib/server/files';
import { ok, route, requireStaff } from '@/lib/server/api';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // video compression can take a minute or two

/** Images for everyone signed in; videos (?kind=video) for admins only. */
export const POST = route(async (req: Request) => {
  const video = new URL(req.url).searchParams.get('kind') === 'video';
  await requireStaff(video ? 'admin' : undefined);
  const form = await req.formData();
  return ok(video ? await saveVideo(form) : { url: await saveUpload(form) });
});
