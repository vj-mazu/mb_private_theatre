import { getCatalog } from '@/lib/server/catalog';
import { BookingFlow } from '@/components/booking/BookingFlow';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Book a private theatre', description: 'Choose your slot, package and cake, and book a Movie Bash private theatre in minutes.', alternates: { canonical: '/book' } };

export default async function BookPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const { settings, coupons, ...catalog } = await getCatalog();
  return (
    <BookingFlow
      catalog={catalog}
      coupons={coupons}
      cutoffMinutes={settings.booking.slot_cutoff_minutes}
      advance={settings.payment.advance_amount}
      initial={{ branch: searchParams.branch, theatre: Number(searchParams.theatre) || undefined, occasion: searchParams.occasion }}
    />
  );
}
