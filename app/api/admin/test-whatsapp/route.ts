import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { sendWhatsAppMessage } from '@/lib/twilio';

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ success: false, error: 'Phone number is required.' }, { status: 400 });
    }

    const testMsg = 
      `🎬 *Movie Bash Private Theatre — Twilio WhatsApp Test* 🍿\n\n` +
      `Hello! This is a test confirmation message from Movie Bash.\n` +
      `Your Twilio WhatsApp integration is connected and working successfully! 🎉\n` +
      `Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`;

    const result = await sendWhatsAppMessage(phone, testMsg);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
