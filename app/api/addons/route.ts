import { NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET() {
  try {
    const addons = await query('SELECT * FROM addons WHERE is_active = 1 ORDER BY sort_order ASC');
    return NextResponse.json({ success: true, data: addons.length ? addons : mockStore.addons });
  } catch (error) {
    return NextResponse.json({ success: true, data: mockStore.addons });
  }
}