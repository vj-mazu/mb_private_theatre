import { NextResponse, type NextRequest } from 'next/server';

// Admin-only pages; staff are sent to the bookings list.
const ADMIN_ONLY = ['/admin/catalog', '/admin/gallery', '/admin/coupons', '/admin/staff', '/admin/settings', '/admin/whatsapp', '/admin/revenue', '/admin/enquiries', '/admin/website', '/admin/promotions', '/admin/blocks'];

function b64url(value: string): ArrayBuffer {
  const s = value.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(s.padEnd(s.length + ((4 - (s.length % 4)) % 4), '='));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0)).buffer as ArrayBuffer;
}

/** Verifies the HS256 session JWT with Web Crypto (Edge runtime). */
async function verify(token: string): Promise<{ role: string } | null> {
  const secret = process.env.JWT_SECRET?.trim();
  const parts = token.split('.');
  if (!secret || parts.length !== 3) return null;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const valid = await crypto.subtle.verify('HMAC', key, b64url(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`));
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64url(parts[1])));
    const current = payload?.exp && Date.now() < payload.exp * 1000 && payload.username && ['admin', 'staff'].includes(payload.role);
    return current ? payload : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === '/admin/login' || pathname === '/api/admin/login' || pathname === '/api/admin/logout') return NextResponse.next();

  const token = req.cookies.get('mb_admin_token')?.value;
  const session = token ? await verify(token) : null;

  if (!session) {
    if (pathname.startsWith('/api/')) return NextResponse.json({ ok: false, error: 'Please sign in again' }, { status: 401 });
    const url = new URL('/admin/login', req.url);
    url.searchParams.set('next', pathname);
    const res = NextResponse.redirect(url);
    if (token) res.cookies.delete('mb_admin_token');
    return res;
  }
  if (session.role !== 'admin' && ADMIN_ONLY.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/admin/bookings', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/admin/:path*', '/api/admin/:path*'] };
