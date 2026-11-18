import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore, saveStore, acquireBookingLock, releaseBookingLock, beginTransaction, generateBookingRef, incrementCouponUsage } from '@/lib/db';
import { bookingRateLimiter } from '@/lib/rate-limiter';
import { sendWhatsAppMessage, sendSMSMessage } from '@/lib/twilio';
import { formatBookingSlotTime } from '@/lib/slot-engine';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await bookingRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  let lockAcquired = false;
  let txn: any = null;
  
  // Extract values for use in finally block
  let theatreId: number = 0;
  let bookingDate: string = '';
  let slotId: number = 0;
  
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
      package_type = 'standard',
      cake_flavor = '',
      extra_hours = 0,
      addons = [],
      coupon_code,
      payment_mode = 'upi_advance',
      notes = '',
      utr_number = '',
      idempotency_key
    } = body;

    // Store for finally block
    theatreId = Number(theatre_id);
    bookingDate = booking_date;
    slotId = Number(slot_id);

    // Validation
    if (!branch_id || !theatre_id || !slot_id || !booking_date || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Please fill all mandatory fields (Branch, Theatre, Slot, Date, Name, Phone).' },
        { status: 400 }
      );
    }

    // Strict Indian mobile validation (10 digits starting with 6, 7, 8, or 9)
    const cleanPhone = String(customer_phone).replace(/\D/g, '');
    if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.' },
        { status: 400 }
      );
    }

    // Idempotency check - if key provided, check if booking already exists
    if (idempotency_key) {
      const existingByIdempotency = mockStore.bookings.find(
        (b: any) => b.idempotency_key === idempotency_key && b.is_deleted === 0
      );
      if (existingByIdempotency) {
        return NextResponse.json({
          success: true,
          data: {
            booking_ref: existingByIdempotency.booking_ref,
            total: existingByIdempotency.total,
            advance_paid: existingByIdempotency.advance_paid,
            balance: existingByIdempotency.balance,
            status: existingByIdempotency.status,
            booking: existingByIdempotency,
            idempotent: true
          }
        });
      }
    }

    // 1. Acquire distributed lock (works across multiple processes/containers)
    lockAcquired = await acquireBookingLock(Number(theatre_id), booking_date, Number(slot_id), 10);
    if (!lockAcquired) {
      return NextResponse.json(
        { success: false, error: 'This time slot is currently being booked by another guest. Please try again in a moment.' },
        { status: 409 }
      );
    }

    // 2. Double-booking check (database-level constraint will also enforce this)
    const existing = mockStore.bookings.find(
      (b: any) => b.theatre_id === Number(theatre_id) &&
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

    // 3. Fetch theatre and calculate package pricing dynamically from CMS/Database
    const isEcity = Number(branch_id) === 1;
    const theatre = mockStore.theatres.find(t => t.id === Number(theatre_id));
    const isCouple = Number(theatre_id) === 1 || Number(theatre_id) === 4;

    // Read dynamic package pricing configured in CMS (with fallback defaults)
    const stdPrice = Number((theatre as any)?.standard_price || (theatre as any)?.standardPrice || (isCouple ? 1499 : 2200));
    const custPrice = Number((theatre as any)?.custom_price || theatre?.base_price || (isCouple ? 899 : 1699));
    const premPrice = Number((theatre as any)?.premium_price || (isCouple ? 2800 : 3500));

    let basePackagePrice = stdPrice;
    if (package_type === 'premium') basePackagePrice = premPrice;
    else if (package_type === 'custom') basePackagePrice = custPrice;

    const baseCapacity = typeof theatre?.capacity === 'number' ? theatre.capacity : (isCouple ? 2 : 6);
    const extraPersonRate = Number(theatre?.extra_person_price || (isCouple ? 99 : 149));
    const extraHourRate = Number((theatre as any)?.extra_hour_rate || (isCouple ? 400 : 750));

    const totalGuests = Number(guests) || baseCapacity;
    const extraGuestsCount = Math.max(0, totalGuests - baseCapacity);
    const extraGuestsTotal = extraGuestsCount * extraPersonRate;
    const validExtraHours = Math.min(2, Math.max(0, Number(extra_hours) || 0));
    const extraHoursTotal = validExtraHours * extraHourRate;

    const subtotal = basePackagePrice + extraGuestsTotal + extraHoursTotal;

    // 4. Compute addons
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

    // 5. Handle coupon validation and discount
    // The discount is always derived from a server-validated coupon. A client-supplied
    // discount value is never trusted, otherwise anyone could book a slot for ₹0.
    let finalDiscount = 0;
    let couponId: number | null = null;
    
    if (coupon_code) {
      const cleanCode = String(coupon_code).trim().toUpperCase();
      const coupon = mockStore.coupons.find(c => c.code === cleanCode && c.is_active === 1);
      
      if (coupon) {
        if (coupon.min_booking_amount && (subtotal + addonsTotal) < coupon.min_booking_amount) {
          return NextResponse.json(
            { success: false, error: `Minimum booking amount of ₹${coupon.min_booking_amount} required to use this code` },
            { status: 400 }
          );
        }
        
        if (coupon.used_count >= coupon.usage_limit) {
          return NextResponse.json(
            { success: false, error: 'This coupon has reached its usage limit' },
            { status: 400 }
          );
        }
        
        if (coupon.discount_type === 'flat') {
          finalDiscount = coupon.discount_value;
        } else {
          finalDiscount = Math.round(((subtotal + addonsTotal) * coupon.discount_value) / 100);
        }
        couponId = coupon.id;
      }
    }

    const total = Math.max(0, subtotal + addonsTotal - finalDiscount);
    const advancePaid = 500; // Standard ₹500 advance deposit required to confirm slot
    const balance = Math.max(0, total - advancePaid);
    const cleanUtr = String(utr_number || '').trim();
    const finalNotes = cleanUtr 
      ? (notes ? `${notes} | UPI UTR: ${cleanUtr}` : `UPI UTR: ${cleanUtr}`) 
      : (notes || '');

    // 6. Generate clean branch + FY sequential booking reference (e.g. MBEC202601)
    const bookingRef = await generateBookingRef(branch_id, booking_date);

    // Compute accurate slot time accounting for extra hours
    const sl = mockStore.timeSlots.find(x => x.id === Number(slot_id));
    const computedSlotTime = sl 
      ? formatBookingSlotTime(sl.start_time, sl.end_time, validExtraHours)
      : 'Showtime';

    // 7. Create booking record
    const newBooking: any = {
      id: mockStore.bookings.length + 1,
      booking_ref: bookingRef,
      branch_id: Number(branch_id),
      theatre_id: Number(theatre_id),
      slot_id: Number(slot_id),
      slot_time: computedSlotTime,
      booking_date,
      customer_name,
      customer_phone: cleanPhone,
      customer_email: customer_email || '',
      screen_name: screen_name || '',
      guests: Number(guests) || 2,
      occasion_id: occasion_id ? Number(occasion_id) : 1,
      package_type: package_type || undefined,
      cake_flavor: cake_flavor || undefined,
      extra_hours: validExtraHours,
      extra_guests: extraGuestsCount,
      subtotal,
      addons_total: addonsTotal,
      discount: finalDiscount,
      total,
      advance_paid: advancePaid,
      balance,
      status: 'confirmed',
      payment_status: cleanUtr ? 'advance_paid' : 'advance_pending_screenshot',
      source: 'web',
      notes: finalNotes,
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString(),
      addons: computedAddons,
      idempotency_key: idempotency_key || null
    };

    // 8. Atomic transaction for multi-table operations in SQLite + in-memory store sync
    txn = await beginTransaction();
    if (txn) {
      try {
        // Insert booking
        const bookingInsertResult = await txn.query(
          `INSERT INTO \`bookings\` 
          (\`booking_ref\`, \`branch_id\`, \`theatre_id\`, \`slot_id\`, \`booking_date\`, 
           \`customer_name\`, \`customer_phone\`, \`customer_email\`, \`screen_name\`, 
           \`guests\`, \`occasion_id\`, \`subtotal\`, \`addons_total\`, \`discount\`, 
           \`total\`, \`advance_paid\`, \`balance\`, \`status\`, \`payment_status\`, 
           \`source\`, \`notes\`, \`idempotency_key\`) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            bookingRef, Number(branch_id), Number(theatre_id), Number(slot_id), booking_date,
            customer_name, cleanPhone, customer_email || '', screen_name || '',
            Number(guests) || 2, occasion_id ? Number(occasion_id) : 1,
            subtotal, addonsTotal, finalDiscount, total, advancePaid, balance,
            'confirmed', cleanUtr ? 'advance_paid' : 'advance_pending_screenshot',
            'web', finalNotes, idempotency_key || null
          ]
        );

        const insertedBookingId = bookingInsertResult?.insertId || bookingInsertResult?.lastInsertRowid || newBooking.id;

        // Insert booking addons
        for (const addon of computedAddons) {
          await txn.query(
            `INSERT INTO \`booking_addons\` (\`booking_id\`, \`addon_id\`, \`addon_name\`, \`price\`, \`quantity\`, \`subtotal\`) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [insertedBookingId, addon.addon_id, addon.addon_name, addon.price, addon.quantity, addon.subtotal]
          );
        }

        // Upsert customer atomically (handles both new and repeat customers seamlessly)
        await txn.query(
          `INSERT INTO \`customers\` (\`name\`, \`phone\`, \`email\`, \`total_bookings\`, \`lifetime_spend\`) 
           VALUES (?, ?, ?, 1, ?)
           ON CONFLICT(\`phone\`) DO UPDATE SET
             \`name\` = excluded.\`name\`,
             \`email\` = COALESCE(NULLIF(excluded.\`email\`, ''), customers.\`email\`),
             \`total_bookings\` = customers.\`total_bookings\` + 1,
             \`lifetime_spend\` = customers.\`lifetime_spend\` + excluded.\`lifetime_spend\``,
          [customer_name, cleanPhone, customer_email || '', total]
        );

        // Increment coupon usage atomically
        if (couponId) {
          await incrementCouponUsage(couponId);
        }

        await txn.commit();
      } catch (err) {
        await txn.rollback();
        throw err;
      } finally {
        txn.release();
      }
    }

    // Always keep in-memory mockStore and store.json in sync
    mockStore.bookings.unshift(newBooking);

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

    if (couponId) {
      const coupon = mockStore.coupons.find(c => c.id === couponId);
      if (coupon && coupon.used_count < coupon.usage_limit) {
        coupon.used_count += 1;
      }
    }

    saveStore();

    // 9. Generate WhatsApp confirmation message (no email)
    const branchName = mockStore.branches.find(b => b.id === Number(branch_id))?.name || 'Movie Bash';
    const theatreName = theatre?.name || 'Private Theatre';
    const slot = mockStore.timeSlots.find(s => s.id === Number(slot_id));
    const rawSlotTime = slot ? `${slot.start_time} - ${slot.end_time}` : 'Scheduled Slot';
    
    // Automatically extend end time if extra_hours were selected (e.g. 10:00 AM - 12:00 PM + 1hr = 10:00 AM – 01:00 PM (3 Hours))
    const formatExtendedSlot = (timeStr: string, extraH: number) => {
      if (!timeStr || extraH <= 0) return timeStr;
      const parts = timeStr.split(/[-–—]/).map(s => s.trim());
      if (parts.length !== 2) return `${timeStr} (+${extraH} Hr)`;
      const [startStr, endStr] = parts;
      const match = endStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return `${timeStr} (+${extraH} Hr)`;
      let h = parseInt(match[1], 10);
      const m = match[2];
      let mer = match[3].toUpperCase();
      if (mer === 'PM' && h < 12) h += 12;
      if (mer === 'AM' && h === 12) h = 0;
      h = (h + extraH) % 24;
      const newMer = h >= 12 ? 'PM' : 'AM';
      let dh = h % 12;
      if (dh === 0) dh = 12;
      const ph = dh < 10 ? `0${dh}` : `${dh}`;
      return `${startStr} – ${ph}:${m} ${newMer} (${2 + extraH} Hours Total)`;
    };

    const slotTime = formatExtendedSlot(rawSlotTime, Number(extra_hours) || 0);
    
    const branchAddress = Number(branch_id) === 1 
      ? '4th Floor, Srinivasam, Beside Sri Vishnu Grand, Electronic City, Bengaluru 560100'
      : '2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076';

    const packageName = package_type 
      ? `${package_type.charAt(0).toUpperCase() + package_type.slice(1)} Package`
      : '';

    const addonsListText = computedAddons.length > 0
      ? computedAddons.map(a => `${a.addon_name} (x${a.quantity})`).join(', ')
      : '';

    const whatsappMessage = 
      `🎬 *Movie Bash Private Theatre — Reservation Confirmed* 🍿\n\n` +
      `Dear *${customer_name}*,\n` +
      `Your private theatre booking is *CONFIRMED*!\n\n` +
      `🎟️ *Booking Ref:* ${bookingRef}\n` +
      `📍 *Venue:* ${branchName}\n` +
      `🎭 *Theatre:* ${theatreName}\n` +
      (packageName ? `📦 *Package:* ${packageName}\n` : '') +
      (cake_flavor ? `🎂 *Cake:* 500g ${cake_flavor}\n` : '') +
      `📅 *Date:* ${booking_date}\n` +
      `⏰ *Showtime:* ${slotTime}\n` +
      `👥 *Guests:* ${Number(guests) || 2}` + (extraGuestsCount > 0 ? ` (${extraGuestsCount} extra guests)` : '') + `\n` +
      (screen_name ? `✨ *Screen Name:* "${screen_name}"\n` : '') +
      (addonsListText ? `🎁 *Add-ons:* ${addonsListText}\n` : '') +
      `💰 *Total Amount:* ₹${total}\n` +
      `✅ *Advance Paid:* ₹${advancePaid}\n` +
      `💵 *Balance Due at Venue:* ₹${balance}\n` +
      `📍 *Location:* ${branchAddress}\n` +
      `🗺️ *Google Maps:* https://maps.google.com/?q=${encodeURIComponent(branchName)}\n\n` +
      `🍿 *Amenities Included:* 4K Cinema projection, Dolby sound, recliner seating, customizable music/OTT, and celebration atmosphere.\n\n` +
      `For any special requests (cakes, decor, songs), simply reply to this WhatsApp message or call us at *+91 99029 23656*.\n\n` +
      `We look forward to hosting your celebration! 🎉`;

    const customerPhoneClean = cleanPhone.slice(-10);
    const customerWhatsAppUrl = `https://wa.me/91${customerPhoneClean}?text=${encodeURIComponent(whatsappMessage)}`;
    const managerWhatsAppUrl = `https://wa.me/919902923656?text=${encodeURIComponent(whatsappMessage)}`;

    // Dispatch automated WhatsApp confirmations via Twilio API
    const adminPhone = process.env.TWILIO_ADMIN_WHATSAPP || '9448986953';
    const adminNotification = 
      `🚨 *NEW BOOKING RECEIVED (${bookingRef})*\n` +
      `👤 *Guest:* ${customer_name} (${cleanPhone})\n` +
      `🎭 *Screen:* ${theatreName} (${branchName})\n` +
      (packageName ? `📦 *Package:* ${packageName}\n` : '') +
      (cake_flavor ? `🎂 *Cake:* 500g ${cake_flavor}\n` : '') +
      `📅 *Date & Slot:* ${booking_date} @ ${slotTime}\n` +
      `👥 *Guests:* ${Number(guests) || 2}` + (extraGuestsCount > 0 ? ` (+${extraGuestsCount} extra)` : '') + `\n` +
      (addonsListText ? `🎁 *Add-ons:* ${addonsListText}\n` : '') +
      `💰 *Total:* ₹${total} (Advance Paid: ₹${advancePaid}, Due: ₹${balance})`;

    let customerResult: any = { success: false };
    let adminResult: any = { success: false };

    try {
      // 1. Send automated WhatsApp confirmation voucher directly to customer's phone
      customerResult = await sendWhatsAppMessage(cleanPhone, whatsappMessage);
      console.log('[Twilio Customer WhatsApp Dispatch Result]:', customerResult);
    } catch (custErr) {
      console.warn('[Twilio Customer WhatsApp Exception]:', custErr);
    }

    try {
      // 2. Automated notification to Admin manager phone
      adminResult = await sendWhatsAppMessage(adminPhone, adminNotification);
      console.log('[Twilio Admin WhatsApp Dispatch Result]:', adminResult);
    } catch (dispatchErr) {
      console.warn('[Twilio Cloud Dispatch Warning]:', dispatchErr);
    }

    return NextResponse.json({
      success: true,
      data: {
        booking_ref: bookingRef,
        total,
        advance_paid: advancePaid,
        balance,
        status: newBooking.status,
        booking: newBooking,
        whatsapp_confirmation: {
          message: whatsappMessage,
          url: customerWhatsAppUrl,
          manager_url: managerWhatsAppUrl,
          customer_sent: customerResult.success && !customerResult.skipped,
          admin_sent: adminResult.success && !adminResult.skipped
        }
      }
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    if (
      error?.code === 'SQLITE_CONSTRAINT' || 
      error?.code === 'ER_DUP_ENTRY' || 
      error?.message?.includes('UNIQUE constraint') || 
      error?.message?.includes('Duplicate entry') || 
      error?.message?.includes('uk_theatre_date_slot_active')
    ) {
      return NextResponse.json(
        { success: false, error: 'This time slot was just booked by another guest. Please choose a different slot.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ success: false, error: error.message || 'Booking creation failed' }, { status: 500 });
  } finally {
    // Always release the distributed lock
    if (lockAcquired) {
      await releaseBookingLock(theatreId, bookingDate, slotId);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingRef = searchParams.get('booking_ref') || searchParams.get('ref');
    const phone = searchParams.get('phone');
    const date = searchParams.get('date');
    const theatreId = searchParams.get('theatre_id') ? Number(searchParams.get('theatre_id')) : null;

    // 1. Lookup by booking_ref
    if (bookingRef) {
      try {
        const rows = await query<any[]>(
          `SELECT * FROM \`bookings\` WHERE \`booking_ref\` = ? AND \`is_deleted\` = 0 LIMIT 1`,
          [bookingRef]
        );
        if (Array.isArray(rows) && rows.length > 0) {
          return NextResponse.json({ success: true, booking: rows[0] });
        }
      } catch (err) {
        console.warn('SQLite lookup fallback to store:', err);
      }
      const match = mockStore.bookings.find(b => b.booking_ref === bookingRef && b.is_deleted === 0);
      if (match) {
        return NextResponse.json({ success: true, booking: match });
      }
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // 2. Phone lookups are not exposed publicly. Guests use the OTP-authenticated
    //    /api/customer/bookings endpoint, which scopes results to their own session.
    if (phone) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to view your bookings.' },
        { status: 401 }
      );
    }

    // 3. Lookup booked slots by date & theatre
    if (date) {
      let bookedSlots: any[] = [];
      try {
        // Occupancy only: never return booking references or customer data here.
        const sql = theatreId 
          ? `SELECT slot_id, theatre_id, status FROM \`bookings\` WHERE \`booking_date\` = ? AND \`theatre_id\` = ? AND \`is_deleted\` = 0 AND \`status\` NOT IN ('cancelled')`
          : `SELECT slot_id, theatre_id, status FROM \`bookings\` WHERE \`booking_date\` = ? AND \`is_deleted\` = 0 AND \`status\` NOT IN ('cancelled')`;
        const params = theatreId ? [date, theatreId] : [date];
        const rows = await query<any[]>(sql, params);
        if (Array.isArray(rows)) {
          bookedSlots = rows;
        }
      } catch (err) {
        console.warn('SQLite date lookup fallback:', err);
      }
      if (bookedSlots.length === 0) {
        bookedSlots = mockStore.bookings
          .filter(b => b.booking_date === date && b.is_deleted === 0 && b.status !== 'cancelled' && (!theatreId || b.theatre_id === theatreId))
          .map(b => ({ slot_id: b.slot_id, theatre_id: b.theatre_id, status: b.status }));
      }
      return NextResponse.json({ success: true, date, theatre_id: theatreId, booked_slots: bookedSlots });
    }

    // Default: no bulk listing. This endpoint must never dump customer records.
    return NextResponse.json(
      { success: false, error: 'Provide a booking reference to look up a reservation.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
