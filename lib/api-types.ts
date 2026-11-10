/**
 * Shared TypeScript interfaces for API responses and requests
 * Used across all API routes for type safety
 */

// Base API Response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Booking related types
export interface BookingRequest {
  branch_id: number;
  theatre_id: number;
  slot_id: number;
  booking_date: string; // YYYY-MM-DD
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  screen_name?: string;
  guests: number;
  occasion_id?: number;
  addons?: Array<{ addon_id: number; quantity: number }>;
  coupon_code?: string;
  discount?: number;
  payment_mode?: 'advance_later' | 'razorpay';
  notes?: string;
  idempotency_key?: string;
}

export interface BookingResponse {
  booking_ref: string;
  total: number;
  advance_paid: number;
  balance: number;
  status: string;
  booking: Booking;
  whatsapp_confirmation?: {
    message: string;
    url: string;
  };
  idempotent?: boolean;
}

export interface Booking {
  id: number;
  booking_ref: string;
  branch_id: number;
  theatre_id: number;
  slot_id: number;
  booking_date: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  screen_name: string;
  guests: number;
  occasion_id: number;
  subtotal: number;
  addons_total: number;
  discount: number;
  total: number;
  advance_paid: number;
  balance: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  payment_status: 'unpaid' | 'advance_paid' | 'fully_paid' | 'refunded';
  source: 'web' | 'phone' | 'walk_in';
  notes: string;
  cancelled_reason: string;
  refund_amount: number;
  is_deleted: number;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  addons?: BookingAddon[];
  idempotency_key?: string | null;
}

export interface BookingAddon {
  id: number;
  booking_id: number;
  addon_id: number;
  addon_name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

// Coupon types
export interface CouponValidateRequest {
  code: string;
  amount?: number;
}

export interface CouponValidateResponse {
  code: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  discount_amount: number;
  coupon_id: number;
  usage_remaining: number;
}

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  min_booking_amount: number;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number;
  used_count: number;
  branch_id: number | null;
  is_active: number;
  created_at: string;
}

// OTP types
export interface OtpSendRequest {
  phone: string;
}

export interface OtpSendResponse {
  success: boolean;
  message: string;
  devCode?: string;
}

export interface OtpVerifyRequest {
  phone: string;
  code: string;
}

export interface OtpVerifyResponse {
  success: boolean;
  token?: string;
  customer?: CustomerPayload;
  error?: string;
}

// Enquiry types
export interface EnquiryRequest {
  name: string;
  phone: string;
  email?: string;
  branch_name?: string;
  preferred_date?: string | null;
  guests?: number | null;
  message: string;
}

export interface Enquiry {
  id: number;
  name: string;
  phone: string;
  email: string;
  branch_name: string;
  preferred_date: string | null;
  guests: number | null;
  message: string;
  status: 'new' | 'contacted' | 'closed';
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Newsletter types
export interface NewsletterRequest {
  contact: string;
}

export interface Subscriber {
  id: number;
  contact: string;
  created_at: string;
}

// Admin types
export interface AdminPayload {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'branch_manager' | 'staff';
  branch_id?: number | null;
}

export interface CustomerPayload {
  id: number;
  phone: string;
  name: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  id: number;
  name: string;
  email: string;
  role: string;
  branch_id: number | null;
}

export interface ChangePasswordRequest {
  current_password?: string;
  new_password: string;
  target_user_id?: number;
}

// Branch types
export interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  map_url: string;
  image_url: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Theatre types
export interface Theatre {
  id: number;
  branch_id: number;
  name: string;
  slug: string;
  emoji: string;
  capacity: number;
  base_price: number;
  extra_person_price: number;
  amenities: string;
  image_url: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Time Slot types
export interface TimeSlot {
  id: number;
  theatre_id: number;
  start_time: string;
  end_time: string;
  crosses_midnight: number;
  price_override: number | null;
  weekend_price: number | null;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Occasion types
export interface Occasion {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  image_url: string;
  is_active: number;
  sort_order: number;
}

// Addon types
export interface Addon {
  id: number;
  category: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Customer types
export interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  total_bookings: number;
  lifetime_spend: number;
  is_blocked: number;
  created_at: string;
  updated_at: string;
}

// Availability types
export interface AvailabilityRequest {
  theatre?: string;
  theatre_id?: string;
  branch?: string;
  branch_id?: string;
  date?: string;
}

export interface AvailabilitySlot {
  id: number;
  theatre_id: number;
  start_time: string;
  end_time: string;
  crosses_midnight: number;
  price_override: number | null;
  weekend_price: number | null;
  is_active: number;
  sort_order: number;
  time: string;
  theatre_name: string;
  theatre_emoji: string;
  theatre_capacity: number;
  branch_id: number;
  is_booked: boolean;
}

export interface AvailabilityResponse {
  success: boolean;
  date: string;
  branch_id: number | null;
  theatre_id: number | null;
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  data: AvailabilitySlot[];
}

// Admin Stats types
export interface AdminStats {
  metrics: {
    today_revenue: number;
    today_advance: number;
    yesterday_revenue: number;
    yesterday_advance: number;
    this_month_revenue: number;
    this_month_advance: number;
    last_month_revenue: number;
    last_month_advance: number;
    total_revenue: number;
    advance_collected: number;
    balance_pending: number;
    cancelled_lost_revenue: number;
    total_refunded: number;
    total_bookings: number;
    cancelled_bookings: number;
    cancellation_rate_pct: number;
    collection_rate_pct: number;
    todays_bookings: number;
  };
  daily_timeline: Array<{
    date: string;
    display_date: string;
    revenue: number;
    advance: number;
    count: number;
  }>;
  monthly_timeline: Array<{
    month_key: string;
    display_month: string;
    revenue: number;
    advance: number;
    count: number;
  }>;
  cancelled_list: Array<{
    id: number;
    ref: string;
    customer_name: string;
    customer_phone: string;
    booking_date: string;
    branch_name: string;
    theatre_name: string;
    theatre_emoji: string;
    total: number;
    refund_amount: number;
    cancelled_reason: string;
    source: string;
  }>;
  channel_distribution: Array<{
    source_key: string;
    name: string;
    count: number;
    revenue: number;
    pct: string;
  }>;
  theatre_distribution: Array<{
    id: number;
    name: string;
    emoji: string;
    branch_id: number;
    count: number;
    revenue: number;
  }>;
  branch_distribution: Array<{
    id: number;
    name: string;
    count: number;
    revenue: number;
    today_count: number;
    today_revenue: number;
  }>;
  occasion_distribution: Array<{
    id: number;
    name: string;
    count: number;
  }>;
  today_schedule: Array<{
    id: number;
    booking_ref: string;
    customer_name: string;
    customer_phone: string;
    theatre_id: number;
    theatre_name: string;
    theatre_emoji: string;
    branch_id: number;
    branch_name: string;
    slot_id: number;
    slot_time: string;
    guests: number;
    total: number;
    advance_paid: number;
    balance: number;
    status: string;
    payment_status: string;
    screen_name: string;
  }>;
}

// Error types
export interface ApiError {
  success: false;
  error: string;
  details?: any;
}