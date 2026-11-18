import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Must match lib/auth.ts. Development-only fallback; production requires JWT_SECRET.
const DEV_FALLBACK_SECRET = 'moviebash-dev-only-secret-do-not-use-in-production';

function getSecret(): string | null {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length >= 16) return secret;
  if (process.env.NODE_ENV === 'production') return null;
  return DEV_FALLBACK_SECRET;
}

function base64UrlToBytes(value: string): ArrayBuffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
  const binary = atob(padded);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return buffer;
}

/**
 * Verifies the HMAC-SHA256 signature of the admin JWT using Web Crypto.
 * A forged cookie (valid-looking payload, wrong signature) is rejected here,
 * so the page-level RBAC below cannot be bypassed.
 */
async function verifyAdminToken(token: string): Promise<any | null> {
  const secret = getSecret();
  if (!secret) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureValid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64UrlToBytes(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    if (!signatureValid) return null;

    const payload = JSON.parse(new TextDecoder().decode(base64UrlToBytes(parts[1])));
    if (!payload?.exp || Date.now() >= payload.exp * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin and /api/admin routes
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    // Always allow admin login page & admin login API endpoint
    if (pathname === '/admin/login' || pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('mb_admin_token')?.value;
    const payload = token ? await verifyAdminToken(token) : null;

    if (!payload) {
      if (pathname.startsWith('/api/admin')) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      const res = NextResponse.redirect(loginUrl);
      if (token) res.cookies.delete('mb_admin_token');
      return res;
    }

    // Staff may only use the bookings ledger, on pages and APIs alike.
    if (payload.role === 'staff') {
      const isRestrictedAdminRoute =
        pathname === '/admin' ||
        pathname === '/admin/' ||
        pathname.startsWith('/admin/reports') ||
        pathname.startsWith('/admin/cms') ||
        pathname.startsWith('/admin/security') ||
        pathname.startsWith('/admin/deleted');

      if (isRestrictedAdminRoute) {
        return NextResponse.redirect(new URL('/admin/bookings', request.url));
      }

      const isRestrictedApi =
        pathname.startsWith('/api/admin/stats') ||
        pathname.startsWith('/api/admin/cms') ||
        pathname.startsWith('/api/admin/users') ||
        pathname.startsWith('/api/admin/backup') ||
        pathname.startsWith('/api/admin/change-password');

      if (isRestrictedApi) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
