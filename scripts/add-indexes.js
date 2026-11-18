const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'movie_bash.db');
const db = new Database(dbPath);

// Enable high-performance PRAGMAs
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');
db.pragma('cache_size = -64000');
db.pragma('temp_store = MEMORY');
db.pragma('mmap_size = 268435456');

const indexes = [
  'CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings (booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_status_date ON bookings (status, booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_deleted_status ON bookings (is_deleted, status, booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_branch_date ON bookings (branch_id, booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_theatre_date ON bookings (theatre_id, booking_date)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (customer_phone)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC)',
  'CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref)',
  'CREATE UNIQUE INDEX IF NOT EXISTS uk_theatre_date_slot_active ON bookings (theatre_id, booking_date, slot_id) WHERE is_deleted = 0 AND status != "cancelled"',
  'CREATE INDEX IF NOT EXISTS idx_time_slots_theatre ON time_slots (theatre_id)',
  'CREATE INDEX IF NOT EXISTS idx_time_slots_active ON time_slots (theatre_id, is_active)',
  'CREATE INDEX IF NOT EXISTS idx_theatres_branch ON theatres (branch_id)',
  'CREATE INDEX IF NOT EXISTS idx_theatres_active ON theatres (branch_id, is_active)',
  'CREATE INDEX IF NOT EXISTS idx_booking_addons_booking ON booking_addons (booking_id)',
  'CREATE INDEX IF NOT EXISTS idx_booking_addons_addon ON booking_addons (addon_id)',
  'CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers (phone)',
  'CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons (code)',
  'CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons (is_active, code)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)',
  'CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)'
];

indexes.forEach(sql => {
  try {
    db.exec(sql);
  } catch (err) {
    console.warn('Index error:', err.message);
  }
});

// Run ANALYZE to update statistics for SQLite query planner
db.exec('ANALYZE;');

const list = db.prepare("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'").all();
console.log('Total custom performance indexes in SQLite database:', list.length);
list.forEach(i => console.log(`  * ${i.name} on ${i.tbl_name}`));
