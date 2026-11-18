import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore, getDb } from '@/lib/db';

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

  // Branch isolation for staff members
  if (session.role === 'staff' && session.branch_id && booking.branch_id !== session.branch_id) {
    return NextResponse.json({ success: false, error: 'Access denied: You can only manage bookings for your assigned branch.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { action, status, cancelled_reason, refund_amount, payment_add } = body;

    // 1. Update SQLite atomically
    try {
      const db = getDb();
      if (action === 'delete') {
        db.prepare("UPDATE bookings SET is_deleted = 1, deleted_at = datetime('now', 'localtime'), deleted_by = ? WHERE id = ?").run(session.email, bookingId);
      } else if (action === 'cancel') {
        db.prepare("UPDATE bookings SET status = 'cancelled', cancelled_reason = ?, refund_amount = ? WHERE id = ?").run(cancelled_reason || 'Cancelled by guest request', Number(refund_amount || 0), bookingId);
      } else if (action === 'update_status' && status) {
        db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, bookingId);
      } else if (action === 'reschedule') {
        const { booking_date, slot_id, theatre_id, branch_id } = body;
        db.prepare("UPDATE bookings SET booking_date = ?, slot_id = ?, theatre_id = ?, branch_id = ?, status = 'confirmed' WHERE id = ?").run(booking_date, Number(slot_id), Number(theatre_id), Number(branch_id), bookingId);
      } else if (action === 'add_payment' && payment_add) {
        const added = Number(payment_add);
        db.prepare("UPDATE bookings SET advance_paid = advance_paid + ?, balance = MAX(0, total - (advance_paid + ?)), payment_status = CASE WHEN total <= (advance_paid + ?) THEN 'fully_paid' ELSE 'advance_paid' END WHERE id = ?").run(added, added, added, bookingId);
      }
    } catch (dbErr) {
      console.warn('SQLite update error in [id]:', dbErr);
    }

    // 2. Also keep mockStore in sync
    if (action === 'delete') {
      if (session.role === 'staff') {
        return NextResponse.json({ success: false, error: 'Staff members are not authorized to delete bookings. Use Cancel Booking instead.' }, { status: 403 });
      }
      (booking as any).is_deleted = 1;
      (booking as any).deleted_at = new Date().toISOString();
      (booking as any).deleted_by = session.email;
    } else if (action === 'cancel') {
      (booking as any).status = 'cancelled';
      (booking as any).cancelled_reason = cancelled_reason || 'Cancelled by guest request';
      (booking as any).refund_amount = Number(refund_amount || 0);
    } else if (action === 'update_status' && status) {
      (booking as any).status = status;
    } else if (action === 'reschedule') {
      const { booking_date, slot_id, slot_time, theatre_id, screen_name, branch_id, branch_name } = body;
      if (booking_date) (booking as any).booking_date = booking_date;
      if (slot_id) (booking as any).slot_id = Number(slot_id);
      if (slot_time) (booking as any).slot_time = slot_time;
      if (theatre_id) (booking as any).theatre_id = Number(theatre_id);
      if (screen_name) (booking as any).screen_name = screen_name;
      if (branch_id) (booking as any).branch_id = Number(branch_id);
      if (branch_name) (booking as any).branch_name = branch_name;
      (booking as any).status = 'confirmed';
      (booking as any).rescheduled_at = new Date().toISOString();
      (booking as any).rescheduled_by = session.email;
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

  try {
    const db = getDb();
    db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  } catch (dbErr) {
    console.warn('SQLite delete error:', dbErr);
  }

  mockStore.bookings.splice(idx, 1);
  saveStore();
  return NextResponse.json({ success: true, message: 'Permanently deleted' });
}
