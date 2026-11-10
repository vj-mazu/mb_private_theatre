import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/twilio';

export async function GET(request: NextRequest) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const adminPhone = process.env.TWILIO_ADMIN_WHATSAPP || '9448986953';
  const from = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  const check = {
    has_account_sid: Boolean(accountSid),
    account_sid_prefix: accountSid ? `${accountSid.slice(0, 6)}...` : 'MISSING IN VERCEL ENV',
    has_auth_token: Boolean(authToken),
    from_number: from,
    target_admin_phone: adminPhone
  };

  if (!accountSid || !authToken) {
    return NextResponse.json({
      status: 'CONFIG_MISSING',
      message: 'TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN is missing in Vercel Environment Variables. Please add them in Vercel Dashboard -> Settings -> Environment Variables.',
      diagnostics: check
    }, { status: 400 });
  }

  const testMessage = `🎬 *Movie Bash Live Diagnostic Test* 🍿\nYour Twilio WhatsApp is connected and sending from Vercel!\nTimestamp: ${new Date().toISOString()}`;

  const result = await sendWhatsAppMessage(adminPhone, testMessage);

  return NextResponse.json({
    status: result.success ? 'SUCCESS' : 'FAILED',
    diagnostics: check,
    twilio_result: result
  });
}
