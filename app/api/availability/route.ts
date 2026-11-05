import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const theatreIdParam = searchParams.get('theatre') || searchParams.get('theatre_id');
    const branchParam = searchParams.get('branch') || searchParams.get('branch_id');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    let branchId: number | null = null;
    if (branchParam) {
      if (branchParam === 'electronic-city' || branchParam === '1') branchId = 1;
      else if (branchParam === 'btm-stage-2' || branchParam === '2') branchId = 2;
      else branchId = Number(branchParam);
    }

    const theatreId = theatreIdParam ? Number(theatreIdParam) : null;

    // Filter relevant theatres
    let theatres = [...mockStore.theatres];
    if (theatreId) {
      theatres = theatres.filter(t => t.id === theatreId);
    } else if (branchId) {
      theatres = theatres.filter(t => t.branch_id === branchId);
    }

    const theatreIds = theatres.map(t => t.id);

    // Get time slots for these theatres
    let slots = mockStore.timeSlots.filter(s => theatreIds.includes(s.theatre_id) && s.is_active === 1);

    // Collect all booked slot IDs for this date
    const bookedSlotIds = new Set<number>();

    // From mockStore
    mockStore.bookings.forEach((b: any) => {
      if (
        b.booking_date === date &&
        b.status !== 'cancelled' &&
        b.is_deleted === 0 &&
        theatreIds.includes(Number(b.theatre_id))
      ) {
        bookedSlotIds.add(Number(b.slot_id));
      }
    });

    const result = slots.map((s: any) => {
      const th = mockStore.theatres.find(t => t.id === s.theatre_id);
      return {
        ...s,
        time: `${s.start_time} - ${s.end_time}`,
        theatre_name: th?.name,
        theatre_emoji: th?.emoji,
        theatre_capacity: th?.capacity,
        branch_id: th?.branch_id,
        is_booked: bookedSlotIds.has(Number(s.id))
      };
    });

    return NextResponse.json({
      success: true,
      date,
      branch_id: branchId,
      theatre_id: theatreId,
      total_slots: result.length,
      available_slots: result.filter(s => !s.is_booked).length,
      booked_slots: result.filter(s => s.is_booked).length,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
