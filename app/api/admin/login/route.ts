import { z } from 'zod';
import { NextResponse } from 'next/server';
import { one, q, audit } from '@/lib/server/db';
import { checkPassword, signSession, SESSION_COOKIE } from '@/lib/server/auth';
import { route, HttpError } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({ username: z.string().trim().toLowerCase().min(1), password: z.string().min(1) });

export const POST = route(async (req: Request) => {
  rateLimit(req, 'login', 8, 5 * 60_000);
  const { username, password } = schema.parse(await req.json());
  rateLimit(req, 'login-user', 10, 5 * 60_000, username);
  const user = await one<any>('SELECT * FROM users WHERE lower(username)=$1 AND is_active', [username]);
  if (!user || !(await checkPassword(password, user.password_hash))) throw new HttpError(401, 'Wrong username or password');

  await q('UPDATE users SET last_login_at=now() WHERE id=$1', [user.id]);
  await audit(user.name, 'login', 'user', user.id);
  const token = signSession({ id: user.id, name: user.name, username: user.username, role: user.role, branch_id: user.branch_id });
  const res = NextResponse.json({ ok: true, data: { role: user.role } });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 12 * 60 * 60,
  });
  return res;
});
