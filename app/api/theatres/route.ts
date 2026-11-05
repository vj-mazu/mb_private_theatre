import { NextRequest, NextResponse } from 'next/server';
import { query, mockStore } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchSlug = searchParams.get('branch');
    const branchIdParam = searchParams.get('branch_id');

    let branchId = branchIdParam ? Number(branchIdParam) : null;
    if (!branchId && branchSlug) {
      const found = mockStore.branches.find(b => b.slug === branchSlug);
      if (found) branchId = found.id;
    }

    let theatres = [];
    if (branchId) {
      theatres = await query('SELECT * FROM theatres WHERE branch_id = ? AND is_active = 1', [branchId]);
      if (!theatres || theatres.length === 0) {
        theatres = mockStore.theatres.filter(t => t.branch_id === branchId);
      }
    } else {
      theatres = await query('SELECT * FROM theatres WHERE is_active = 1');
      if (!theatres || theatres.length === 0) {
        theatres = mockStore.theatres;
      }
    }

    return NextResponse.json({ success: true, data: theatres });
  } catch (error) {
    return NextResponse.json({ success: true, data: mockStore.theatres });
  }
}
