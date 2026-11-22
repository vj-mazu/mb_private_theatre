import { strictPhone } from '@/lib/server/bookings';
import { isValidPhone } from '@/lib/booking-rules';
import { z } from 'zod';
import { one } from '@/lib/server/db';
import { sendWhatsApp } from '@/lib/server/whatsapp';
import { ok, route } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name').max(80),
  phone: z.string().transform(strictPhone).refine(isValidPhone, 'Enter a valid 10-digit mobile number'),
  email: z.string().trim().max(120).optional().default(''),
  branch: z.string().trim().max(80).optional().default(''),
  occasion: z.string().trim().max(60).optional().default(''),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).transform((v) => v || null),
  message: z.string().trim().max(1000).optional().default(''),
});

export const POST = route(async (req: Request) => {
  rateLimit(req, 'enquiry', 4, 60_000);
  const d = schema.parse(await req.json());
  const row = await one<{ id: number }>(
    'INSERT INTO enquiries (name, phone, email, branch, occasion, preferred_date, message) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
    [d.name, d.phone, d.email, d.branch, d.occasion, d.preferred_date, d.message]);
  if (process.env.WHATSAPP_ADMIN_NUMBER) {
    await sendWhatsApp({
      to: process.env.WHATSAPP_ADMIN_NUMBER, kind: 'admin_alert',
      text: `New enquiry from ${d.name} (${d.phone})\n${[d.branch, d.occasion, d.preferred_date].filter(Boolean).join(' · ')}\n${d.message}`,
    });
  }
  return ok({ id: row?.id });
});
