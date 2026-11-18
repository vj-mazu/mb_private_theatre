import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  let backupPayload: any = {
    exported_at: new Date().toISOString(),
    exported_by: session.email,
    database_type: 'sqlite',
    store: mockStore
  };

  try {
    const [branches, theatres, time_slots, occasions, addons, bookings, customers, coupons, settings] = await Promise.all([
      query('SELECT * FROM `branches`'),
      query('SELECT * FROM `theatres`'),
      query('SELECT * FROM `time_slots`'),
      query('SELECT * FROM `occasions`'),
      query('SELECT * FROM `addons`'),
      query('SELECT * FROM `bookings`'),
      query('SELECT * FROM `customers`'),
      query('SELECT * FROM `coupons`'),
      query('SELECT * FROM `site_settings`')
    ]);

    backupPayload.sqlite_data = {
      branches,
      theatres,
      time_slots,
      occasions,
      addons,
      bookings,
      customers,
      coupons,
      settings
    };
  } catch (e: any) {
    console.warn('SQLite export failed, included JSON store instead:', e.message);
  }

  const jsonStr = JSON.stringify(backupPayload, null, 2);

  return new NextResponse(jsonStr, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="movie_bash_full_backup_${timestamp}.json"`
    }
  });
}
