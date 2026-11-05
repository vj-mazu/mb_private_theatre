import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const branchParam = searchParams.get('branch');
  const branchId = branchParam ? Number(branchParam) : null;

  // Filter bookings based on branch filter or admin role restriction
  let effectiveBranchId = branchId;
  if (session.role === 'branch_manager' && session.branch_id) {
    effectiveBranchId = session.branch_id;
  }

  let allBookings = [...mockStore.bookings];
  if (effectiveBranchId) {
    allBookings = allBookings.filter(b => b.branch_id === effectiveBranchId);
  }

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const currentYear = today.getFullYear();
  const currentMonthNum = today.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  // Categorize bookings
  const confirmedAndCompleted = allBookings.filter(b => b.is_deleted === 0 && (b.status === 'confirmed' || b.status === 'completed'));
  const cancelledBookings = allBookings.filter(b => b.status === 'cancelled' || b.is_deleted === 1);
  const todaysActive = confirmedAndCompleted.filter(b => b.booking_date === todayStr);
  const yesterdaysActive = confirmedAndCompleted.filter(b => b.booking_date === yesterdayStr);
  const thisMonthActive = confirmedAndCompleted.filter(b => b.booking_date.startsWith(currentMonthStr));
  const lastMonthActive = confirmedAndCompleted.filter(b => b.booking_date.startsWith(lastMonthStr));
  const upcomingActive = confirmedAndCompleted.filter(b => b.booking_date > todayStr);
  const completedActive = allBookings.filter(b => b.status === 'completed' && b.is_deleted === 0);

  // Revenue totals
  let totalRevenue = 0;
  let advanceCollected = 0;
  let balancePending = 0;

  confirmedAndCompleted.forEach(b => {
    totalRevenue += Number(b.total || 0);
    advanceCollected += Number(b.advance_paid || 0);
    balancePending += Number(b.balance || 0);
  });

  // Daily revenue
  const todayRevenue = todaysActive.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const todayAdvance = todaysActive.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);
  const yesterdayRevenue = yesterdaysActive.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const yesterdayAdvance = yesterdaysActive.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);

  // Monthly revenue
  const thisMonthRevenue = thisMonthActive.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const thisMonthAdvance = thisMonthActive.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);
  const lastMonthRevenue = lastMonthActive.reduce((sum, b) => sum + Number(b.total || 0), 0);
  const lastMonthAdvance = lastMonthActive.reduce((sum, b) => sum + Number(b.advance_paid || 0), 0);

  // Cancelled & Lost revenue
  let cancelledLostRevenue = 0;
  let totalRefunded = 0;
  cancelledBookings.forEach(b => {
    cancelledLostRevenue += Number(b.total || 0);
    totalRefunded += Number(b.refund_amount || 0);
  });

  const totalBookingsAll = confirmedAndCompleted.length + cancelledBookings.length;
  const cancellationRate = totalBookingsAll > 0 ? (cancelledBookings.length / totalBookingsAll) * 100 : 0;
  const collectionRate = totalRevenue > 0 ? (advanceCollected / totalRevenue) * 100 : 0;

  // 14-day daily timeline
  const dailyTimeline: Array<{ date: string; display_date: string; revenue: number; advance: number; count: number }> = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const dayMatches = confirmedAndCompleted.filter(b => b.booking_date === dStr);
    const dayRev = dayMatches.reduce((acc, b) => acc + Number(b.total || 0), 0);
    const dayAdv = dayMatches.reduce((acc, b) => acc + Number(b.advance_paid || 0), 0);
    const displayDate = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dailyTimeline.push({
      date: dStr,
      display_date: displayDate,
      revenue: dayRev,
      advance: dayAdv,
      count: dayMatches.length
    });
  }

  // Monthly timeline (last 6 months)
  const monthlyTimeline: Array<{ month_key: string; display_month: string; revenue: number; advance: number; count: number }> = [];
  for (let i = 5; i >= 0; i--) {
    const m = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const mKey = `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, '0')}`;
    const monthMatches = confirmedAndCompleted.filter(b => b.booking_date.startsWith(mKey));
    const mRev = monthMatches.reduce((acc, b) => acc + Number(b.total || 0), 0);
    const mAdv = monthMatches.reduce((acc, b) => acc + Number(b.advance_paid || 0), 0);
    const displayMonth = m.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    monthlyTimeline.push({
      month_key: mKey,
      display_month: displayMonth,
      revenue: mRev,
      advance: mAdv,
      count: monthMatches.length
    });
  }

  // Cancelled bookings details
  const cancelledList = cancelledBookings.map(b => {
    const th = mockStore.theatres.find(t => t.id === b.theatre_id);
    const br = mockStore.branches.find(x => x.id === b.branch_id);
    return {
      id: b.id,
      ref: b.booking_ref,
      customer_name: b.customer_name,
      customer_phone: b.customer_phone,
      booking_date: b.booking_date,
      branch_name: br?.name || 'Branch',
      theatre_name: th?.name || 'Theatre',
      theatre_emoji: th?.emoji || '🎬',
      total: Number(b.total || 0),
      refund_amount: Number(b.refund_amount || 0),
      cancelled_reason: b.cancelled_reason || 'Customer cancellation request',
      source: b.source || 'web'
    };
  });

  // Booking Source distribution (Phone Call vs Web vs Walk-in)
  const sourceNames: Record<string, string> = {
    phone: 'Phone Call (Admin)',
    web: 'Online Website',
    walk_in: 'Walk-in Desk'
  };
  const channelDistribution = ['phone', 'web', 'walk_in'].map(src => {
    const srcBookings = confirmedAndCompleted.filter(b => (b.source || 'web') === src);
    const srcRev = srcBookings.reduce((sum, b) => sum + Number(b.total || 0), 0);
    return {
      source_key: src,
      name: sourceNames[src] || src,
      count: srcBookings.length,
      revenue: srcRev,
      pct: totalRevenue > 0 ? ((srcRev / totalRevenue) * 100).toFixed(1) : '0'
    };
  });

  // Theatre / Screen Performance
  const theatreDistribution = mockStore.theatres.map(th => {
    const thBookings = confirmedAndCompleted.filter(b => b.theatre_id === th.id);
    const thRev = thBookings.reduce((sum, b) => sum + Number(b.total || 0), 0);
    return {
      id: th.id,
      name: th.name,
      emoji: th.emoji,
      branch_id: th.branch_id,
      count: thBookings.length,
      revenue: thRev
    };
  });

  // Branch Performance
  const branchDistribution = mockStore.branches.map(br => {
    const brBookings = confirmedAndCompleted.filter(b => b.branch_id === br.id);
    const brToday = brBookings.filter(b => b.booking_date === todayStr);
    const brRev = brBookings.reduce((sum, b) => sum + Number(b.total || 0), 0);
    const brTodayRev = brToday.reduce((sum, b) => sum + Number(b.total || 0), 0);
    return {
      id: br.id,
      name: br.name,
      count: brBookings.length,
      revenue: brRev,
      today_count: brToday.length,
      today_revenue: brTodayRev
    };
  });

  // Bookings by occasion
  const occasionDistribution = mockStore.occasions.map(occ => {
    const count = confirmedAndCompleted.filter(b => b.occasion_id === occ.id).length;
    return { id: occ.id, name: occ.name, count };
  });

  // Today's schedule timeline
  const todaySchedule = todaysActive.map(b => {
    const slot = mockStore.timeSlots.find(s => s.id === b.slot_id);
    const theatre = mockStore.theatres.find(t => t.id === b.theatre_id);
    const branch = mockStore.branches.find(br => br.id === b.branch_id);
    return {
      id: b.id,
      ref: b.booking_ref,
      theatre: theatre?.name || 'Screen',
      emoji: theatre?.emoji || '🎬',
      branch: branch?.name || 'Branch',
      customer: b.customer_name,
      phone: b.customer_phone,
      slot: slot ? `${slot.start_time} - ${slot.end_time}` : 'Slot',
      status: b.status,
      guests: b.guests,
      title: b.screen_name || 'Celebration',
      total: b.total,
      advance_paid: b.advance_paid,
      balance: b.balance
    };
  });

  return NextResponse.json({
    success: true,
    data: {
      metrics: {
        total_bookings: confirmedAndCompleted.length,
        todays_bookings: todaysActive.length,
        upcoming_bookings: upcomingActive.length,
        completed_bookings: completedActive.length,
        cancelled_bookings: cancelledBookings.length,
        cancellation_rate_pct: Number(cancellationRate.toFixed(1)),

        // Revenue Totals
        total_revenue: totalRevenue,
        advance_collected: advanceCollected,
        balance_pending: balancePending,
        collection_rate_pct: Number(collectionRate.toFixed(1)),

        // Daily
        today_revenue: todayRevenue,
        today_advance: todayAdvance,
        yesterday_revenue: yesterdayRevenue,
        yesterday_advance: yesterdayAdvance,

        // Monthly
        this_month_revenue: thisMonthRevenue,
        this_month_advance: thisMonthAdvance,
        this_month_bookings: thisMonthActive.length,
        last_month_revenue: lastMonthRevenue,
        last_month_advance: lastMonthAdvance,
        last_month_bookings: lastMonthActive.length,

        // Cancelled & Lost
        cancelled_lost_revenue: cancelledLostRevenue,
        total_refunded: totalRefunded,
      },
      daily_timeline: dailyTimeline,
      monthly_timeline: monthlyTimeline,
      cancelled_list: cancelledList,
      channel_distribution: channelDistribution,
      theatre_distribution: theatreDistribution,
      branch_distribution: branchDistribution,
      occasion_distribution: occasionDistribution,
      today_schedule: todaySchedule,
      branches: mockStore.branches
    }
  });
}
