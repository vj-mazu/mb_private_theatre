import { NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET() {
  const headers = { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=600' };
  try {
    const branches = await query('SELECT * FROM branches WHERE is_active = 1 ORDER BY id ASC');
    return NextResponse.json(
      { success: true, data: branches.length ? branches : mockStore.branches },
      { headers }
    );
  } catch (error) {
    return NextResponse.json({ success: true, data: mockStore.branches }, { headers });
  }
}
