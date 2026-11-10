import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';
import { enquiryRateLimiter } from '@/lib/rate-limiter';

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResponse = await enquiryRateLimiter(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const { name, phone, email, branch_name, preferred_date, guests, message } = body;

    if (!name || !phone || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, phone number, and message are required.' },
        { status: 400 }
      );
    }

    const enquiryRecord = {
      id: mockStore.enquiries.length + 1,
      name,
      phone,
      email: email || '',
      branch_name: branch_name || 'Electronic City',
      preferred_date: preferred_date || null,
      guests: guests ? Number(guests) : null,
      message,
      status: 'new' as const,
      created_at: new Date().toISOString()
    };

    mockStore.enquiries.unshift(enquiryRecord);

    return NextResponse.json({ success: true, message: 'Enquiry received. Our coordinator will contact you shortly.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ success: true, data: mockStore.enquiries });
}
