import { NextResponse } from 'next/server';
import { mockStore, query } from '@/lib/db';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };

  try {
    let activeCoupon: any = null;

    try {
      const rows = await query<any[]>(
        'SELECT * FROM `coupons` WHERE `is_active` = 1 ORDER BY `id` DESC LIMIT 1'
      );
      if (Array.isArray(rows) && rows.length > 0) {
        activeCoupon = rows[0];
      }
    } catch (err) {
      console.warn('SQLite coupon query fallback:', err);
    }

    if (!activeCoupon) {
      activeCoupon = mockStore.coupons.find((c: any) => c.is_active === 1) || null;
    }

    return NextResponse.json({ success: true, data: activeCoupon }, { headers });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: null }, { headers });
  }
}
