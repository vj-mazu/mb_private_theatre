import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number;      // Time window in milliseconds
  maxRequests: number;   // Max requests per window
  keyPrefix?: string;    // Prefix for the rate limit key
  message?: string;      // Custom error message
  statusCode?: number;   // HTTP status code for rate limit exceeded
}

export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 60000,        // 1 minute default
    maxRequests = 100,       // 100 requests per minute default
    keyPrefix = 'api',
    message = 'Too many requests, please try again later.',
    statusCode = 429
  } = config;

  return async function rateLimiter(request: NextRequest): Promise<NextResponse | null> {
    // Generate key from IP + path
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const path = request.nextUrl.pathname;
    const key = `${keyPrefix}:${ip}:${path}`;

    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      return null; // Allow request
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      return NextResponse.json(
        { success: false, error: message, retryAfter },
        { 
          status: statusCode,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(record.resetTime / 1000))
          }
        }
      );
    }

    // Increment count
    record.count += 1;
    rateLimitStore.set(key, record);

    // Add rate limit headers to response (will be added by the caller)
    return null; // Allow request
  };
}

// Pre-configured rate limiters for different endpoints
export const bookingRateLimiter = createRateLimiter({
  windowMs: 60000,      // 1 minute
  maxRequests: 10,      // 10 booking attempts per minute per IP
  keyPrefix: 'booking',
  message: 'Too many booking attempts. Please wait a moment before trying again.'
});

export const otpRateLimiter = createRateLimiter({
  windowMs: 300000,     // 5 minutes
  maxRequests: 3,       // 3 OTP requests per 5 minutes per IP
  keyPrefix: 'otp',
  message: 'Too many OTP requests. Please wait 5 minutes before requesting another.'
});

export const enquiryRateLimiter = createRateLimiter({
  windowMs: 3600000,    // 1 hour
  maxRequests: 5,       // 5 enquiries per hour per IP
  keyPrefix: 'enquiry',
  message: 'Too many enquiries submitted. Please try again later.'
});

export const newsletterRateLimiter = createRateLimiter({
  windowMs: 3600000,    // 1 hour
  maxRequests: 3,       // 3 subscriptions per hour per IP
  keyPrefix: 'newsletter',
  message: 'Too many subscription attempts. Please try again later.'
});

export const couponRateLimiter = createRateLimiter({
  windowMs: 60000,      // 1 minute
  maxRequests: 20,      // 20 coupon validations per minute per IP
  keyPrefix: 'coupon',
  message: 'Too many coupon validation attempts. Please try again later.'
});

export const generalApiRateLimiter = createRateLimiter({
  windowMs: 60000,      // 1 minute
  maxRequests: 100,     // 100 requests per minute per IP
  keyPrefix: 'api',
  message: 'Too many requests. Please slow down.'
});

// Helper to add rate limit headers to successful responses
export function addRateLimitHeaders(response: NextResponse, key: string, maxRequests: number, remaining: number, resetTime: number): void {
  response.headers.set('X-RateLimit-Limit', String(maxRequests));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, remaining)));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
}