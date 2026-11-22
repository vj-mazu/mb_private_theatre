import 'server-only';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export function getSession(): Session | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const p = jwt.verify(token, secret()) as Session;
    // Tokens from the previous system (no username / old role names) are not valid sessions.
    if (!p.username || (p.role !== 'admin' && p.role !== 'staff')) return null;
    return { id: p.id, name: p.name, username: p.username, role: p.role, branch_id: p.branch_id ?? null };
  } catch {
    return null;
  }
}
