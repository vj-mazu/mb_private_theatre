import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const TOKEN_NAME = 'mb_admin_token';
const CUSTOMER_TOKEN_NAME = 'mb_customer_token';

// Development-only fallback. Production must supply JWT_SECRET; otherwise we refuse to
// sign or verify sessions rather than silently using a well-known key.
const DEV_FALLBACK_SECRET = 'moviebash-dev-only-secret-do-not-use-in-production';

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is not configured. Refusing to use a fallback signing key in production.');
  }
  return DEV_FALLBACK_SECRET;
}

export interface AdminPayload {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'branch_manager' | 'staff';
  branch_id?: number | null;
}

export interface CustomerPayload {
  id: number;
  phone: string;
  name: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function hashPasswordSync(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signAdminToken(payload: AdminPayload): string {
  // 8-hour shift token for security (prevents unattended devices staying permanently logged into Super Admin)
  return jwt.sign(payload, getSecret(), { expiresIn: '8h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, getSecret()) as AdminPayload;
  } catch (err) {
    return null;
  }
}

export function signCustomerToken(payload: CustomerPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: '30d' });
}

export function verifyCustomerToken(token: string): CustomerPayload | null {
  try {
    return jwt.verify(token, getSecret()) as unknown as CustomerPayload;
  } catch (err) {
    return null;
  }
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function getCustomerSession(): Promise<CustomerPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(CUSTOMER_TOKEN_NAME)?.value;
  if (!token) return null;
  return verifyCustomerToken(token);
}
