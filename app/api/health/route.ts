import { q } from '@/lib/server/db';

export const dynamic = 'force-dynamic';

/** Short, non-secret reason for a failed database connection (no host, user or password is ever shown). */
function reason(err: any): string {
  const code = String(err?.code || '');
  const msg = String(err?.message || '');
  if (/DATABASE_URL is not configured/.test(msg)) return 'DATABASE_URL is missing';
  if (code === '28P01' || /password authentication failed/i.test(msg)) return 'wrong database password';
  if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'database host not found (check the address)';
  if (code === 'ENETUNREACH' || code === 'EHOSTUNREACH') return 'host unreachable (use the Supabase pooler address, not db.xxx.supabase.co)';
  if (code === 'ECONNREFUSED') return 'connection refused (check the port: 6543 for Vercel)';
  if (/timeout/i.test(msg) || code === 'ETIMEDOUT') return 'connection timed out';
  if (/tenant or user not found/i.test(msg)) return 'wrong user name in DATABASE_URL (pooler user looks like postgres.<project-ref>)';
  if (/self.signed|certificate/i.test(msg)) return 'SSL certificate problem';
  if (/invalid url|Invalid URL|URI malformed/i.test(msg)) return 'DATABASE_URL is not a valid address (special characters in the password?)';
  return code || 'unknown';
}

/** Liveness/readiness check used by Docker and uptime monitors. */
export async function GET() {
  try {
    await q('SELECT 1');
    const tables = await q<{ n: number }>("SELECT count(*)::int AS n FROM information_schema.tables WHERE table_schema='public' AND table_name IN ('bookings','theatres','settings')");
    const ready = tables[0]?.n === 3;
    return Response.json({ ok: ready, db: 'up', tables: ready ? 'ok' : 'missing — run npm run db:setup' }, { status: ready ? 200 : 503 });
  } catch (err) {
    console.error('[health] database connection failed:', (err as any)?.code, (err as any)?.message);
    return Response.json({ ok: false, db: 'down', reason: reason(err) }, { status: 503 });
  }
}
