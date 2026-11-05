import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') || '';
  const branch = searchParams.get('branch');
  const theatre = searchParams.get('theatre');
  const status = searchParams.get('status');
  const isDeleted = searchParams.get('deleted') === 'true';
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 25);

  let filtered = [...mockStore.bookings];

  // Restrict to branch if manager
  if (session.role === 'branch_manager' && session.branch_id) {
    filtered = filtered.filter(b => b.branch_id === session.branch_id);
  } else if (branch && branch !== 'all') {
    filtered = filtered.filter(b => b.branch_id === Number(branch));
  }

  // Soft delete tab filter
  if (isDeleted) {
    filtered = filtered.filter(b => b.is_deleted === 1 || b.status === 'cancelled');
  } else {
    filtered = filtered.filter(b => b.is_deleted === 0);
  }

  if (theatre && theatre !== 'all') {
    filtered = filtered.filter(b => b.theatre_id === Number(theatre));
  }

  if (status && status !== 'all') {
    filtered = filtered.filter(b => b.status === status);
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(b => 
      b.booking_ref.toLowerCase().includes(s) ||
      b.customer_name.toLowerCase().includes(s) ||
      b.customer_phone.includes(s) ||
      (b.customer_email && b.customer_email.toLowerCase().includes(s))
    );
  }

  // Populate branch, theatre, slot, occasion names
  const enriched = filtered.map(b => {
    const br = mockStore.branches.find(x => x.id === b.branch_id);
    const th = mockStore.theatres.find(x => x.id === b.theatre_id);
    const sl = mockStore.timeSlots.find(x => x.id === b.slot_id);
    const oc = mockStore.occasions.find(x => x.id === b.occasion_id);
    return {
      ...b,
      branch_name: br?.name || 'Branch',
      theatre_name: th?.name || 'Screen',
      theatre_emoji: th?.emoji || '🎬',
      slot_time: sl ? `${sl.start_time} – ${sl.end_time}` : 'Custom Slot',
      occasion_name: oc?.name || 'Occasion',
    };
  });

  const total = enriched.length;
  const startIdx = (page - 1) * limit;
  const paginated = enriched.slice(startIdx, startIdx + limit);

  return NextResponse.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}

// Manual Booking by Admin
export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      branch_id,
      theatre_id,
      slot_id,
      booking_date,
      customer_name,
      customer_phone,
      customer_email = '',
      screen_name = '',
      occasion_id = 1,
      guests = 2,
      total = 899,
      advance_paid = 500,
      notes = '',
      source = 'phone'
    } = body;

    const dateStr = booking_date.replace(/-/g, '');
    const bookingRef = `MB-MAN-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    const br = mockStore.branches.find(x => x.id === Number(branch_id));
    const th = mockStore.theatres.find(x => x.id === Number(theatre_id));
    const sl = mockStore.timeSlots.find(x => x.id === Number(slot_id));
    const oc = mockStore.occasions.find(x => x.id === Number(occasion_id));

    const newBooking = {
      id: mockStore.bookings.length + 1,
      booking_ref: bookingRef,
      branch_id: Number(branch_id),
      theatre_id: Number(theatre_id),
      slot_id: Number(slot_id),
      occasion_id: Number(occasion_id),
      booking_date,
      customer_name,
      customer_phone,
      customer_email,
      screen_name: screen_name || `Celebration for ${customer_name}`,
      guests: Number(guests),
      subtotal: Number(total),
      addons_total: 0,
      discount: 0,
      total: Number(total),
      advance_paid: Number(advance_paid),
      balance: Math.max(0, Number(total) - Number(advance_paid)),
      status: 'confirmed' as const,
      payment_status: Number(advance_paid) >= Number(total) ? 'fully_paid' : 'advance_paid',
      source: source as any,
      notes,
      is_deleted: 0,
      created_at: new Date().toISOString()
    };

    mockStore.bookings.unshift(newBooking as any);
    saveStore();

    // Audit log
    mockStore.auditLogs.unshift({
      id: Date.now(),
      user_id: session.id,
      user_email: session.email,
      action: 'CREATE_MANUAL_PHONE_BOOKING',
      entity: 'bookings',
      entity_id: String(newBooking.id),
      details: { ref: bookingRef, customer: customer_name, source },
      created_at: new Date().toISOString()
    });

    const enriched = {
      ...newBooking,
      branch_name: br?.name || 'Branch',
      theatre_name: th?.name || 'Screen',
      theatre_emoji: th?.emoji || '🎬',
      slot_time: sl ? `${sl.start_time} - ${sl.end_time}` : 'Showtime',
      occasion_name: oc?.name || 'Celebration',
      map_url: br?.map_url || 'https://maps.google.com/?q=Movie+Bash+Bengaluru'
    };

    return NextResponse.json({ success: true, data: enriched });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
