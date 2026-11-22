import { notFound } from 'next/navigation';
import { getTicket } from '@/lib/server/ticket';
import { getSettings } from '@/lib/server/catalog';
import { TicketView } from '@/components/booking/TicketView';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your booking', robots: { index: false } };

export default async function TicketPage({ params }: { params: { ref: string } }) {
  const [ticket, settings] = await Promise.all([getTicket(params.ref), getSettings()]);
  if (!ticket) notFound();
  return <TicketView initial={ticket} payment={settings.payment} whatsapp={settings.business.whatsapp} notes={settings.visit.notes} />;
}
