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
        theatres = mockStore.theatres.filter(t => t.branch_id === branchId && (t as any).is_active !== 0);
      }
    } else {
      theatres = await query('SELECT * FROM theatres WHERE is_active = 1');
      if (!theatres || theatres.length === 0) {
        theatres = mockStore.theatres.filter(t => (t as any).is_active !== 0);
      }
    }

    // Always enrich SQLite rows with dynamic package configs from mockStore
    const enriched = (theatres || []).map((t: any) => {
      const mem = mockStore.theatres.find(m => m.id === t.id);
      return {
        ...t,
        ...(mem || {}),
        base_price: mem?.base_price ?? t.base_price,
        standard_price: (mem as any)?.standard_price ?? (t as any).standard_price,
        custom_price: (mem as any)?.custom_price ?? (t as any).custom_price ?? t.base_price,
        premium_price: (mem as any)?.premium_price ?? (t as any).premium_price,
        extra_hour_rate: (mem as any)?.extra_hour_rate ?? (t as any).extra_hour_rate,
        extra_person_price: mem?.extra_person_price ?? t.extra_person_price,
        image_url: mem?.image_url ?? t.image_url,
        images: (mem as any)?.images ?? (t as any).images,
        video_url: (mem as any)?.video_url ?? (t as any).video_url,
        amenities: mem?.amenities ?? t.amenities
      };
    });

    const headers = { 'Cache-Control': 'no-cache, no-store, must-revalidate' };
    return NextResponse.json({ success: true, data: enriched }, { headers });
  } catch (error) {
    return NextResponse.json({ success: true, data: mockStore.theatres }, {
      headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
    });
  }
}
