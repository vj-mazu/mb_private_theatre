import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const rows = [
    ['Booking Ref', 'Customer Name', 'Phone', 'Date', 'Branch', 'Theatre', 'Guests', 'Total', 'Paid', 'Balance', 'Status', 'Created At']
  ];

  mockStore.bookings.forEach((b: any) => {
    const br = mockStore.branches.find((x: any) => x.id === b.branch_id);
    const th = mockStore.theatres.find((x: any) => x.id === b.theatre_id);
    rows.push([
      b.booking_ref,
      `"${b.customer_name}"`,
      b.customer_phone,
      b.booking_date,
      `"${br?.name || 'Branch'}"`,
      `"${th?.name || 'Screen'}"`,
      String(b.guests),
      String(b.total),
      String(b.advance_paid),
      String(b.balance),
      b.status,
      b.created_at
    ]);
  });

  const csv = rows.map(r => r.join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="movie_bash_bookings_${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}
