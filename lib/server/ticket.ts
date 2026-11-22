import 'server-only';
import { getBooking } from './bookings';

/** Public view of a booking (shown on the ticket page; no internal notes, masked phone). */
export async function getTicket(ref: string) {
  if (!/^[A-Z0-9-]{6,40}$/i.test(ref)) return null;
  const b = await getBooking({ ref: ref.toUpperCase() });
  if (!b || b.is_deleted) return null;
  return {
    ref: b.ref,
    status: b.status as string,
    customer_name: b.customer_name as string,
    phone_masked: `••••••${String(b.phone).slice(-4)}`,
    special_person_name: b.special_person_name as string,
    occasion: b.occasion as string,
    booking_date: b.booking_date as string,
    slot_label: b.slot_label as string,
    theatre_name: b.theatre_name as string,
    theatre_image: b.theatre_image as string,
    branch_name: b.branch_name as string,
    branch_address: b.branch_address as string,
    branch_phone: b.branch_phone as string,
    map_url: b.map_url as string,
    package_name: b.package_name as string,
    package_includes: (b.package_includes || []) as string[],
    cake_kg: Number(b.cake_kg) || 0.5,
    guests: b.guests as number,
    cake_name: b.cake_name as string,
    items: (b.items || []) as { name: string; price: number; qty: number }[],
    base_amount: b.base_amount as number,
    extra_persons: b.extra_persons as number,
    extra_person_amount: b.extra_person_amount as number,
    extra_hours: Number(b.extra_hours) || 0,
    extra_hour_amount: Number(b.extra_hour_amount) || 0,
    cake_amount: b.cake_amount as number,
    discount: b.discount as number,
    total: b.total as number,
    amount_paid: b.amount_paid as number,
    has_screenshot: Boolean(b.payment_screenshot),
    hold_expires_at: b.hold_expires_at ? new Date(b.hold_expires_at).toISOString() : null,
  };
}
export type Ticket = NonNullable<Awaited<ReturnType<typeof getTicket>>>;
