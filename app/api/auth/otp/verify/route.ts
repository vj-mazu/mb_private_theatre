import { NextRequest, NextResponse } from 'next/server';
import { activeOtps } from '@/lib/otp-store';
import { signCustomerToken } from '@/lib/auth';
import { mockStore } from '@/lib/db';
import { createRateLimiter } from '@/lib/rate-limiter';

const verifyRateLimiter = createRateLimiter({
  windowMs: 300000,
  maxRequests: 10,
  keyPrefix: 'otp-verify',
  message: 'Too many verification attempts. Please wait 5 minutes.'
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await verifyRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { phone, otp } = await request.json();
    const cleanPhone = String(phone || '').replace(/\D/g, '');
    const cleanOtp = String(otp || '').trim();

    // Verify against the issued code only. There is no universal bypass code.
    const stored = activeOtps.get(cleanPhone);
    const isValid = !!stored && stored.code === cleanOtp && stored.expiresAt > Date.now();

    if (!isValid) {
      return NextResponse.json({ success: false, error: 'Invalid or expired OTP. Please request a new code.' }, { status: 400 });
    }

    // Clear OTP
    activeOtps.delete(cleanPhone);

    // Find or create customer
    let customer = mockStore.customers.find(c => c.phone === cleanPhone);
    if (!customer) {
      customer = {
        id: mockStore.customers.length + 1,
        name: `Guest (${cleanPhone.slice(-4)})`,
        phone: cleanPhone,
        email: '',
        total_bookings: 0,
        lifetime_spend: 0,
        is_blocked: 0,
        created_at: new Date().toISOString().split('T')[0]
      };
      mockStore.customers.push(customer);
    }

    // Sign customer JWT
    const token = signCustomerToken({
      id: customer.id,
      phone: customer.phone,
      name: customer.name
    });

    const response = NextResponse.json({
      success: true,
      data: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone
      }
    });

    response.cookies.set('mb_customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
