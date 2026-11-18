/**
 * Movie Bash Dynamic Slot Engine
 * Handles dynamic schedule shifts when guests book extra hours (+1 hr),
 * enforcing a mandatory 15-minute turnaround / cleaning & sanitization buffer.
 */

export interface RawSlot {
  id: number;
  theatre_id: number;
  start_time: string; // e.g. '10:00 AM'
  end_time: string;   // e.g. '12:00 PM'
  crosses_midnight?: number;
  is_active?: number;
  sort_order?: number;
}

export interface BookingSlotRef {
  id?: number;
  slot_id: number;
  theatre_id: number;
  booking_date: string;
  extra_hours?: number;
  status: string;
  is_deleted?: number;
}

export interface DynamicSlotResult extends RawSlot {
  time: string;                  // Dynamic display: e.g. '01:15 PM – 03:15 PM'
  dynamic_start_time: string;    // e.g. '01:15 PM'
  dynamic_end_time: string;      // e.g. '03:15 PM'
  original_start_time: string;   // e.g. '12:30 PM'
  original_end_time: string;     // e.g. '02:30 PM'
  original_time: string;         // e.g. '12:30 PM – 02:30 PM'
  is_booked: boolean;
  extra_hours: number;
  is_shifted: boolean;
  shift_minutes: number;
  cleaning_until: string;
  can_add_extra_hour: boolean;
  theatre_name?: string;
  theatre_emoji?: string;
  theatre_capacity?: number;
  branch_id?: number;
}

/**
 * Converts a time string like '10:00 AM', '12:30 PM', '01:15 AM' to minutes from 00:00
 */
export function timeToMinutes(str: string): number {
  if (!str) return 0;
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && h !== 12) h += 12;
  if (meridiem === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

/**
 * Converts minutes from 00:00 to formatted time string 'hh:mm A'
 */
export function minutesToTime(mins: number): string {
  let m = mins % (24 * 60);
  if (m < 0) m += 24 * 60;
  const h = Math.floor(m / 60);
  const min = m % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(displayH)}:${pad(min)} ${meridiem}`;
}

/**
 * Extra hour rate by theatre ID
 * Couple: ₹400
 * Celebration, Family & VIP: ₹750
 */
export function getExtraHourRate(theatreId: number): number {
  // Theatre 1 = Electronic City Couple
  // Theatre 4 = BTM 2nd Stage Couple
  if (theatreId === 1 || theatreId === 4) {
    return 400;
  }
  return 750;
}

/**
 * Accurately formats a booking slot time taking extra hours into account.
 * E.g.
 * 10:00 AM, 12:00 PM, extraHours = 0 => "10:00 AM – 12:00 PM (2 Hours)"
 * 10:00 AM, 12:00 PM, extraHours = 1 => "10:00 AM – 01:00 PM (3 Hours · +1 Hr Extra)"
 * 10:00 AM, 12:00 PM, extraHours = 2 => "10:00 AM – 02:00 PM (4 Hours · +2 Hrs Extra)"
 */
export function formatBookingSlotTime(
  rawStartTime: string,
  rawEndTime: string,
  extraHours: number = 0
): string {
  if (!rawStartTime) return 'Showtime Slot';
  if (!rawEndTime) return rawStartTime;
  
  const cleanHours = Math.max(0, Number(extraHours) || 0);
  if (cleanHours <= 0) {
    return `${rawStartTime} – ${rawEndTime} (2 Hours)`;
  }
  
  const startMins = timeToMinutes(rawStartTime);
  let endMins = timeToMinutes(rawEndTime);
  if (endMins <= startMins) endMins += 24 * 60; // crosses midnight
  
  const extendedEndMins = endMins + (cleanHours * 60);
  const extendedEndTime = minutesToTime(extendedEndMins);
  const totalHours = 2 + cleanHours;
  return `${rawStartTime} – ${extendedEndTime} (${totalHours} Hours · +${cleanHours} Hr Extra)`;
}

/**
 * Dynamically computes all slots for a single theatre on a specific date,
 * taking into account bookings with extra hours and 15-minute cleaning buffers.
 */
export function computeTheatreDynamicSlots(
  theatreSlots: RawSlot[],
  theatreBookings: BookingSlotRef[],
  cleaningGapMinutes: number = 15
): DynamicSlotResult[] {
  // Sort slots chronologically by original start time
  const sortedSlots = [...theatreSlots].sort((a, b) => {
    return (a.sort_order || 0) - (b.sort_order || 0) || timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
  });

  const activeBookings = theatreBookings.filter(
    b => b.status !== 'cancelled' && (b.is_deleted === undefined || b.is_deleted === 0)
  );

  const bookingMap = new Map<number, BookingSlotRef>();
  activeBookings.forEach(b => bookingMap.set(Number(b.slot_id), b));

  let nextAvailableMin = 0;

  // Pass 1: Compute dynamic start, end, and shift
  const computed = sortedSlots.map(slot => {
    const origStart = timeToMinutes(slot.start_time);
    let origEnd = timeToMinutes(slot.end_time);
    if (origEnd < origStart) origEnd += 24 * 60; // crosses midnight
    const baseDuration = origEnd - origStart;

    const booking = bookingMap.get(Number(slot.id));
    const isBooked = !!booking;
    const extraHours = booking ? Number(booking.extra_hours || 0) : 0;

    // Actual start is standard start or when theatre is ready after prior slot + 15 min clean
    const actualStart = Math.max(origStart, nextAvailableMin);
    const actualDuration = baseDuration + (extraHours * 60);
    const actualEnd = actualStart + actualDuration;

    // Theatre will be clean and ready for next slot after cleaning gap
    nextAvailableMin = actualEnd + cleaningGapMinutes;

    const shiftMinutes = Math.max(0, actualStart - origStart);

    return {
      ...slot,
      is_booked: isBooked,
      extra_hours: extraHours,
      shift_minutes: shiftMinutes,
      is_shifted: shiftMinutes > 0,
      actual_start_min: actualStart,
      actual_end_min: actualEnd,
      dynamic_start_time: minutesToTime(actualStart),
      dynamic_end_time: minutesToTime(actualEnd),
      original_start_time: slot.start_time,
      original_end_time: slot.end_time,
      original_time: `${slot.start_time} – ${slot.end_time}`,
      time: `${minutesToTime(actualStart)} – ${minutesToTime(actualEnd)}`,
      cleaning_until: minutesToTime(nextAvailableMin),
      can_add_extra_hour: true // evaluated in Pass 2
    };
  });

  // Pass 2: Check if extra hour can be added for available slots without colliding
  // with an already-booked slot downstream
  for (let i = 0; i < computed.length; i++) {
    const cur = computed[i];
    if (cur.is_booked) {
      cur.can_add_extra_hour = false;
      continue;
    }

    // If customer adds +1 hour, session ends cur.actual_end_min + 60 + 15 min clean
    const proposedCleanReady = cur.actual_end_min + 60 + cleaningGapMinutes;

    // Check next upcoming booked slot
    let canFit = true;
    for (let j = i + 1; j < computed.length; j++) {
      const nextSlot = computed[j];
      if (nextSlot.is_booked) {
        if (proposedCleanReady > nextSlot.actual_start_min) {
          canFit = false;
        }
        break;
      }
    }
    cur.can_add_extra_hour = canFit;
  }

  return computed;
}
