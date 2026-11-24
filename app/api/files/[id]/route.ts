import { one } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

const CACHE = 'public, max-age=31536000, immutable';

/**
 * Serves an uploaded file. Videos support byte ranges (Safari and iPhones only play a video when the server
 * answers Range requests with 206), and only the requested part is read from the database.
 */
export async function GET(req: Request, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return new Response('Not found', { status: 404 });
  const meta = await one<{ mime: string; size: number }>('SELECT mime, octet_length(data)::int AS size FROM files WHERE id=$1', [params.id]);
  if (!meta) return new Response('Not found', { status: 404 });
  const headers: Record<string, string> = { 'Content-Type': meta.mime, 'Cache-Control': CACHE, 'X-Content-Type-Options': 'nosniff' };

  if (!meta.mime.startsWith('video/')) {
    const file = await one<{ data: Buffer }>('SELECT data FROM files WHERE id=$1', [params.id]);
    return new Response(new Uint8Array(file!.data), { headers: { ...headers, 'Content-Length': String(meta.size) } });
  }

  headers['Accept-Ranges'] = 'bytes';
  const range = parseRange(req.headers.get('range'), meta.size);
  if (range === 'invalid') return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${meta.size}` } });
  const [start, end] = range ?? [0, meta.size - 1];
  const part = await one<{ data: Buffer }>('SELECT substring(data FROM $2 FOR $3) AS data FROM files WHERE id=$1', [params.id, start + 1, end - start + 1]);
  return new Response(new Uint8Array(part!.data), {
    status: range ? 206 : 200,
    headers: { ...headers, 'Content-Length': String(end - start + 1), ...(range ? { 'Content-Range': `bytes ${start}-${end}/${meta.size}` } : {}) },
  });
}

/** "bytes=START-END" / "bytes=START-" / "bytes=-SUFFIX" → [start, end]; null = no Range header (whole file). */
function parseRange(header: string | null, size: number): [number, number] | null | 'invalid' {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (!m[1] && !m[2]) || size === 0) return 'invalid';
  let start: number, end: number;
  if (!m[1]) { start = Math.max(0, size - Number(m[2])); end = size - 1; }
  else { start = Number(m[1]); end = m[2] ? Math.min(Number(m[2]), size - 1) : size - 1; }
  // Cap each chunk at 4 MB so one request never loads a whole large video into memory.
  end = Math.min(end, start + 4 * 1024 * 1024 - 1);
  return start > end || start >= size ? 'invalid' : [start, end];
}
