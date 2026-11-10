import { NextRequest, NextResponse } from 'next/server';
import { query, checkMySQL, mockStore } from '@/lib/db';
import { bookingRateLimiter } from '@/lib/rate-limiter';

export async function GET(
  request: NextRequest,
  { params }: { params: { bookingRef: string } }
) {
  const rateLimitResponse = await bookingRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { bookingRef } = params;
  if (!bookingRef) {
    return NextResponse.json({ success: false, error: 'Booking reference is required' }, { status: 400 });
  }

  try {
    const isMySQL = await checkMySQL();
    let booking: any = null;
    let addons: any[] = [];

    if (isMySQL) {
      const rows = await query(
        `SELECT 
          b.*,
          br.name as branch_name, br.address as branch_address, br.phone as branch_phone,
          t.name as theatre_name, t.emoji as theatre_emoji, t.capacity, t.base_price,
          o.name as occasion_name,
          s.start_time, s.end_time
        FROM bookings b
        LEFT JOIN branches br ON b.branch_id = br.id
        LEFT JOIN theatres t ON b.theatre_id = t.id
        LEFT JOIN occasions o ON b.occasion_id = o.id
        LEFT JOIN time_slots s ON b.slot_id = s.id
        WHERE b.booking_ref = ? AND b.is_deleted = 0 LIMIT 1`,
        [bookingRef]
      );
      if (rows && rows.length > 0) {
        booking = rows[0];
        const addonRows = await query(
          `SELECT addon_name as name, price, quantity, subtotal FROM booking_addons WHERE booking_id = ?`,
          [booking.id]
        );
        addons = addonRows || [];
      }
    }

    if (!booking) {
      // Find in mockStore
      booking = mockStore.bookings.find(b => b.booking_ref === bookingRef && b.is_deleted === 0);
      if (booking) {
        addons = booking.addons || [];
      }
    }

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Resolve details from mockStore if not present
    const branch = mockStore.branches.find(b => b.id === Number(booking.branch_id));
    const theatre = mockStore.theatres.find(t => t.id === Number(booking.theatre_id));
    const occasion = mockStore.occasions.find(o => o.id === Number(booking.occasion_id));
    const slot = mockStore.timeSlots.find(s => s.id === Number(booking.slot_id));

    const branchName = booking.branch_name || branch?.name || 'Movie Bash – Electronic City';
    const branchAddress = booking.branch_address || branch?.address || 'Beside Sri Vishnu Grand, Electronic City Post, Bengaluru 560100';
    const theatreName = booking.theatre_name || theatre?.name || 'Couple Theater';
    const theatreEmoji = booking.theatre_emoji || theatre?.emoji || '🎬';
    const occasionName = booking.occasion_name || occasion?.name || 'Celebration';
    const slotLabel = (booking.start_time && booking.end_time)
      ? `${booking.start_time} – ${booking.end_time}`
      : (slot ? `${slot.start_time} – ${slot.end_time}` : 'Scheduled Slot');
    const totalAmount = booking.total || booking.total_price || 899;
    const advancePaid = booking.advance_paid || 0;
    const balanceAmount = booking.balance || Math.max(0, totalAmount - advancePaid);
    const guestsCount = booking.guests || booking.capacity || 2;
    const bookingDate = booking.booking_date;

    const addonsText = addons.length > 0
      ? addons.map((a: any) => `${a.name || a.addon_name} (x${a.quantity || 1})`).join(', ')
      : 'None';

    // Construct Manager WhatsApp Alert
    const managerMessage = 
      `🎬 *NEW MOVIE BASH BOOKING RESERVED* 🎬\n\n` +
      `*Booking Ref:* ${booking.booking_ref}\n` +
      `*Customer:* ${booking.customer_name}\n` +
      `*Phone:* ${booking.customer_phone}\n` +
      (booking.customer_email ? `*Email:* ${booking.customer_email}\n` : '') +
      `*Branch:* ${branchName}\n` +
      `*Theatre:* ${theatreName} (${theatreEmoji})\n` +
      `*Date:* ${bookingDate}\n` +
      `*Slot:* ${slotLabel}\n` +
      `*Guests:* ${guestsCount}\n` +
      `*Occasion:* ${occasionName}\n` +
      (booking.screen_name ? `*Screen Custom Title:* ${booking.screen_name}\n` : '') +
      `*Add-ons:* ${addonsText}\n` +
      `*Total Price:* ₹${totalAmount}\n` +
      `*Advance Paid:* ₹${advancePaid}\n` +
      `*Balance Due at Theatre:* ₹${balanceAmount}\n\n` +
      `Hi Movie Bash team, please confirm my booking setup!`;

    const managerUrl = `https://wa.me/919902923656?text=${encodeURIComponent(managerMessage)}`;

    // Customer WhatsApp summary
    const customerMessage = 
      `🎬 *Movie Bash Booking Confirmation* 🎬\n\n` +
      `Booking Ref: ${booking.booking_ref}\n` +
      `Screen: ${theatreName} (${branchName})\n` +
      `Date & Slot: ${bookingDate} @ ${slotLabel}\n` +
      `Total: ₹${totalAmount}\n` +
      `Balance Due at Venue: ₹${balanceAmount}\n\n` +
      `Venue Address: ${branchAddress}\n` +
      `Looking forward to hosting your celebration! 🎉`;

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        booking_ref: booking.booking_ref,
        customer_name: booking.customer_name,
        customer_phone: booking.customer_phone,
        customer_email: booking.customer_email,
        screen_name: booking.screen_name,
        branch_id: booking.branch_id,
        theatre_id: booking.theatre_id,
        occasion_id: booking.occasion_id,
        booking_date: bookingDate,
        slot_id: booking.slot_id,
        total: totalAmount,
        advance_paid: advancePaid,
        balance: balanceAmount,
        status: booking.status,
        payment_status: booking.payment_status,
        guests: guestsCount,
        created_at: booking.created_at,
        branch: {
          name: branchName,
          address: branchAddress,
          phone: '+91 99029 23656'
        },
        theatre: {
          name: theatreName,
          emoji: theatreEmoji,
          capacity: guestsCount
        },
        occasion: {
          name: occasionName
        },
        slot: {
          label: slotLabel
        },
        addons: addons,
        whatsapp_confirmation: {
          url: managerUrl,
          message: customerMessage,
          manager_phone: '+91 99029 23656'
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch booking details' },
      { status: 500 }
    );
  }
}
