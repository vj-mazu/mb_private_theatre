import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore, saveStore, acquireBookingLock, releaseBookingLock, beginTransaction, generateBookingRef, incrementCouponUsage, checkMySQL } from '@/lib/db';
import { bookingRateLimiter } from '@/lib/rate-limiter';
import { sendWhatsAppMessage, sendSMSMessage } from '@/lib/twilio';

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
      discount = 0,
      payment_mode = 'advance_later',
      notes = '',
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

    // Phone validation (10 digit Indian number)
    const cleanPhone = String(customer_phone).replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid 10-digit mobile number.' },
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

    // 3. Fetch theatre and calculate package pricing
    const theatre = mockStore.theatres.find(t => t.id === Number(theatre_id));
    const isEcity = Number(branch_id) === 1;

    let basePackagePrice = theatre ? Number(theatre.base_price) : 899;
    let extraPersonRate = 0;
    let extraHourRate = 0;
    let baseCapacity = theatre ? theatre.capacity : 2;

    if (isEcity) {
      if (Number(theatre_id) === 1) {
        // Couple Room
        baseCapacity = 2;
        extraPersonRate = 99;
        extraHourRate = 400;
        if (package_type === 'premium') basePackagePrice = 2800;
        else if (package_type === 'custom') basePackagePrice = 899;
        else basePackagePrice = 1499; // standard
      } else if (Number(theatre_id) === 2 || Number(theatre_id) === 3) {
        // Celebration Room (2) or Family Room (3)
        baseCapacity = 6;
        extraPersonRate = 149;
        extraHourRate = 750;
        if (package_type === 'premium') basePackagePrice = 3500;
        else if (package_type === 'custom') basePackagePrice = 1699;
        else basePackagePrice = 2200; // standard
      }
    }

    const totalGuests = Number(guests) || baseCapacity;
    const extraGuestsCount = Math.max(0, totalGuests - baseCapacity);
    const extraGuestsTotal = extraGuestsCount * extraPersonRate;
    const extraHoursTotal = (Number(extra_hours) || 0) * extraHourRate;

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
    let finalDiscount = Number(discount);
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
    const advancePaid = payment_mode === 'razorpay' ? 500 : 0;
    const balance = total - advancePaid;

    // 6. Generate clean branch + FY sequential booking reference (e.g. MBEC202601)
    const bookingRef = await generateBookingRef(branch_id, booking_date);

    // 7. Create booking record
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
      package_type: isEcity ? package_type : undefined,
      cake_flavor: cake_flavor || undefined,
      extra_hours: Number(extra_hours) || 0,
      extra_guests: extraGuestsCount,
      subtotal,
      addons_total: addonsTotal,
      discount: finalDiscount,
      total,
      advance_paid: advancePaid,
      balance,
      status: 'confirmed',
      payment_status: payment_mode === 'razorpay' ? 'advance_paid' : 'unpaid',
      source: 'web',
      notes: notes || '',
      cancelled_reason: '',
      refund_amount: 0,
      is_deleted: 0,
      created_at: new Date().toISOString(),
      addons: computedAddons,
      idempotency_key: idempotency_key || null
    };

    // 8. Use transaction for multi-table operations (MySQL) or atomic mock operations
    const isMySQL = await checkMySQL();

    if (isMySQL) {
      txn = await beginTransaction();
      if (txn) {
        try {
          // Insert booking
          await txn.query(
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
              'confirmed', payment_mode === 'razorpay' ? 'advance_paid' : 'unpaid',
              'web', notes || '', idempotency_key || null
            ]
          );

          // Insert booking addons
          for (const addon of computedAddons) {
            await txn.query(
              `INSERT INTO \`booking_addons\` (\`booking_id\`, \`addon_id\`, \`addon_name\`, \`price\`, \`quantity\`, \`subtotal\`) 
               VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, ?)`,
              [addon.addon_id, addon.addon_name, addon.price, addon.quantity, addon.subtotal]
            );
          }

          // Update or insert customer
          const [existingCust] = await txn.query(
            'SELECT * FROM `customers` WHERE `phone` = ?', [cleanPhone]
          ) as any[];
          
          if (existingCust && existingCust.length > 0) {
            await txn.query(
              'UPDATE `customers` SET `total_bookings` = `total_bookings` + 1, `lifetime_spend` = `lifetime_spend` + ? WHERE `phone` = ?',
              [total, cleanPhone]
            );
          } else {
            await txn.query(
              'INSERT INTO `customers` (`name`, `phone`, `email`, `total_bookings`, `lifetime_spend`) VALUES (?, ?, ?, 1, ?)',
              [customer_name, cleanPhone, customer_email || '', total]
            );
          }

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
    } else {
      // Mock store operations (atomic in single process)
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

      // Increment coupon usage
      if (couponId) {
        const coupon = mockStore.coupons.find(c => c.id === couponId);
        if (coupon && coupon.used_count < coupon.usage_limit) {
          coupon.used_count += 1;
        }
      }

      saveStore();
    }

    // 9. Generate WhatsApp confirmation message (no email)
    const branchName = mockStore.branches.find(b => b.id === Number(branch_id))?.name || 'Movie Bash';
    const theatreName = theatre?.name || 'Private Theatre';
    const slot = mockStore.timeSlots.find(s => s.id === Number(slot_id));
    const slotTime = slot ? `${slot.start_time} - ${slot.end_time}` : 'Scheduled Slot';
    
    const branchAddress = Number(branch_id) === 1 
      ? '4th Floor, Srinivasam, Beside Sri Vishnu Grand, Electronic City, Bengaluru 560100'
      : '2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076';

    const packageName = isEcity && package_type 
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
      `⏰ *Showtime:* ${slotTime}` + (extra_hours ? ` (+1 Hr Extension)` : '') + `\n` +
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

    const whatsappUrl = `https://wa.me/919902923656?text=${encodeURIComponent(whatsappMessage)}`;

    // Dispatch automated WhatsApp & SMS confirmations
    // NOTE: On Vercel serverless, we MUST await external fetch calls so Vercel does not terminate the lambda before the network packet is sent!
    const adminPhone = process.env.TWILIO_ADMIN_WHATSAPP || '9902923656';
    const adminNotification = 
      `🚨 *NEW BOOKING RECEIVED (${bookingRef})*\n` +
      `👤 *Guest:* ${customer_name} (${cleanPhone})\n` +
      `🎭 *Screen:* ${theatreName} (${branchName})\n` +
      (packageName ? `📦 *Package:* ${packageName}\n` : '') +
      (cake_flavor ? `🎂 *Cake:* 500g ${cake_flavor}\n` : '') +
      `📅 *Date & Slot:* ${booking_date} @ ${slotTime}` + (extra_hours ? ` (+1 Hr Extension)` : '') + `\n` +
      `👥 *Guests:* ${Number(guests) || 2}` + (extraGuestsCount > 0 ? ` (+${extraGuestsCount} extra)` : '') + `\n` +
      (addonsListText ? `🎁 *Add-ons:* ${addonsListText}\n` : '') +
      `💰 *Total:* ₹${total} (Advance Paid: ₹${advancePaid}, Due: ₹${balance})`;

    try {
      await Promise.allSettled([
        sendWhatsAppMessage(cleanPhone, whatsappMessage),
        sendSMSMessage(cleanPhone, `Movie Bash: Reservation Confirmed! Ref: ${bookingRef}, Screen: ${theatreName}${packageName ? ` (${packageName})` : ''}, Date: ${booking_date} @ ${slotTime}. Location: ${branchName}. Helpline: +91 99029 23656`),
        sendWhatsAppMessage(adminPhone, adminNotification)
      ]);
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
          url: whatsappUrl
        }
      }
    });
  } catch (error: any) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    // Always release the distributed lock
    if (lockAcquired) {
      await releaseBookingLock(theatreId, bookingDate, slotId);
    }
  }
}
