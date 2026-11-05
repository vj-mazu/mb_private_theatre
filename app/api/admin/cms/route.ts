import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/auth';
import { mockStore, saveStore } from '@/lib/db';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      branches: mockStore.branches,
      theatres: mockStore.theatres,
      addons: mockStore.addons,
      coupons: mockStore.coupons,
      customers: mockStore.customers,
      enquiries: mockStore.enquiries,
      siteSettings: mockStore.siteSettings,
      auditLogs: mockStore.auditLogs,
    }
  });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    // 1. SAVE SITE SETTINGS
    if (action === 'save_settings' || body.siteSettings) {
      const settingsToSave = body.siteSettings || body;
      Object.assign(mockStore.siteSettings, settingsToSave);
      saveStore();

      mockStore.auditLogs.unshift({
        id: Date.now(),
        user_id: session.id,
        user_email: session.email,
        action: 'UPDATE_SITE_SETTINGS',
        entity: 'siteSettings',
        entity_id: 'global',
        details: settingsToSave,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Settings saved successfully', data: mockStore.siteSettings });
    }

    // 2. ADD NEW COUPON
    if (action === 'add_coupon') {
      const { code, discount_type, discount_value, min_booking_amount, is_active = 1 } = body;
      if (!code || !discount_value) {
        return NextResponse.json({ success: false, error: 'Coupon code and discount value required' }, { status: 400 });
      }

      const cleanCode = String(code).trim().toUpperCase();
      const existing = mockStore.coupons.find(c => c.code === cleanCode);
      if (existing) {
        return NextResponse.json({ success: false, error: 'A coupon with this code already exists' }, { status: 400 });
      }

      const newCoupon = {
        id: Date.now(),
        code: cleanCode,
        discount_type: discount_type === 'percentage' ? 'percentage' : 'flat',
        discount_value: Number(discount_value),
        min_booking_amount: Number(min_booking_amount || 0),
        is_active: Number(is_active)
      };

      mockStore.coupons.unshift(newCoupon);
      saveStore();

      mockStore.auditLogs.unshift({
        id: Date.now(),
        user_id: session.id,
        user_email: session.email,
        action: 'CREATE_COUPON',
        entity: 'coupons',
        entity_id: String(newCoupon.id),
        details: newCoupon,
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Coupon created successfully', data: newCoupon, coupons: mockStore.coupons });
    }

    // 3. EDIT EXISTING COUPON
    if (action === 'edit_coupon') {
      const { id, code, discount_type, discount_value, min_booking_amount, is_active } = body;
      const index = mockStore.coupons.findIndex(c => c.id === Number(id));
      if (index === -1) {
        return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
      }

      const cleanCode = String(code).trim().toUpperCase();
      mockStore.coupons[index] = {
        ...mockStore.coupons[index],
        code: cleanCode,
        discount_type: discount_type === 'percentage' ? 'percentage' : 'flat',
        discount_value: Number(discount_value),
        min_booking_amount: Number(min_booking_amount || 0),
        is_active: Number(is_active ?? mockStore.coupons[index].is_active)
      };

      saveStore();

      mockStore.auditLogs.unshift({
        id: Date.now(),
        user_id: session.id,
        user_email: session.email,
        action: 'UPDATE_COUPON',
        entity: 'coupons',
        entity_id: String(id),
        details: mockStore.coupons[index],
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Coupon updated successfully', coupons: mockStore.coupons });
    }

    // 4. DELETE COUPON
    if (action === 'delete_coupon') {
      const { id } = body;
      const beforeCount = mockStore.coupons.length;
      mockStore.coupons = mockStore.coupons.filter(c => c.id !== Number(id));
      
      if (mockStore.coupons.length === beforeCount) {
        return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
      }

      saveStore();

      mockStore.auditLogs.unshift({
        id: Date.now(),
        user_id: session.id,
        user_email: session.email,
        action: 'DELETE_COUPON',
        entity: 'coupons',
        entity_id: String(id),
        created_at: new Date().toISOString()
      });

      return NextResponse.json({ success: true, message: 'Coupon deleted successfully', coupons: mockStore.coupons });
    }

    // 5. TOGGLE COUPON STATUS
    if (action === 'toggle_coupon') {
      const { id } = body;
      const coupon = mockStore.coupons.find(c => c.id === Number(id));
      if (!coupon) {
        return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
      }

      coupon.is_active = coupon.is_active === 1 ? 0 : 1;
      saveStore();

      return NextResponse.json({ success: true, message: `Coupon is now ${coupon.is_active ? 'Active' : 'Inactive'}`, coupons: mockStore.coupons });
    }

    // 6. EDIT THEATRE PRICING
    if (action === 'edit_theatre') {
      const { id, base_price, extra_person_price, amenities } = body;
      const th = mockStore.theatres.find(t => t.id === Number(id));
      if (!th) {
        return NextResponse.json({ success: false, error: 'Theatre not found' }, { status: 404 });
      }

      if (base_price !== undefined) th.base_price = Number(base_price);
      if (extra_person_price !== undefined) th.extra_person_price = Number(extra_person_price);
      if (amenities !== undefined) th.amenities = amenities;

      saveStore();
      return NextResponse.json({ success: true, message: 'Theatre updated successfully', theatres: mockStore.theatres });
    }

    // 7. EDIT ADDON PRICING
    if (action === 'edit_addon') {
      const { id, price, is_active } = body;
      const addon = mockStore.addons.find(a => a.id === Number(id));
      if (!addon) {
        return NextResponse.json({ success: false, error: 'Add-on not found' }, { status: 404 });
      }

      if (price !== undefined) addon.price = Number(price);
      if (is_active !== undefined) addon.is_active = Number(is_active);

      saveStore();
      return NextResponse.json({ success: true, message: 'Addon updated successfully', addons: mockStore.addons });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
