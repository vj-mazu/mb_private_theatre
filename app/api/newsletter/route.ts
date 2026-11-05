import { NextRequest, NextResponse } from 'next/server';
import { mockStore } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { contact } = await request.json();
    if (!contact) {
      return NextResponse.json({ success: false, error: 'Contact details required' }, { status: 400 });
    }

    mockStore.subscribers.push({
      id: Date.now(),
      contact,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
