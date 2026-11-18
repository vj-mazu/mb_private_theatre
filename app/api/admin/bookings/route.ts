import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore, generateBookingRef, getDb } from '@/lib/db';
import { sendWhatsAppMessage } from '@/lib/twilio';
import { formatBookingSlotTime, getExtraHourRate } from '@/lib/slot-engine';

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
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const isDeleted = searchParams.get('deleted') === 'true';
  const page = Number(searchParams.get('page') || 1);
  const limit = Number(searchParams.get('limit') || 25);

  let allBookings: any[] = [];
  try {
    const db = getDb();
    const rows = db.prepare(`
      SELECT b.*,
             br.name as branch_name, br.map_url as map_url,
             th.name as theatre_name, th.emoji as theatre_emoji,
             ts.start_time as slot_start, ts.end_time as slot_end,
             oc.name as occasion_name
      FROM bookings b
      LEFT JOIN branches br ON b.branch_id = br.id
      LEFT JOIN theatres th ON b.theatre_id = th.id
      LEFT JOIN time_slots ts ON b.slot_id = ts.id
      LEFT JOIN occasions oc ON b.occasion_id = oc.id
      ORDER BY b.booking_date DESC, b.id DESC
    `).all();
    allBookings = rows && rows.length > 0 ? rows : [...mockStore.bookings];
  } catch (e) {
    allBookings = [...mockStore.bookings];
  }

  let filtered = allBookings;

  // Restrict to branch if staff or branch manager
  if ((session.role === 'staff' || session.role === 'branch_manager') && session.branch_id) {
    filtered = filtered.filter(b => b.branch_id === session.branch_id);
  } else if (branch && branch !== 'all') {
    filtered = filtered.filter(b => b.branch_id === Number(branch));
  }

  // Soft delete tab filter (staff are not allowed to view deleted archive)
  if (isDeleted) {
    if (session.role === 'staff') {
      return NextResponse.json({ success: false, error: 'Staff access to deleted archive is restricted' }, { status: 403 });
    }
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

  if (date && date !== 'all') {
    filtered = filtered.filter(b => b.booking_date === date);
  } else if (startDate && endDate) {
    filtered = filtered.filter(b => b.booking_date >= startDate && b.booking_date <= endDate);
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
    const extraHours = Math.max(0, Number(b.extra_hours || 0));

    // Accurately compute extended slot time if extra hours were booked
    const computedSlotTime = sl 
      ? formatBookingSlotTime(sl.start_time, sl.end_time, extraHours)
      : (b.slot_time || 'Custom Slot');

    const extraRate = th ? getExtraHourRate(th.id) : (b.theatre_id === 1 || b.theatre_id === 4 ? 400 : 750);
    const extraHoursCost = extraHours * extraRate;

    return {
      ...b,
      extra_hours: extraHours,
      extra_hours_cost: extraHoursCost,
      total_duration_hours: 2 + extraHours,
      branch_name: br?.name || 'Branch',
      theatre_name: th?.name || 'Screen',
      theatre_emoji: th?.emoji || '🎬',
      slot_time: computedSlotTime,
      base_slot_time: sl ? `${sl.start_time} – ${sl.end_time}` : 'Showtime',
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
      slot_time: requestedSlotTime,
      booking_date,
      customer_name,
      customer_phone,
      customer_email = '',
      screen_name = '',
      occasion_id = 1,
      guests = 2,
      extra_hours = 0,
      total = 899,
      advance_paid = 500,
      notes = '',
      source = 'phone'
    } = body;

    // If staff, force booking to their own assigned branch
    const effectiveBranchId = (session.role === 'staff' && session.branch_id) 
      ? session.branch_id 
      : Number(branch_id);

    const validExtraHours = Math.min(2, Math.max(0, Number(extra_hours) || 0));
    const bookingRef = await generateBookingRef(effectiveBranchId, booking_date);

    const br = mockStore.branches.find(x => x.id === Number(effectiveBranchId));
    const th = mockStore.theatres.find(x => x.id === Number(theatre_id));
    const sl = mockStore.timeSlots.find(x => x.id === Number(slot_id));
    const oc = mockStore.occasions.find(x => x.id === Number(occasion_id));

    const computedSlotTime = sl 
      ? formatBookingSlotTime(sl.start_time, sl.end_time, validExtraHours)
      : (requestedSlotTime || 'Showtime');

    const extraRate = th ? getExtraHourRate(th.id) : (Number(theatre_id) === 1 || Number(theatre_id) === 4 ? 400 : 750);
    const extraHoursCost = validExtraHours * extraRate;

    const newBooking = {
      id: mockStore.bookings.length + 1,
      booking_ref: bookingRef,
      branch_id: Number(effectiveBranchId),
      theatre_id: Number(theatre_id),
      slot_id: Number(slot_id),
      slot_time: computedSlotTime,
      extra_hours: validExtraHours,
      extra_hours_cost: extraHoursCost,
      total_duration_hours: 2 + validExtraHours,
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

    try {
      const db = getDb();
      const insertStmt = db.prepare(`
        INSERT INTO bookings (
          booking_ref, branch_id, theatre_id, slot_id, booking_date,
          customer_name, customer_phone, customer_email, screen_name,
          guests, occasion_id, extra_hours, subtotal, addons_total,
          discount, total, advance_paid, balance, status, payment_status,
          source, notes, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `);
      const result = insertStmt.run(
        bookingRef, Number(effectiveBranchId), Number(theatre_id), Number(slot_id), booking_date,
        customer_name, String(customer_phone).replace(/\D/g, ''), customer_email || '', screen_name || '',
        Number(guests), Number(occasion_id), validExtraHours, Number(total), 0,
        0, Number(total), Number(advance_paid), Math.max(0, Number(total) - Number(advance_paid)),
        'confirmed', Number(advance_paid) >= Number(total) ? 'fully_paid' : 'advance_paid',
        source, notes || ''
      );
      if (result.lastInsertRowid) {
        newBooking.id = Number(result.lastInsertRowid);
      }
    } catch (dbErr) {
      console.warn('SQLite insert fallback for manual booking:', dbErr);
    }

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
      details: { ref: bookingRef, customer: customer_name, extra_hours: validExtraHours, source },
      created_at: new Date().toISOString()
    });

    const enriched = {
      ...newBooking,
      branch_name: br?.name || 'Branch',
      theatre_name: th?.name || 'Screen',
      theatre_emoji: th?.emoji || '🎬',
      slot_time: computedSlotTime,
      occasion_name: oc?.name || 'Celebration',
      map_url: br?.map_url || 'https://maps.google.com/?q=Movie+Bash+Bengaluru'
    };

    // Auto-dispatch WhatsApp confirmation directly to the customer's phone for phone bookings
    const cleanCustomerPhone = String(customer_phone).replace(/\D/g, '');
    const phoneBookingMessage = 
      `🎬 *Movie Bash Private Theatre — Booking Confirmed* 🍿\n\n` +
      `Dear *${customer_name}*,\n` +
      `Your phone reservation has been confirmed by our staff!\n\n` +
      `🎟️ *Booking Ref:* ${bookingRef}\n` +
      `📍 *Venue:* ${enriched.branch_name}\n` +
      `🎭 *Screen:* ${enriched.theatre_name} (${enriched.theatre_emoji})\n` +
      `📅 *Date:* ${booking_date}\n` +
      `⏰ *Showtime:* ${enriched.slot_time}\n` +
      (validExtraHours > 0 ? `⏳ *Extended Duration:* +${validExtraHours} Hour Extra Showtime (${2 + validExtraHours} Hours Total)\n` : '') +
      `👥 *Guests:* ${guests}\n` +
      `💰 *Total Amount:* ₹${total}\n` +
      `✅ *Advance Recorded:* ₹${advance_paid}\n` +
      `💵 *Balance Due at Venue:* ₹${enriched.balance}\n` +
      `🗺️ *Map Directions:* ${enriched.map_url}\n\n` +
      `Please arrive 10 minutes prior to your screening. For queries, call us at *+91 99029 23656*. Have a wonderful celebration! 🎉`;

    const cleanCustomer10 = cleanCustomerPhone.slice(-10);
    const whatsappUrl = `https://wa.me/91${cleanCustomer10}?text=${encodeURIComponent(phoneBookingMessage)}`;

    let twilioResult: any = null;
    try {
      twilioResult = await sendWhatsAppMessage(cleanCustomerPhone, phoneBookingMessage);
    } catch (err) {
      console.warn('[Twilio WhatsApp Manual Booking Dispatch Error]:', err);
    }

    return NextResponse.json({ 
      success: true, 
      data: enriched,
      whatsapp_url: whatsappUrl,
      whatsapp_message: phoneBookingMessage,
      twilio_result: twilioResult
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
