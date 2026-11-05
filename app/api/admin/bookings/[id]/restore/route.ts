import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const bookingId = Number(params.id);
  const booking = mockStore.bookings.find((b: any) => b.id === bookingId);

  if (!booking) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }

  booking.is_deleted = 0;
  if ((booking as any).status === 'cancelled') {
    (booking as any).status = 'confirmed';
  }

  // Audit log
  mockStore.auditLogs.unshift({
    id: Date.now(),
    user_id: session.id,
    user_email: session.email,
    action: 'RESTORE_BOOKING',
    entity: 'bookings',
    entity_id: String(booking.id),
    details: { ref: booking.booking_ref },
    created_at: new Date().toISOString()
  });

  saveStore();
  return NextResponse.json({ success: true, data: booking });
}
