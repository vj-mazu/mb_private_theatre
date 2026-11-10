import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const branch = searchParams.get('branch');

  let list = mockStore.bookings.filter((b: any) => b.is_deleted === 0);
  if (session.role === 'branch_manager' && session.branch_id) {
    list = list.filter((b: any) => b.branch_id === session.branch_id);
  } else if (branch && branch !== 'all') {
    list = list.filter((b: any) => b.branch_id === Number(branch));
  }
  if (date && date !== 'all') {
    list = list.filter((b: any) => b.booking_date === date);
  }

  const rows = [
    ['Booking Ref', 'Customer Name', 'Phone', 'Date', 'Branch', 'Theatre', 'Guests', 'Total', 'Paid', 'Balance', 'Status', 'Created At']
  ];

  list.forEach((b: any) => {
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
      'Content-Disposition': `attachment; filename="movie_bash_bookings_${date || new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}
