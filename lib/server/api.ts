import 'server-only';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSession, type Session } from './auth';
import { BookingError } from './bookings';

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export const ok = (data: unknown = null, init?: ResponseInit) => NextResponse.json({ ok: true, data }, init);

export function requireStaff(role?: 'admin'): Session {
  const s = getSession();
  if (!s) throw new HttpError(401, 'Please sign in again');
  if (role === 'admin' && s.role !== 'admin') throw new HttpError(403, 'Only admins can do this');
  return s;
}

/** Wraps a route handler with uniform JSON error responses. */
export function route<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (err: any) {
      if (err instanceof ZodError) {
        return NextResponse.json({ ok: false, error: err.issues[0]?.message || 'Invalid input' }, { status: 400 });
      }
      if (err instanceof HttpError || err instanceof BookingError) {
        return NextResponse.json({ ok: false, error: err.message }, { status: err.status });
      }
      if (err?.code === '23505') {
        return NextResponse.json({ ok: false, error: 'That value already exists' }, { status: 409 });
      }
      if (err?.code === '23503') {
        return NextResponse.json({ ok: false, error: 'This item is still used by other records' }, { status: 409 });
      }
      console.error('[api]', err);
      return NextResponse.json({ ok: false, error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
  };
}
