import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore, getDb } from '@/lib/db';
import { computeTheatreDynamicSlots, BookingSlotRef, DynamicSlotResult } from '@/lib/slot-engine';
import { getTodayIST } from '@/lib/time';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const theatreIdParam = searchParams.get('theatre') || searchParams.get('theatre_id');
    const branchParam = searchParams.get('branch') || searchParams.get('branch_id');
    const date = searchParams.get('date') || getTodayIST();

    let branchId: number | null = null;
    if (branchParam) {
      if (branchParam === 'electronic-city' || branchParam === '1') branchId = 1;
      else if (branchParam === 'btm-stage-2' || branchParam === '2') branchId = 2;
      else branchId = Number(branchParam);
    }

    const theatreId = theatreIdParam ? Number(theatreIdParam) : null;

    // Fetch active theatres from SQLite with fallback
    let theatres: any[] = [];
    let allDbSlots: any[] = [];
    try {
      const db = getDb();
      theatres = db.prepare('SELECT * FROM theatres WHERE is_active = 1').all();
      allDbSlots = db.prepare('SELECT * FROM time_slots WHERE is_active = 1').all();
    } catch {
      theatres = mockStore.theatres;
      allDbSlots = mockStore.timeSlots;
    }
    if (!theatres || theatres.length === 0) theatres = mockStore.theatres.filter(t => (t as any).is_active !== 0);
    if (!allDbSlots || allDbSlots.length === 0) allDbSlots = mockStore.timeSlots.filter(s => (s as any).is_active !== 0);

    // Enrich with dynamic CMS / memory store properties
    theatres = (theatres || []).map((t: any) => {
      const mem = mockStore.theatres.find(m => m.id === t.id);
      return {
        ...t,
        ...(mem || {}),
        name: mem?.name ?? t.name,
        emoji: mem?.emoji ?? t.emoji,
        capacity: mem?.capacity ?? t.capacity,
        branch_id: mem?.branch_id ?? t.branch_id
      };
    });

    // Filter relevant theatres
    if (theatreId) {
      theatres = theatres.filter(t => t.id === theatreId);
    } else if (branchId) {
      theatres = theatres.filter(t => t.branch_id === branchId);
    }

    const theatreIds = theatres.map(t => t.id);

    // Collect all bookings for these theatres on this date
    const dateBookingsMap = new Map<string, BookingSlotRef>();

    // 1. Check SQLite bookings for these theatres on this date
    if (theatreIds.length > 0) {
      try {
        const placeholders = theatreIds.map(() => '?').join(',');
        const rows = await query<any[]>(
          `SELECT slot_id, theatre_id, booking_date, extra_hours, status, is_deleted 
           FROM \`bookings\` 
           WHERE \`booking_date\` = ? 
             AND \`status\` NOT IN ('cancelled') 
             AND \`is_deleted\` = 0 
             AND \`theatre_id\` IN (${placeholders})`,
          [date, ...theatreIds]
        );
        if (Array.isArray(rows)) {
          rows.forEach((r: any) => {
            const key = `${r.theatre_id}_${r.slot_id}`;
            dateBookingsMap.set(key, {
              slot_id: Number(r.slot_id),
              theatre_id: Number(r.theatre_id),
              booking_date: date,
              extra_hours: Number(r.extra_hours || 0),
              status: r.status,
              is_deleted: Number(r.is_deleted || 0)
            });
          });
        }
      } catch (err) {
        console.warn('SQLite availability check fallback:', err);
      }
    }

    // 2. Also check memory store / store.json
    mockStore.bookings.forEach((b: any) => {
      if (
        b.booking_date === date &&
        b.status !== 'cancelled' &&
        b.is_deleted === 0 &&
        theatreIds.includes(Number(b.theatre_id))
      ) {
        const key = `${b.theatre_id}_${b.slot_id}`;
        dateBookingsMap.set(key, {
          slot_id: Number(b.slot_id),
          theatre_id: Number(b.theatre_id),
          booking_date: date,
          extra_hours: Number(b.extra_hours || 0),
          status: b.status,
          is_deleted: Number(b.is_deleted || 0)
        });
      }
    });

    const allBookings = Array.from(dateBookingsMap.values());

    // Compute dynamic slots per theatre with 15-minute turnaround/cleaning buffer
    const allComputedSlots: DynamicSlotResult[] = [];

    for (const th of theatres) {
      const thSlots = allDbSlots.filter((s: any) => s.theatre_id === th.id && s.is_active === 1);
      const thBookings = allBookings.filter(b => b.theatre_id === th.id);

      const computed = computeTheatreDynamicSlots(thSlots, thBookings, 15);

      computed.forEach(slot => {
        allComputedSlots.push({
          ...slot,
          theatre_name: th.name,
          theatre_emoji: th.emoji,
          theatre_capacity: th.capacity,
          branch_id: th.branch_id
        });
      });
    }

    return NextResponse.json({
      success: true,
      date,
      branch_id: branchId,
      theatre_id: theatreId,
      total_slots: allComputedSlots.length,
      available_slots: allComputedSlots.filter(s => !s.is_booked).length,
      booked_slots: allComputedSlots.filter(s => s.is_booked).length,
      data: allComputedSlots
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
