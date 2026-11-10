import { NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET() {
  try {
    const occasions = await query('SELECT * FROM occasions WHERE is_active = 1 ORDER BY sort_order ASC');
    return NextResponse.json({ success: true, data: occasions.length ? occasions : mockStore.occasions });
  } catch (error) {
    return NextResponse.json({ success: true, data: mockStore.occasions });
  }
}