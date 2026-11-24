import { z } from 'zod';
import { q } from '@/lib/server/db';
import { addPayment, bookingToInput, getBooking, recordEvent, setStatus, updateBooking } from '@/lib/server/bookings';
import { getSettings } from '@/lib/server/catalog';
import { composeText, sendWhatsApp, waLink, type MessageKind } from '@/lib/server/whatsapp';
import { ok, route, requireStaff, HttpError } from '@/lib/server/api';
import type { Session } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

async function load(id: string, s: Session) {
  const b = await getBooking({ id: Number(id) });
  if (!b) throw new HttpError(404, 'Booking not found');
  if (s.role === 'staff' && s.branch_id && b.branch_id !== s.branch_id) throw new HttpError(403, 'This booking belongs to another branch');
  return b;
}

export const GET = route(async (_req: Request, { params }: Ctx) => {
  const s = await requireStaff();
  const b = await load(params.id, s);
  const [payments, events, messages] = await Promise.all([
    q('SELECT * FROM payments WHERE booking_id=$1 ORDER BY created_at', [b.id]),
    q('SELECT * FROM booking_events WHERE booking_id=$1 ORDER BY created_at DESC', [b.id]),
    q('SELECT id, kind, status, error, created_at FROM whatsapp_messages WHERE booking_id=$1 ORDER BY created_at DESC', [b.id]),
  ]);
  return ok({ booking: b, input: bookingToInput(b), payments, events, messages, waLink: waLink(b.whatsapp || b.phone, composeText('confirmation', b)) });
});

/** Full edit (also used for reschedule). */
export const PUT = route(async (req: Request, { params }: Ctx) => {
  const s = await requireStaff();
  await load(params.id, s);
  const row = await updateBooking(Number(params.id), await req.json(), { kind: 'staff', name: s.name, role: s.role, branch_id: s.branch_id });
  return ok(row);
});

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('confirm'), advance: z.coerce.number().int().min(0).optional() }),
  z.object({ action: z.literal('payment'), amount: z.coerce.number().int().positive(), method: z.string(), note: z.string().optional().default('') }),
  z.object({
    action: z.literal('close'),
    package_id: z.coerce.number().int().positive().nullable().optional(),
    guests: z.coerce.number().int().min(1).max(50).optional(),
    extra_hours: z.coerce.number().int().min(0).max(2).optional(),
    addons: z.array(z.object({ addon_id: z.coerce.number().int(), qty: z.coerce.number().int().min(1).max(20) })).max(40),
    custom_items: z.array(z.object({ name: z.string().min(1).max(80), price: z.coerce.number().int().min(0).max(1000000), qty: z.coerce.number().int().min(1).max(50) })).max(30),
    discount: z.coerce.number().int().min(0),
    final_amount: z.coerce.number().int().min(0),
    method: z.string(),
    notes: z.string().optional().default(''),
  }),
  z.object({ action: z.literal('cancel'), reason: z.string().trim().min(2, 'Enter a reason') }),
  z.object({ action: z.literal('reopen') }),
  z.object({ action: z.literal('delete') }),
  z.object({ action: z.literal('restore') }),
  z.object({ action: z.literal('whatsapp'), kind: z.enum(['confirmation', 'reminder', 'reschedule', 'cancellation', 'custom']), text: z.string().optional() }),
]);

export const POST = route(async (req: Request, { params }: Ctx) => {
  const s = await requireStaff();
  const b = await load(params.id, s);
  const body = actionSchema.parse(await req.json());
  const staffActor = { kind: 'staff' as const, name: s.name, role: s.role, branch_id: s.branch_id };

  switch (body.action) {
    case 'confirm': {
      if (!['awaiting_payment', 'payment_review'].includes(b.status)) throw new HttpError(409, 'Booking is already confirmed');
      const advance = body.advance ?? (await getSettings()).payment.advance_amount;
      if (advance > 0 && b.amount_paid === 0) await addPayment(b.id, advance, 'upi', 'Advance (verified screenshot)', s.name);
      await setStatus(b.id, 'confirmed', s.name);
      const fresh = await getBooking({ id: b.id });
      const wa = await sendWhatsApp({ to: fresh.whatsapp || fresh.phone, kind: 'confirmation', booking: fresh });
      return ok({ whatsapp: wa.status });
    }
    case 'payment':
      await addPayment(b.id, body.amount, body.method, body.note, s.name);
      return ok();
    case 'close': {
      if (b.status === 'completed') throw new HttpError(409, 'Booking is already completed');
      if (b.status === 'cancelled') throw new HttpError(409, 'Cancelled bookings cannot be completed');
      const base = bookingToInput(b);
      const input = {
        ...base, addons: body.addons, custom_items: body.custom_items, discount: body.discount, notes: body.notes || b.notes,
        package_id: body.package_id === undefined ? base.package_id : body.package_id, guests: body.guests ?? base.guests,
        extra_hours: body.extra_hours ?? base.extra_hours,
      };
      await updateBooking(b.id, input, staffActor);
      if (body.final_amount > 0) await addPayment(b.id, body.final_amount, body.method, 'Final payment at closing', s.name);
      await setStatus(b.id, 'completed', s.name);
      return ok();
    }
    case 'cancel': {
      await setStatus(b.id, 'cancelled', s.name, { reason: body.reason });
      const fresh = await getBooking({ id: b.id });
      await sendWhatsApp({ to: fresh.whatsapp || fresh.phone, kind: 'cancellation', booking: fresh });
      return ok();
    }
    case 'reopen':
      if (b.status !== 'completed') throw new HttpError(409, 'Only completed bookings can be reopened');
      await setStatus(b.id, 'confirmed', s.name);
      return ok();
    case 'delete':
      if (s.role !== 'admin') throw new HttpError(403, 'Only admins can delete bookings');
      await q("UPDATE bookings SET is_deleted=true, status=CASE WHEN status IN ('awaiting_payment','payment_review','confirmed') THEN 'cancelled' ELSE status END, updated_at=now() WHERE id=$1", [b.id]);
      await recordEvent(b.id, s.name, 'deleted');
      return ok();
    case 'restore':
      if (s.role !== 'admin') throw new HttpError(403, 'Only admins can restore bookings');
      await q('UPDATE bookings SET is_deleted=false, updated_at=now() WHERE id=$1', [b.id]);
      await recordEvent(b.id, s.name, 'restored');
      return ok();
    case 'whatsapp': {
      const res = await sendWhatsApp({ to: b.whatsapp || b.phone, kind: body.kind as MessageKind, booking: b, text: body.kind === 'custom' ? body.text : undefined });
      return ok(res);
    }
  }
});
