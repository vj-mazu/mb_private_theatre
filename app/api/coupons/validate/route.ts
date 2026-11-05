import { NextRequest, NextResponse } from 'next/server';
import { mockStore, query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { code, amount } = await request.json();
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code required' }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const coupon = mockStore.coupons.find(c => c.code === cleanCode && c.is_active === 1);

    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid or expired coupon code' }, { status: 404 });
    }

    if (amount && coupon.min_booking_amount && amount < coupon.min_booking_amount) {
      return NextResponse.json({
        success: false,
        error: `Minimum booking amount of ₹${coupon.min_booking_amount} required to use this code`
      }, { status: 400 });
    }

    let discountAmount = 0;
    if (coupon.discount_type === 'flat') {
      discountAmount = coupon.discount_value;
    } else {
      discountAmount = Math.round(((amount || 0) * coupon.discount_value) / 100);
    }

    return NextResponse.json({
      success: true,
      data: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: discountAmount,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
