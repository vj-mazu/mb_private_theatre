import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore, saveStore } from '@/lib/db';

// Atomic slot lock map for concurrent double-booking prevention
const activeSlotLocks = new Map<string, number>();
const LOCK_TIMEOUT_MS = 10000; // 10s auto-expire safety

export async function POST(request: NextRequest) {
  let lockKey = '';
  try {
    const body = await request.json();
    const {
      branch_id,
      theatre_id,
      slot_id,
      booking_date,
      customer_name,
      customer_phone,
      customer_email,
      screen_name,
      guests,
      occasion_id,
      addons = [],
      coupon_code,
      discount = 0,
      payment_mode = 'advance_later',
      notes = ''
    } = body;

    // Validation
    if (!branch_id || !theatre_id || !slot_id || !booking_date || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Please fill all mandatory fields (Branch, Theatre, Slot, Date, Name, Phone).' },
        { status: 400 }
      );
    }

    // Phone validation (10 digit Indian number)
    const cleanPhone = String(customer_phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    // 1. Atomic Mutex Lock Check (Prevents 2 users booking same slot simultaneously)
    lockKey = `${Number(theatre_id)}_${booking_date}_${Number(slot_id)}`;
    const lockTime = activeSlotLocks.get(lockKey);
    if (lockTime && (Date.now() - lockTime) < LOCK_TIMEOUT_MS) {
      return NextResponse.json(
        { success: false, error: 'This time slot is currently being locked and reserved by another guest. Please choose a different slot.' },
        { status: 409 }
      );
    }
    // Acquire slot mutex lock
    activeSlotLocks.set(lockKey, Date.now());

    // 2. Persistent Double-booking check
    const existing = mockStore.bookings.find(
      b => b.theatre_id === Number(theatre_id) &&
           b.booking_date === booking_date &&
           b.slot_id === Number(slot_id) &&
           b.is_deleted === 0 &&
           b.status !== 'cancelled'
    );

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This time slot was just booked by another guest. Please choose a different slot.' },
        { status: 409 }
      );
    }

    // 2. Fetch theatre to compute accurate base and extra person price
    const theatre = mockStore.theatres.find(t => t.id === Number(theatre_id));
    const basePrice = theatre ? Number(theatre.base_price) : 899;
    const extraPersonPrice = theatre ? Number(theatre.extra_person_price) : 150;
    const capacity = theatre ? theatre.capacity : 2;

    const extraGuests = Math.max(0, Number(guests) - capacity);
    const subtotal = basePrice + (extraGuests * extraPersonPrice);

    // Compute addons
    let addonsTotal = 0;
    const computedAddons = (addons as Array<{ addon_id: number; quantity: number }>).map(item => {
      const match = mockStore.addons.find(a => a.id === item.addon_id);
      const price = match ? Number(match.price) : 0;
      const itemSubtotal = price * (item.quantity || 1);
      addonsTotal += itemSubtotal;
      return {
        id: Date.now() + Math.random(),
        addon_id: item.addon_id,
        addon_name: match ? match.name : 'Custom Addon',
        price,
        quantity: item.quantity || 1,
        subtotal: itemSubtotal
      };
    });

    const total = Math.max(0, subtotal + addonsTotal - Number(discount));
    const advancePaid = payment_mode === 'razorpay' ? 500 : 0;
    const balance = total - advancePaid;

    // Generate unique booking reference: MB-YYYYMMDD-XXXX
    const dateStr = booking_date.replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `MB-${dateStr}-${randomSuffix}`;

    // Create booking record
    const newBooking: any = {
      id: mockStore.bookings.length + 1,
      booking_ref: bookingRef,
      branch_id: Number(branch_id),
      theatre_id: Number(theatre_id),
      slot_id: Number(slot_id),
      booking_date,
      customer_name,
      customer_phone: cleanPhone,
      customer_email: customer_email || '',
      screen_name: screen_name || '',
      guests: Number(guests) || 2,
      occasion_id: occasion_id ? Number(occasion_id) : 1,
      subtotal,
      addons_total: addonsTotal,
      discount: Number(discount),
      total,
      advance_paid: advancePaid,
      balance,
      status: payment_mode === 'razorpay' ? 'confirmed' : 'confirmed',
      payment_status: payment_mode === 'razorpay' ? 'advance_paid' : 'unpaid',
      source: 'web',
      notes: notes || '',
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString(),
      addons: computedAddons
    };

    // Save to mockStore & persist to disk
    mockStore.bookings.unshift(newBooking);

    // Update or add customer
    const existingCust = mockStore.customers.find(c => c.phone === cleanPhone);
    if (existingCust) {
      existingCust.total_bookings += 1;
      existingCust.lifetime_spend += total;
    } else {
      mockStore.customers.push({
        id: mockStore.customers.length + 1,
        name: customer_name,
        phone: cleanPhone,
        email: customer_email || '',
        total_bookings: 1,
        lifetime_spend: total,
        is_blocked: 0,
        created_at: new Date().toISOString().split('T')[0]
      });
    }

    saveStore();

    return NextResponse.json({
      success: true,
      data: {
        booking_ref: bookingRef,
        total,
        advance_paid: advancePaid,
        balance,
        status: newBooking.status,
        booking: newBooking
      }
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    if (lockKey) {
      activeSlotLocks.delete(lockKey);
    }
  }
}
