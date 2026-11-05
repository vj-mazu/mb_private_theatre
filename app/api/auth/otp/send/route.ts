import { NextRequest, NextResponse } from 'next/server';
import { activeOtps } from '@/lib/otp-store';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    // Generate 6-digit OTP (or fixed 123456 in dev/test)
    const code = process.env.NODE_ENV === 'production' 
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    activeOtps.set(cleanPhone, { code, expiresAt });

    console.log(`\n========================================`);
    console.log(`[MOVIE BASH OTP] For ${cleanPhone}: ${code}`);
    console.log(`========================================\n`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully. (In Dev Mode, use 123456 or check console)',
      devCode: code
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
