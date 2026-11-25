import 'server-only';
import { HttpError } from './api';

const hits = new Map<string, { times: number[]; until: number }>();

/** Simple in-memory sliding-window limiter keyed by client IP (or explicit subject) with bounded eviction. */
export function rateLimit(req: Request, key: string, limit: number, windowMs: number, subject?: string) {
  const now = Date.now();
  if (hits.size > 2000) {
    hits.forEach((v, k) => { if (v.until <= now) hits.delete(k); });
  }
  const who = subject || req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const id = `${key}:${who}`;
  const recent = (hits.get(id)?.times || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) throw new HttpError(429, 'Too many attempts. Please wait a minute and try again.');
  recent.push(now);
  hits.set(id, { times: recent, until: now + windowMs });
}
