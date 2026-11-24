import 'server-only';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { one } from './db';

export const SESSION_COOKIE = 'mb_admin_token';

export interface Session {
  id: number;
  name: string;
  username: string;
  role: 'admin' | 'staff';
  branch_id: number | null;
}

function secret(): string {
  const s = process.env.JWT_SECRET?.trim();
  if (!s || s.length < 16) throw new Error('JWT_SECRET must be set (at least 16 characters)');
  return s;
}

export const hashPassword = (pw: string) => bcrypt.hash(pw, 10);
export const checkPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export function signSession(s: Session): string {
  return jwt.sign(s, secret(), { expiresIn: '12h' });
}

/** The signed-in staff member, re-checked against the database on every call. */
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  let p: Session & { iat?: number };
  try {
    p = jwt.verify(token, secret()) as Session & { iat?: number };
  } catch {
    return null;
  }
  // Tokens from the previous system (no username / old role names) are not valid sessions.
  if (!p.id || !p.username || (p.role !== 'admin' && p.role !== 'staff')) return null;
  // A deactivated or deleted account, or one whose password changed after this sign-in, is signed out at once;
  // role and branch always come from the database, so a demotion applies immediately.
  const u = await one<{ name: string; username: string; role: 'admin' | 'staff'; branch_id: number | null; valid_after: number | null }>(
    `SELECT name, username, role, branch_id, floor(extract(epoch FROM sessions_valid_after))::bigint AS valid_after
     FROM users WHERE id=$1 AND is_active`, [p.id]);
  if (!u || (u.role !== 'admin' && u.role !== 'staff')) return null;
  if (u.valid_after && (p.iat ?? 0) < Number(u.valid_after)) return null;
  return { id: p.id, name: u.name, username: u.username, role: u.role, branch_id: u.branch_id ?? null };
}
