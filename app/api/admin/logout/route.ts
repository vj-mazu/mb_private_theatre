import { NextResponse } from 'next/server';
import { getSession, SESSION_COOKIE } from '@/lib/server/auth';
import { q } from '@/lib/server/db';

export async function POST() {
  const s = await getSession().catch(() => null);
  if (s) await q('UPDATE users SET sessions_valid_after=now() WHERE id=$1', [s.id]).catch(() => {});
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
