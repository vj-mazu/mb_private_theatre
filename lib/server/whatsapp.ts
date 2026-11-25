import 'server-only';
import { q } from './db';
import { formatDate, inr } from '../booking-rules';
import { getSettings } from './catalog';

/**
 * Official Meta WhatsApp Cloud API.
 *
 * Env:
 *   WHATSAPP_TOKEN            permanent system-user access token
 *   WHATSAPP_PHONE_NUMBER_ID  sender phone-number id from Meta dashboard
 *   WHATSAPP_API_VERSION      optional, default v21.0
 *   WHATSAPP_TEMPLATE_LANG    optional, default en
 *   WHATSAPP_TEMPLATE_<KIND>  optional approved template name per kind
 *                             (CONFIRMATION, RECEIVED, RESCHEDULE, CANCELLATION, REMINDER).
 *                             Template body variables, in order:
 *                             {{1}} name {{2}} ref {{3}} date {{4}} time {{5}} theatre
 *                             {{6}} branch {{7}} total {{8}} paid {{9}} balance {{10}} ticket link
 *   WHATSAPP_ADMIN_NUMBER     optional, gets an alert when a guest uploads a payment screenshot (and for each enquiry)
 *
 * Without a template, a plain text message is sent. Meta only delivers plain text
 * inside the 24-hour customer service window, so templates are recommended.
 */

export type MessageKind = 'confirmation' | 'received' | 'reschedule' | 'cancellation' | 'reminder' | 'custom' | 'admin_alert';

export function whatsappConfigured() {
  return Boolean(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

export function normalizePhone(phone: string): string {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length === 10) return `91${digits}`;
  return digits;
}

export interface BookingForMessage {
  id: number; ref: string; customer_name: string; phone: string; whatsapp: string; booking_date: string; slot_label: string;
  theatre_name: string; branch_name: string; branch_address?: string; map_url?: string; branch_phone?: string;
  total: number; amount_paid: number; discount?: number; special_person_name?: string; occasion?: string; package_name?: string;
  extra_persons?: number; extra_hours?: number; extra_hour_amount?: number; cake_name?: string; package_includes?: string[]; items?: { kind: string; name: string; price: number; qty: number; included?: number }[];
  source?: string; payment_method?: string; visit_notes?: string[];
}

const SOURCE_LABEL: Record<string, string> = { website: 'Website', whatsapp: 'WhatsApp', walkin: 'Walk-in', phone: 'Phone call', instagram: 'Instagram', other: 'Other' };
const METHOD_LABEL: Record<string, string> = { upi: 'UPI', cash: 'Cash', card: 'Card', bank: 'Bank transfer' };

/** The booking sheet in the business's standard order (used for confirmation / reschedule / ticket). */
export function bookingSheet(b: BookingForMessage): string {
  const items = b.items || [];
  const addons = items.filter((i) => i.kind === 'addon').map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}${i.included ? ' (incl.)' : ''}`).join(', ');
  const custom = items.filter((i) => i.kind === 'custom').map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''} – ${inr(i.price * i.qty)}`).join(', ');
  const lines = [
    `🎟️ *Ticket No:* ${b.ref}`,
    '',
    `*Special person's name:* ${b.special_person_name || b.customer_name}`,
    `*WhatsApp number:* ${b.whatsapp || b.phone}`,
    `*Occasion:* ${b.occasion || '—'}`,
    `*Branch:* ${b.branch_name}`,
    `*Private theatre:* ${b.theatre_name}`,
    `*Timings:* ${formatDate(b.booking_date)} · ${b.slot_label}`,
    `*Package or custom:* ${b.package_name || 'Custom'}`,
    ...(b.package_includes?.length ? [`*Package includes:* ${b.package_includes.join(', ')}`] : []),
    `*Extra persons:* ${b.extra_persons || 0}`,
    ...(b.extra_hours ? [`*Extra hours:* ${b.extra_hours} (${inr(b.extra_hour_amount || 0)})`] : []),
    `*Cake flavour:* ${b.cake_name || '—'}`,
    `*Extra add-ons (charged):* ${addons || '—'}`,
    ...(custom ? [`*Extras:* ${custom}`] : []),
    `*Discount:* ${inr(b.discount || 0)}`,
    '',
    `*Total amount:* ${inr(b.total)}`,
    `*Advance:* ${inr(b.amount_paid)}`,
    `*Balance:* ${inr(b.total - b.amount_paid)}`,
    '',
    `*Payment type:* ${METHOD_LABEL[b.payment_method || ''] || b.payment_method || 'UPI'}`,
    `*Booking:* ${SOURCE_LABEL[b.source || ''] || b.source || 'Website'}`,
  ];
  return lines.join('\n');
}

export function ticketUrl(ref: string) {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://moviebash.in').replace(/\/$/, '');
  return `${base}/ticket/${ref}`;
}

export function adminBookingUrl(id: number) {
  const base = (process.env.NEXT_PUBLIC_APP_URL || 'https://moviebash.in').replace(/\/$/, '');
  return `${base}/admin/bookings/${id}`;
}

/** {{1}}..{{8}} of the WHATSAPP_TEMPLATE_ADMIN_ALERT template (see DEPLOYMENT.md). */
function adminParams(b: BookingForMessage) {
  return [
    b.ref, b.special_person_name || b.customer_name, `+${normalizePhone(b.whatsapp || b.phone)}`, b.occasion || '—',
    `${formatDate(b.booking_date)} · ${b.slot_label}`, `${b.theatre_name}, ${b.branch_name}`, inr(b.total), adminBookingUrl(b.id),
  ];
}

function params(b: BookingForMessage) {
  return [
    b.customer_name, b.ref, formatDate(b.booking_date), b.slot_label, b.theatre_name, b.branch_name,
    inr(b.total), inr(b.amount_paid), inr(b.total - b.amount_paid), ticketUrl(b.ref),
  ];
}

export function composeText(kind: MessageKind, b: BookingForMessage): string {
  const [name, ref, date, time, theatre, branch, total, , balance, link] = params(b);
  const details = `*Booking ID:* ${ref}\n*Date:* ${date}\n*Time:* ${time}\n*Theatre:* ${theatre}, ${branch}`;
  const location = `\n\n📍 *${branch}*${b.branch_address ? `\n${b.branch_address}` : ''}${b.map_url ? `\nMap: ${b.map_url}` : ''}${b.branch_phone ? `\n📞 Helpline: ${b.branch_phone}` : ''}`;
  const notes = b.visit_notes?.length ? `\n\n*Good to know*\n${b.visit_notes.map((n) => `• ${n}`).join('\n')}` : '';
  switch (kind) {
    case 'received':
      return `Hi ${name}, we received your booking request and payment screenshot. We'll confirm shortly.\n\n${details}${location}\n\nTicket: ${link}`;
    case 'confirmation':
      return `Hi ${name}, your Movie Bash booking is confirmed 🎉\n\n${bookingSheet(b)}${location}${notes}\n\nView / download ticket: ${link}`;
    case 'reschedule':
      return `Hi ${name}, your Movie Bash booking has been rescheduled ✅\n\n${bookingSheet(b)}${location}${notes}\n\nView / download ticket: ${link}`;
    case 'cancellation':
      return `Hi ${name}, your Movie Bash booking ${ref} for ${date} has been cancelled. Contact us for any help.`;
    case 'reminder':
      return `Hi ${name}, a reminder of your celebration at Movie Bash today 🎬\n\n${details}${location}${notes}\n\nBalance to pay: ${balance}`;
    case 'admin_alert':
      return [
        `🔔 *Payment to verify* · ${ref}`,
        '',
        `*Special person:* ${b.special_person_name || name}`,
        `*WhatsApp:* +${normalizePhone(b.whatsapp || b.phone)}`,
        `*Occasion:* ${b.occasion || '—'}`,
        `*When:* ${date} · ${time}`,
        `*Room:* ${theatre}, ${branch}`,
        `*Package:* ${b.package_name || 'Custom'}`,
        `*Total:* ${total}`,
        '',
        'The guest uploaded the advance payment screenshot and is waiting. Check it and confirm:',
        adminBookingUrl(b.id),
      ].join('\n');
    default:
      return '';
  }
}

async function callApi(payload: Record<string, unknown>): Promise<{ ok: boolean; id?: string; error?: string }> {
  const version = process.env.WHATSAPP_API_VERSION || 'v21.0';
  try {
    const res = await fetch(`https://graph.facebook.com/${version}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
      cache: 'no-store',
    });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: json?.error?.message || `HTTP ${res.status}` };
    return { ok: true, id: json?.messages?.[0]?.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error' };
  }
}

/** Sends a WhatsApp message and records it in whatsapp_messages. Never throws. */
export async function sendWhatsApp(opts: { to: string; kind: MessageKind; booking?: BookingForMessage; text?: string }) {
  const to = normalizePhone(opts.to);
  if (opts.booking && !opts.booking.visit_notes && ['confirmation', 'reminder', 'reschedule'].includes(opts.kind)) {
    opts = { ...opts, booking: { ...opts.booking, visit_notes: (await getSettings().catch(() => null))?.visit.notes ?? [] } };
  }
  const text = opts.text || (opts.booking ? composeText(opts.kind, opts.booking) : '');
  const template = process.env[`WHATSAPP_TEMPLATE_${opts.kind.toUpperCase()}`];

  let status = 'not_configured';
  let providerId = '';
  let error = 'WhatsApp API is not configured (WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID).';

  if (whatsappConfigured() && to.length >= 11 && text) {
    const result = template && opts.booking
      ? await callApi({
          to, type: 'template',
          template: {
            name: template,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
            components: [{ type: 'body', parameters: (opts.kind === 'admin_alert' ? adminParams(opts.booking) : params(opts.booking)).map((t) => ({ type: 'text', text: String(t) })) }],
          },
        })
      : await callApi({ to, type: 'text', text: { preview_url: true, body: text } });
    status = result.ok ? 'sent' : 'failed';
    providerId = result.id || '';
    error = result.error || '';
  } else if (to.length < 11) {
    status = 'failed';
    error = 'Invalid phone number';
  }

  await q(
    'INSERT INTO whatsapp_messages (booking_id, to_phone, kind, body, status, provider_id, error) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [opts.booking?.id ?? null, to, opts.kind, text, status, providerId, error]
  ).catch(() => {});

  return { status, error };
}

/** wa.me link with the same text, used as a manual fallback in admin. */
export function waLink(to: string, text: string) {
  return `https://wa.me/${normalizePhone(to)}?text=${encodeURIComponent(text)}`;
}
