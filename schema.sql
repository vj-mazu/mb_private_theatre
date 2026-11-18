-- Movie Bash Database Schema
-- SQLite 3 (WAL Mode & Foreign Keys Enabled)

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- 1. Branches
CREATE TABLE IF NOT EXISTS branches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  map_url TEXT,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 2. Theatres
CREATE TABLE IF NOT EXISTS theatres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  branch_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎬',
  capacity INTEGER NOT NULL DEFAULT 6,
  base_price REAL NOT NULL DEFAULT 899.00,
  extra_person_price REAL NOT NULL DEFAULT 150.00,
  amenities TEXT,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE
);

-- 3. Time Slots
CREATE TABLE IF NOT EXISTS time_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theatre_id INTEGER NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  crosses_midnight INTEGER NOT NULL DEFAULT 0,
  price_override REAL,
  weekend_price REAL,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (theatre_id) REFERENCES theatres(id) ON DELETE CASCADE
);

-- 4. Occasions
CREATE TABLE IF NOT EXISTS occasions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 5. Addons
CREATE TABLE IF NOT EXISTS addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL DEFAULT 'general',
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL DEFAULT 0.00,
  image_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  total_bookings INTEGER NOT NULL DEFAULT 0,
  lifetime_spend REAL NOT NULL DEFAULT 0.00,
  is_blocked INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 7. Bookings
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_ref TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  branch_id INTEGER NOT NULL,
  theatre_id INTEGER NOT NULL,
  slot_id INTEGER NOT NULL,
  booking_date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  screen_name TEXT,
  guests INTEGER NOT NULL DEFAULT 2,
  occasion_id INTEGER,
  package_type TEXT,
  cake_flavor TEXT,
  extra_hours INTEGER NOT NULL DEFAULT 0,
  extra_guests INTEGER NOT NULL DEFAULT 0,
  subtotal REAL NOT NULL DEFAULT 0.00,
  addons_total REAL NOT NULL DEFAULT 0.00,
  discount REAL NOT NULL DEFAULT 0.00,
  total REAL NOT NULL DEFAULT 0.00,
  advance_paid REAL NOT NULL DEFAULT 0.00,
  balance REAL NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'confirmed',
  payment_status TEXT NOT NULL DEFAULT 'unpaid',
  source TEXT NOT NULL DEFAULT 'web',
  notes TEXT,
  cancelled_reason TEXT,
  refund_amount REAL NOT NULL DEFAULT 0.00,
  is_deleted INTEGER NOT NULL DEFAULT 0,
  deleted_at TEXT,
  deleted_by TEXT,
  idempotency_key TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (branch_id) REFERENCES branches(id),
  FOREIGN KEY (theatre_id) REFERENCES theatres(id),
  FOREIGN KEY (slot_id) REFERENCES time_slots(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (occasion_id) REFERENCES occasions(id) ON DELETE SET NULL
);

-- Unique constraint ensuring no double bookings for active slots
CREATE UNIQUE INDEX IF NOT EXISTS uk_theatre_date_slot_active 
  ON bookings (theatre_id, booking_date, slot_id) 
  WHERE is_deleted = 0 AND status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_branch_date ON bookings (branch_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref);

-- 8. Booking Addons
CREATE TABLE IF NOT EXISTS booking_addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  addon_id INTEGER NOT NULL,
  addon_name TEXT NOT NULL,
  price REAL NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  subtotal REAL NOT NULL,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES addons(id)
);

-- 9. Coupons
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'flat',
  discount_value REAL NOT NULL DEFAULT 0.00,
  min_booking_amount REAL NOT NULL DEFAULT 0.00,
  valid_from TEXT,
  valid_until TEXT,
  usage_limit INTEGER NOT NULL DEFAULT 100,
  used_count INTEGER NOT NULL DEFAULT 0,
  branch_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 10. Enquiries (Contact Form Submissions)
CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  branch_name TEXT,
  preferred_date TEXT,
  guests INTEGER,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 11. Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_name TEXT NOT NULL,
  occasion TEXT,
  rating REAL NOT NULL DEFAULT 5.0,
  review_text TEXT NOT NULL,
  avatar_url TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 12. FAQs
CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 13. Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  key_name TEXT PRIMARY KEY,
  value_content TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 14. Admin Users & Roles
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  branch_id INTEGER,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  user_email TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- 16. Newsletter Subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  phone TEXT,
  channel TEXT NOT NULL DEFAULT 'both',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================================
-- HIGH-PERFORMANCE PRODUCTION INDEXES
-- ============================================================================
CREATE UNIQUE INDEX IF NOT EXISTS uk_theatre_date_slot_active ON bookings (theatre_id, booking_date, slot_id) WHERE is_deleted = 0 AND status != 'cancelled';
CREATE INDEX IF NOT EXISTS idx_bookings_branch_date ON bookings (branch_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings (status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_deleted_status ON bookings (is_deleted, status, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_theatre_date ON bookings (theatre_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_time_slots_theatre ON time_slots (theatre_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots (theatre_id, is_active);
CREATE INDEX IF NOT EXISTS idx_theatres_branch ON theatres (branch_id);
CREATE INDEX IF NOT EXISTS idx_theatres_active ON theatres (branch_id, is_active);
CREATE INDEX IF NOT EXISTS idx_booking_addons_booking ON booking_addons (booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_addons_addon ON booking_addons (addon_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (is_active, code);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users (role);
