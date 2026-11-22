import { q } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/** Liveness/readiness check used by Docker and uptime monitors. */
export async function GET() {
  try {
    await q('SELECT 1');
    return Response.json({ ok: true, db: 'up' });
  } catch {
    return Response.json({ ok: false, db: 'down' }, { status: 503 });
  }
}
