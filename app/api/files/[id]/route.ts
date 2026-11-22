import { one } from '@/lib/server/db';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response('Not found', { status: 404 });
  const file = await one<{ mime: string; data: Buffer }>('SELECT mime, data FROM files WHERE id=$1', [params.id]);
  if (!file) return new Response('Not found', { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: { 'Content-Type': file.mime, 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}
