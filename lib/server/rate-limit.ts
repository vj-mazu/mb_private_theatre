import 'server-only';
import { HttpError } from './api';

const hits = new Map<string, number[]>();

/** Simple in-memory sliding-window limiter keyed by client IP. */
export function rateLimit(req: Request, key: string, limit: number, windowMs: number) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'local';
  const id = `${key}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(id) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) throw new HttpError(429, 'Too many attempts. Please wait a minute and try again.');
  recent.push(now);
  hits.set(id, recent);
}
