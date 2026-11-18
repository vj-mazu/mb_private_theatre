const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.SQLITE_DB_PATH || path.join(DATA_DIR, 'movie_bash.db');
console.log(`[SQLite Init] Opening database at: ${DB_PATH}`);

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 5000');

// Create tables
const schema = `
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

CREATE UNIQUE INDEX IF NOT EXISTS uk_theatre_date_slot_active 
  ON bookings (theatre_id, booking_date, slot_id) 
  WHERE is_deleted = 0 AND status != 'cancelled';

CREATE INDEX IF NOT EXISTS idx_bookings_branch_date ON bookings (branch_id, booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings (customer_phone);
CREATE INDEX IF NOT EXISTS idx_bookings_ref ON bookings (booking_ref);

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

CREATE TABLE IF NOT EXISTS faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE TABLE IF NOT EXISTS site_settings (
  key_name TEXT PRIMARY KEY,
  value_content TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

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

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  phone TEXT,
  channel TEXT NOT NULL DEFAULT 'both',
  created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
`;

db.exec(schema);
console.log('[SQLite Init] ✅ Schema tables & indexes created.');

// Seed tables if empty using store.json
const storePath = path.join(DATA_DIR, 'store.json');
if (fs.existsSync(storePath)) {
  const store = JSON.parse(fs.readFileSync(storePath, 'utf8'));

  // 1. Branches
  const branchCount = db.prepare('SELECT COUNT(*) as count FROM branches').get().count;
  if (branchCount === 0 && store.branches) {
    const insertBranch = db.prepare(`
      INSERT INTO branches (id, name, slug, address, phone, map_url, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((branches) => {
      for (const b of branches) {
        insertBranch.run(b.id, b.name, b.slug, b.address, b.phone, b.map_url || '', b.image_url || '', b.is_active ?? 1);
      }
    });
    insertMany(store.branches);
    console.log(`[SQLite Init] ✅ Seeded ${store.branches.length} branches.`);
  }

  // 2. Theatres
  const theatreCount = db.prepare('SELECT COUNT(*) as count FROM theatres').get().count;
  if (theatreCount === 0 && store.theatres) {
    const insertTheatre = db.prepare(`
      INSERT INTO theatres (id, branch_id, name, slug, emoji, capacity, base_price, extra_person_price, amenities, image_url, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((theatres) => {
      for (const t of theatres) {
        insertTheatre.run(
          t.id,
          t.branch_id,
          t.name,
          t.slug,
          t.emoji || '🎬',
          t.capacity || 6,
          t.base_price || 899,
          t.extra_person_price || 150,
          t.amenities || '',
          t.image_url || '',
          t.is_active ?? 1
        );
      }
    });
    insertMany(store.theatres);
    console.log(`[SQLite Init] ✅ Seeded ${store.theatres.length} theatres.`);
  }

  // 3. Time Slots
  const slotCount = db.prepare('SELECT COUNT(*) as count FROM time_slots').get().count;
  if (slotCount === 0 && store.timeSlots) {
    const insertSlot = db.prepare(`
      INSERT INTO time_slots (id, theatre_id, start_time, end_time, crosses_midnight, price_override, weekend_price, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((slots) => {
      for (const s of slots) {
        insertSlot.run(
          s.id,
          s.theatre_id,
          s.start_time,
          s.end_time,
          s.crosses_midnight ?? 0,
          s.price_override ?? null,
          s.weekend_price ?? null,
          s.is_active ?? 1,
          s.sort_order ?? 0
        );
      }
    });
    insertMany(store.timeSlots);
    console.log(`[SQLite Init] ✅ Seeded ${store.timeSlots.length} time slots.`);
  }

  // 4. Occasions
  const occasionCount = db.prepare('SELECT COUNT(*) as count FROM occasions').get().count;
  if (occasionCount === 0 && store.occasions) {
    const insertOccasion = db.prepare(`
      INSERT INTO occasions (id, name, slug, icon, description, image_url, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((occasions) => {
      for (const o of occasions) {
        insertOccasion.run(
          o.id,
          o.name,
          o.slug,
          o.icon || 'Heart',
          o.description || '',
          o.image_url || '',
          o.is_active ?? 1,
          o.sort_order ?? 0
        );
      }
    });
    insertMany(store.occasions);
    console.log(`[SQLite Init] ✅ Seeded ${store.occasions.length} occasions.`);
  }

  // 5. Addons
  const addonCount = db.prepare('SELECT COUNT(*) as count FROM addons').get().count;
  if (addonCount === 0 && store.addons) {
    const insertAddon = db.prepare(`
      INSERT INTO addons (id, category, name, description, price, image_url, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((addons) => {
      for (const a of addons) {
        insertAddon.run(
          a.id,
          a.category || 'general',
          a.name,
          a.description || '',
          a.price || 0,
          a.image_url || '',
          a.is_active ?? 1,
          a.sort_order ?? 0
        );
      }
    });
    insertMany(store.addons);
    console.log(`[SQLite Init] ✅ Seeded ${store.addons.length} addons.`);
  }

  // 6. Coupons
  const couponCount = db.prepare('SELECT COUNT(*) as count FROM coupons').get().count;
  if (couponCount === 0 && store.coupons) {
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (id, code, discount_type, discount_value, min_booking_amount, valid_from, valid_until, usage_limit, used_count, branch_id, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((coupons) => {
      for (const c of coupons) {
        insertCoupon.run(
          c.id,
          c.code,
          c.discount_type || 'flat',
          c.discount_value || 0,
          c.min_booking_amount || 0,
          c.valid_from || null,
          c.valid_until || null,
          c.usage_limit || 100,
          c.used_count || 0,
          c.branch_id || null,
          c.is_active ?? 1
        );
      }
    });
    insertMany(store.coupons);
    console.log(`[SQLite Init] ✅ Seeded ${store.coupons.length} coupons.`);
  }

  // 7. Site Settings
  if (store.siteSettings) {
    const insertSetting = db.prepare(`
      INSERT OR REPLACE INTO site_settings (key_name, value_content) VALUES (?, ?)
    `);
    const insertMany = db.transaction((settings) => {
      for (const [key, val] of Object.entries(settings)) {
        insertSetting.run(key, typeof val === 'string' ? val : JSON.stringify(val));
      }
    });
    insertMany(store.siteSettings);
    console.log(`[SQLite Init] ✅ Seeded site settings.`);
  }

  // 8. Admin Users
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get().count;
  if (adminCount === 0) {
    const bcrypt = require('bcryptjs');
    const defaultHash = bcrypt.hashSync('Admin@MovieBash2026!', 10);
    db.prepare(`
      INSERT INTO admin_users (name, email, password_hash, role, is_active)
      VALUES (?, ?, ?, ?, 1)
    `).run('Super Admin', 'admin@moviebash.in', defaultHash, 'super_admin');
    console.log(`[SQLite Init] ✅ Seeded default super admin user.`);
  }

  // 9. Bookings (if any existing in store.json)
  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  if (bookingCount === 0 && store.bookings && store.bookings.length > 0) {
    const insertBooking = db.prepare(`
      INSERT OR IGNORE INTO bookings (
        id, booking_ref, branch_id, theatre_id, slot_id, booking_date,
        customer_name, customer_phone, customer_email, screen_name,
        guests, occasion_id, package_type, cake_flavor, extra_hours, extra_guests,
        subtotal, addons_total, discount, total, advance_paid, balance,
        status, payment_status, source, notes, cancelled_reason, refund_amount,
        is_deleted, created_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?
      )
    `);
    const insertMany = db.transaction((bookings) => {
      for (const b of bookings) {
        insertBooking.run(
          b.id,
          b.booking_ref,
          b.branch_id,
          b.theatre_id,
          b.slot_id,
          b.booking_date,
          b.customer_name,
          b.customer_phone,
          b.customer_email || '',
          b.screen_name || '',
          b.guests || 2,
          b.occasion_id || 1,
          b.package_type || null,
          b.cake_flavor || null,
          b.extra_hours || 0,
          b.extra_guests || 0,
          b.subtotal || 0,
          b.addons_total || 0,
          b.discount || 0,
          b.total || 0,
          b.advance_paid || 0,
          b.balance || 0,
          b.status || 'confirmed',
          b.payment_status || 'unpaid',
          b.source || 'web',
          b.notes || '',
          b.cancelled_reason || '',
          b.refund_amount || 0,
          b.is_deleted || 0,
          b.created_at || new Date().toISOString()
        );
      }
    });
    insertMany(store.bookings);
    console.log(`[SQLite Init] ✅ Synced ${store.bookings.length} existing bookings.`);
  }

  // 10. Customers
  const customerCount = db.prepare('SELECT COUNT(*) as count FROM customers').get().count;
  if (customerCount === 0 && store.customers && store.customers.length > 0) {
    const insertCustomer = db.prepare(`
      INSERT OR IGNORE INTO customers (id, name, phone, email, total_bookings, lifetime_spend, is_blocked, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMany = db.transaction((customers) => {
      for (const c of customers) {
        insertCustomer.run(c.id, c.name, c.phone, c.email || '', c.total_bookings || 0, c.lifetime_spend || 0, c.is_blocked || 0, c.created_at || new Date().toISOString());
      }
    });
    insertMany(store.customers);
    console.log(`[SQLite Init] ✅ Synced ${store.customers.length} existing customers.`);
  }
}

console.log('[SQLite Init] Database ready and operational!');
db.close();
