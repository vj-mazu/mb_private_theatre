export interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  map_url?: string;
  image_url?: string;
  is_active: number;
}

export interface Theatre {
  id: number;
  branch_id: number;
  branch_name?: string;
  name: string;
  slug: string;
  emoji: string;
  capacity: number;
  base_price: number;
  extra_person_price: number;
  amenities?: string;
  image_url?: string;
  is_active: number;
}

export interface TimeSlot {
  id: number;
  theatre_id: number;
  start_time: string;
  end_time: string;
  crosses_midnight: number;
  price_override?: number | null;
  weekend_price?: number | null;
  is_active: number;
  sort_order: number;
  is_booked?: boolean;
}

export interface Occasion {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  image_url?: string;
  is_active: number;
}

export interface Addon {
  id: number;
  category: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  is_active: number;
  quantity?: number;
}

export interface Booking {
  id: number;
  booking_ref: string;
  customer_id?: number;
  branch_id: number;
  branch_name?: string;
  theatre_id: number;
  theatre_name?: string;
  theatre_emoji?: string;
  slot_id: number;
  start_time?: string;
  end_time?: string;
  booking_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  screen_name?: string;
  guests: number;
  occasion_id?: number;
  occasion_name?: string;
  subtotal: number;
  addons_total: number;
  discount: number;
  total: number;
  advance_paid: number;
  balance: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'unpaid' | 'advance_paid' | 'fully_paid' | 'refunded';
  source: 'web' | 'phone' | 'walk_in';
  notes?: string;
  cancelled_reason?: string;
  refund_amount?: number;
  is_deleted: number;
  deleted_at?: string;
  deleted_by?: string;
  created_at: string;
  addons?: Array<{
    id: number;
    addon_id: number;
    addon_name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }>;
}

export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  total_bookings: number;
  lifetime_spend: number;
  is_blocked: number;
  created_at: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'branch_manager' | 'staff';
  branch_id?: number | null;
  is_active: number;
  created_at: string;
}

export interface SiteSettings {
  [key: string]: string;
}
