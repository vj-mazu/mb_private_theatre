import { one } from '@/lib/server/db';
import { getBooking, recordEvent } from '@/lib/server/bookings';
import { saveUpload } from '@/lib/server/files';
import { sendWhatsApp } from '@/lib/server/whatsapp';
import { ok, route, HttpError } from '@/lib/server/api';
import { rateLimit } from '@/lib/server/rate-limit';

/** Customer uploads the advance-payment screenshot; booking moves to "verify payment". */
export const POST = route(async (req: Request, { params }: { params: { ref: string } }) => {
  rateLimit(req, 'payment-upload', 6, 60_000);
  const booking = await getBooking({ ref: params.ref.toUpperCase() });
  if (!booking || booking.is_deleted) throw new HttpError(404, 'Booking not found');
  if (booking.status === 'cancelled') throw new HttpError(410, 'This booking hold has expired. Please book again.');
  if (!['awaiting_payment', 'payment_review'].includes(booking.status)) throw new HttpError(409, 'Payment is already verified for this booking');

  const url = await saveUpload(await req.formData(), 'screenshot', { maxSide: 1280, quality: 70 });
  const updated = await one(
    `UPDATE bookings SET payment_screenshot=$2, status='payment_review', hold_expires_at=NULL, updated_at=now()
     WHERE id=$1 AND status IN ('awaiting_payment','payment_review') RETURNING id`, [booking.id, url]);
  if (!updated) throw new HttpError(409, 'This booking can no longer accept a payment screenshot');
  await recordEvent(booking.id, 'customer', 'payment_uploaded', { screenshot: url });

  // No message to the guest yet: they only get WhatsApp once staff verify the payment and confirm.
  // Only the venue is alerted so someone can verify it.
  if (process.env.WHATSAPP_ADMIN_NUMBER) {
    const fresh = await getBooking({ id: booking.id });
    if (fresh) await sendWhatsApp({ to: process.env.WHATSAPP_ADMIN_NUMBER, kind: 'admin_alert', booking: fresh });
  }
  return ok({ status: 'payment_review' });
});
