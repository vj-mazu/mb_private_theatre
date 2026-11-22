import { z } from 'zod';
import { q, one, audit } from '@/lib/server/db';
import { hashPassword } from '@/lib/server/auth';
import { ok, route, requireStaff, HttpError } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

const schema = z.object({
  id: z.coerce.number().int().optional(),
  name: z.string().trim().min(2, 'Enter the name'),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,30}$/, 'Username: 3–30 letters/numbers'),
  phone: z.string().trim().optional().default(''),
  role: z.enum(['admin', 'staff']),
  branch_id: z.coerce.number().int().nullable().optional().transform((v) => v || null),
  is_active: z.boolean().optional().default(true),
  password: z.string().optional().default(''),
});

export const GET = route(async () => {
  requireStaff('admin');
  return ok(await q('SELECT id, name, username, phone, role, branch_id, is_active, last_login_at, created_at FROM users ORDER BY role, name'));
});

export const POST = route(async (req: Request) => {
  const s = requireStaff('admin');
  const d = schema.parse(await req.json());
  if (d.password && d.password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');

  if (d.id) {
    if (d.id === s.id && (d.role !== 'admin' || !d.is_active)) throw new HttpError(400, 'You cannot remove your own admin access');
    await q('UPDATE users SET name=$2, username=$3, phone=$4, role=$5, branch_id=$6, is_active=$7 WHERE id=$1',
      [d.id, d.name, d.username, d.phone, d.role, d.branch_id, d.is_active]);
    if (d.password) await q('UPDATE users SET password_hash=$2 WHERE id=$1', [d.id, await hashPassword(d.password)]);
    await audit(s.name, 'update', 'user', d.id, { username: d.username, role: d.role, password_changed: !!d.password });
    return ok();
  }
  if (!d.password) throw new HttpError(400, 'Set a password for the new account');
  const row = await one<any>('INSERT INTO users (name, username, phone, role, branch_id, is_active, password_hash) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
    [d.name, d.username, d.phone, d.role, d.branch_id, d.is_active, await hashPassword(d.password)]);
  await audit(s.name, 'create', 'user', row.id, { username: d.username, role: d.role });
  return ok(row);
});

export const DELETE = route(async (req: Request) => {
  const s = requireStaff('admin');
  const id = Number(new URL(req.url).searchParams.get('id'));
  if (id === s.id) throw new HttpError(400, 'You cannot delete your own account');
  await q('DELETE FROM users WHERE id=$1', [id]);
  await audit(s.name, 'delete', 'user', id);
  return ok();
});
