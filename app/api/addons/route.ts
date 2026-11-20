import { NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET() {
  const headers = { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' };
  const activeFallback = mockStore.addons.filter((a: any) => a.is_active === 1);
  try {
    const addons = await query<any[]>('SELECT * FROM addons WHERE is_active = 1 ORDER BY sort_order ASC');
    const active = Array.isArray(addons) ? addons.filter((a: any) => a.is_active !== 0) : [];
    return NextResponse.json(
      { success: true, data: active.length ? active : activeFallback },
      { headers }
    );
  } catch (error) {
    return NextResponse.json({ success: true, data: activeFallback }, { headers });
  }
}