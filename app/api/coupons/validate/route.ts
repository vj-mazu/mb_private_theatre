import { z } from 'zod';
import { one } from '@/lib/server/db';
import { couponDiscount } from '@/lib/booking-rules';
import { ok, route, HttpError } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({ code: z.string().trim().toUpperCase().min(2).max(30), subtotal: z.coerce.number().min(0) });

export const POST = route(async (req: Request) => {
  rateLimit(req, 'coupon', 15, 60_000);
  const { code, subtotal } = schema.parse(await req.json());
  const c = await one<any>(
    `SELECT code, discount_type, value, min_amount FROM coupons WHERE code=$1 AND is_active
       AND (expires_on IS NULL OR expires_on >= CURRENT_DATE) AND (usage_limit IS NULL OR used_count < usage_limit)`, [code]);
  if (!c) throw new HttpError(404, 'This coupon code is not valid');
  if (subtotal < c.min_amount) throw new HttpError(400, `Add ₹${c.min_amount - subtotal} more to use ${c.code}`);
  return ok({ code: c.code, discount: couponDiscount(c, subtotal) });
});
