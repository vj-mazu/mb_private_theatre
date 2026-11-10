/**
 * Twilio Messaging Service (WhatsApp & SMS)
 * Sends automated booking vouchers and manager alerts via Twilio API.
 */

export interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
}

export async function sendWhatsAppMessage(
  toPhone: string,
  messageText: string
): Promise<SendMessageResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  // Use sandbox sender or verified WhatsApp number
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!accountSid || !authToken) {
    console.log('[Twilio WhatsApp] Credentials not configured in .env. Skipping automatic API call.');
    return {
      success: true,
      skipped: true,
      error: 'Twilio credentials not configured in environment variables.'
    };
  }

  // Format destination phone number with country code (defaults to +91 for India if not provided)
  let cleanNumber = toPhone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const formattedTo = `whatsapp:+${cleanNumber}`;
  const formattedFrom = fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`;

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', formattedFrom);
    params.append('To', formattedTo);
    params.append('Body', messageText);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    let data = await res.json();

    // If custom number is not yet an approved WhatsApp channel (Error 63007), fallback to Twilio WhatsApp Sandbox
    if (!res.ok && data.code === 63007 && formattedFrom !== 'whatsapp:+14155238886') {
      console.log('[Twilio WhatsApp] Channel not found for custom number. Retrying with Twilio Sandbox (whatsapp:+14155238886)...');
      params.set('From', 'whatsapp:+14155238886');
      const retryRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
      data = await retryRes.json();
      if (!retryRes.ok) {
        return {
          success: false,
          error: data.message || `Twilio API error: ${retryRes.statusText}`
        };
      }
    } else if (!res.ok) {
      console.error('[Twilio WhatsApp] Error sending message:', data);
      return {
        success: false,
        error: data.message || `Twilio API error: ${res.statusText}`
      };
    }

    console.log(`[Twilio WhatsApp] Successfully dispatched to ${formattedTo}. SID: ${data.sid}`);
    return {
      success: true,
      messageId: data.sid
    };
  } catch (err: any) {
    console.error('[Twilio WhatsApp] Network or runtime exception:', err);
    return {
      success: false,
      error: err.message || 'Failed to dispatch WhatsApp message via Twilio'
    };
  }
}

export async function sendSMSMessage(
  toPhone: string,
  messageText: string
): Promise<SendMessageResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+14123569189';

  if (!accountSid || !authToken) {
    return {
      success: true,
      skipped: true,
      error: 'Twilio credentials not configured.'
    };
  }

  let cleanNumber = toPhone.replace(/\D/g, '');
  if (cleanNumber.length === 10) {
    cleanNumber = `91${cleanNumber}`;
  }
  const formattedTo = `+${cleanNumber}`;

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', formattedTo);
    params.append('Body', messageText);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.message || `Twilio API error: ${res.statusText}`
      };
    }

    return {
      success: true,
      messageId: data.sid
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Failed to dispatch SMS via Twilio'
    };
  }
}
