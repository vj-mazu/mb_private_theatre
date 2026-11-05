import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/auth';
import { mockStore } from '@/lib/db';

export async function GET() {
  const session = await getCustomerSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const cleanPhone = session.phone;
  const userBookings = mockStore.bookings.filter(
    b => b.customer_phone === cleanPhone && b.is_deleted === 0
  );

  return NextResponse.json({
    success: true,
    data: userBookings,
    customer: session
  });
}
