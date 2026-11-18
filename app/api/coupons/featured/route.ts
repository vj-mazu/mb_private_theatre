import { NextResponse } from 'next/server';
import { mockStore, query } from '@/lib/db';

export async function GET() {
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
      activeCoupon = mockStore.coupons.find(c => c.is_active === 1 && c.discount_type === 'flat')
        || mockStore.coupons.find(c => c.is_active === 1)
        || { code: 'MOVIEBASH300', discount_value: 300, discount_type: 'flat' };
    }

    const headers = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };
    return NextResponse.json({
      success: true,
      data: activeCoupon
    }, { headers });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: { code: 'MOVIEBASH300', discount_value: 300, discount_type: 'flat' }
    }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
    });
  }
}
