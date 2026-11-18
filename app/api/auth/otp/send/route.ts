import { NextRequest, NextResponse } from 'next/server';
import { activeOtps } from '@/lib/otp-store';
import { otpRateLimiter } from '@/lib/rate-limiter';
import { sendSMSMessage, sendWhatsAppMessage } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await otpRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { phone } = await request.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');

    if (cleanPhone.length < 10) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 10-digit mobile number' }, { status: 400 });
    }

    const isProduction = process.env.NODE_ENV === 'production';

    // Development keeps a fixed, well-known code so local testing works without an SMS
    // provider. Production always uses a random 6-digit code.
    const code = isProduction
      ? Math.floor(100000 + Math.random() * 900000).toString()
      : '123456';

    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 mins
    activeOtps.set(cleanPhone, { code, expiresAt });

    if (isProduction) {
      const messageText = `${code} is your Movie Bash verification code. It expires in 5 minutes. Do not share it with anyone.`;

      let delivered = false;
      try {
        const result = await sendSMSMessage(cleanPhone, messageText);
        delivered = result.success && !result.skipped;
        if (!delivered) {
          const waResult = await sendWhatsAppMessage(cleanPhone, messageText);
          delivered = waResult.success && !waResult.skipped;
        }
      } catch (err) {
        console.error('[Movie Bash OTP] Dispatch failed:', err);
      }

      if (!delivered) {
        activeOtps.delete(cleanPhone);
        console.error('[Movie Bash OTP] No messaging provider is configured; refusing to pretend an OTP was sent.');
        return NextResponse.json(
          { success: false, error: 'Verification is temporarily unavailable. Please call +91 99029 23656.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully to your WhatsApp / mobile number.'
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
