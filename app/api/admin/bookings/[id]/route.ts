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

  try {
    const body = await request.json();
    const { action, status, cancelled_reason, refund_amount, payment_add } = body;

    if (action === 'delete') {
      (booking as any).is_deleted = 1;
      (booking as any).deleted_at = new Date().toISOString();
      (booking as any).deleted_by = session.email;
    } else if (action === 'cancel') {
      (booking as any).status = 'cancelled';
      (booking as any).cancelled_reason = cancelled_reason || 'Cancelled by guest request';
      (booking as any).refund_amount = Number(refund_amount || 0);
    } else if (action === 'update_status' && status) {
      (booking as any).status = status;
    } else if (action === 'add_payment' && payment_add) {
      const added = Number(payment_add);
      (booking as any).advance_paid = Number(booking.advance_paid || 0) + added;
      (booking as any).balance = Math.max(0, Number(booking.total) - (booking as any).advance_paid);
      if ((booking as any).balance === 0) {
        (booking as any).payment_status = 'fully_paid';
      }
    }

    // Audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: session.id,
      user_email: session.email,
      action: action ? action.toUpperCase() : 'UPDATE_BOOKING',
      entity: 'bookings',
      entity_id: String(booking.id),
      details: body,
      created_at: new Date().toISOString()
    });

    saveStore();
    return NextResponse.json({ success: true, data: booking });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session || session.role !== 'super_admin') {
    return NextResponse.json({ success: false, error: 'Super Admin privileges required for permanent deletion' }, { status: 403 });
  }

  const bookingId = Number(params.id);
  const idx = mockStore.bookings.findIndex((b: any) => b.id === bookingId);
  if (idx === -1) {
    return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
  }

  mockStore.bookings.splice(idx, 1);
  saveStore();
  return NextResponse.json({ success: true, message: 'Permanently deleted' });
}
