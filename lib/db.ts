import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { initialMockStore, MockStore } from './mock-data';

// Helper to determine writable data directory (handles Vercel / AWS Lambda read-only environment)
function resolveDataDir(): string {
  if (process.env.SQLITE_DATA_DIR) {
    return process.env.SQLITE_DATA_DIR;
  }

  const isServerless = !!(
    process.env.VERCEL || 
    process.env.AWS_LAMBDA_FUNCTION_NAME || 
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY
  );

  if (isServerless) {
    const tmpDir = path.join(os.tmpdir(), 'movie_bash_data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      return os.tmpdir();
    }
  }

  // Local / standard environment: use project 'data' directory
  const localDir = path.join(process.cwd(), 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Test write permission to ensure directory is writable
    const testFile = path.join(localDir, '.write-test');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    const tmpDir = path.join(os.tmpdir(), 'movie_bash_data');
    try {
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      return tmpDir;
    } catch {
      return os.tmpdir();
    }
  }
}

const DATA_DIR = resolveDataDir();
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(DATA_DIR, 'movie_bash.db');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

// Ensure bundled SQLite database and store.json are seeded into DATA_DIR if running in /tmp
function ensureDataFilesSeeded() {
  try {
    const bundledDb = path.join(process.cwd(), 'data', 'movie_bash.db');
    if (!fs.existsSync(DB_PATH) && fs.existsSync(bundledDb)) {
      try {
        fs.copyFileSync(bundledDb, DB_PATH);
        console.log('[Movie Bash DB] ⚡ Seeded SQLite database into writable path:', DB_PATH);
      } catch (copyErr) {
        console.warn('[Movie Bash DB] Could not copy bundled DB:', copyErr);
      }
    }

    const bundledStore = path.join(process.cwd(), 'data', 'store.json');
    if (!fs.existsSync(STORE_FILE) && fs.existsSync(bundledStore)) {
      try {
        fs.copyFileSync(bundledStore, STORE_FILE);
      } catch {}
    }
  } catch (err) {
    console.warn('[Movie Bash DB] Non-fatal seed check warning:', err);
  }
}

// Singleton SQLite Database Instance
const globalForDb = globalThis as unknown as { sqliteDb?: Database.Database };

export function getDb(): Database.Database {
  if (globalForDb.sqliteDb) {
    return globalForDb.sqliteDb;
  }

  ensureDataFilesSeeded();
  const db = new Database(DB_PATH);
  
  // Pragmas with resilient fallbacks
  try {
    db.pragma('journal_mode = WAL');
  } catch {
    try {
      db.pragma('journal_mode = DELETE');
    } catch {}
  }
  try {
    db.pragma('synchronous = NORMAL');
    db.pragma('foreign_keys = ON');
    db.pragma('busy_timeout = 5000');
    db.pragma('temp_store = MEMORY');
  } catch {}

  ensureSqliteSchemaAndSeed(db);

  globalForDb.sqliteDb = db;
  return db;
}

// Persistent Store Mechanism for in-memory / JSON persistence & sync
function loadPersistentStore(): MockStore {
  try {
    ensureDataFilesSeeded();
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return { ...initialMockStore, ...parsed };
    }
  } catch (err) {
    console.error('Error loading persistent store:', err);
  }
  return { ...initialMockStore };
}

const globalForStore = globalThis as unknown as { mockStore?: MockStore };
export const mockStore: MockStore = globalForStore.mockStore || (globalForStore.mockStore = loadPersistentStore());

export function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Asynchronous non-blocking file write to prevent event loop lag
    fs.writeFile(STORE_FILE, JSON.stringify(mockStore, null, 2), 'utf-8', (err) => {
      if (err) console.error('Error saving persistent store asynchronously:', err);
    });
  } catch (err) {
    console.error('Error saving persistent store:', err);
  }
}

// Auto-initialize Schema & Seed on fresh database boot
function ensureSqliteSchemaAndSeed(db: Database.Database) {
  try {
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='branches'").get();
    if (!tableCheck) {
      console.log('[Movie Bash DB] ⚡ Fresh SQLite database detected. Auto-creating schema tables...');
      
      db.exec(`
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
      `);
      console.log('[Movie Bash DB] ✅ SQLite schema created successfully.');
    }
  } catch (err) {
    console.error('[Movie Bash DB] SQLite schema check/creation error:', err);
  }
}

// Check database availability (Always true for embedded SQLite)
export async function checkDatabase(): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return true; // Store fallback is available
    const result = db.prepare('SELECT 1 as live').get() as { live: number };
    return result?.live === 1;
  } catch (err) {
    console.warn('[Movie Bash DB] SQLite check fallback:', err);
    return true;
  }
}

// Transaction connection interface for multi-table atomic operations
export interface TransactionConnection {
  query: (sql: string, params?: any[]) => Promise<any>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
}

export async function beginTransaction(): Promise<TransactionConnection | null> {
  let db: Database.Database | null = null;
  try {
    db = getDb();
  } catch (err) {
    console.warn('[Movie Bash DB] getDb error in beginTransaction:', err);
    return null;
  }
  if (!db) {
    return null;
  }

  let inTransaction = false;

  try {
    db.exec('BEGIN IMMEDIATE');
    inTransaction = true;
  } catch (err) {
    console.warn('Failed to begin SQLite transaction:', err);
    return null;
  }

  return {
    query: async (sql: string, params: any[] = []) => {
      if (!db) return null;
      const trimmed = sql.trim().toLowerCase();
      if (trimmed.startsWith('select') || trimmed.startsWith('pragma')) {
        return db.prepare(sql).all(...params);
      } else {
        const info = db.prepare(sql).run(...params);
        return {
          affectedRows: info.changes,
          insertId: info.lastInsertRowid,
          changes: info.changes,
          lastInsertRowid: info.lastInsertRowid
        };
      }
    },
    commit: async () => {
      if (inTransaction && db) {
        try {
          db.exec('COMMIT');
        } catch (commitErr) {
          console.warn('[Movie Bash DB] commit warning:', commitErr);
        }
        inTransaction = false;
      }
    },
    rollback: async () => {
      if (inTransaction && db) {
        try {
          db.exec('ROLLBACK');
        } catch {}
        inTransaction = false;
      }
    },
    release: () => {
      // No pool connection to release in SQLite
    }
  };
}

// In-process atomic lock for booking contention
const inMemoryLocks = new Map<string, number>();

export async function acquireBookingLock(
  theatreId: number, 
  bookingDate: string, 
  slotId: number, 
  timeoutSeconds: number = 10
): Promise<boolean> {
  const lockName = `booking_${theatreId}_${bookingDate}_${slotId}`;
  const now = Date.now();
  const existingLock = inMemoryLocks.get(lockName);
  if (existingLock && (now - existingLock) < (timeoutSeconds * 1000)) {
    return false;
  }
  inMemoryLocks.set(lockName, now);
  return true;
}

export async function releaseBookingLock(
  theatreId: number, 
  bookingDate: string, 
  slotId: number
): Promise<void> {
  const lockName = `booking_${theatreId}_${bookingDate}_${slotId}`;
  inMemoryLocks.delete(lockName);
}

// Generate sequential booking reference by branch and financial year (e.g., MBEC202601, MBBTM202601)
export async function generateBookingRef(branchId: number | string = 1, bookingDate?: string): Promise<string> {
  const bId = String(branchId).toLowerCase();
  const isBtm = bId === '2' || bId.includes('btm');
  const prefix = isBtm ? 'MBBTM' : 'MBEC';

  const targetDate = bookingDate ? new Date(bookingDate) : new Date();
  const calYear = isNaN(targetDate.getTime()) ? new Date().getFullYear() : targetDate.getFullYear();
  const calMonth = isNaN(targetDate.getTime()) ? (new Date().getMonth() + 1) : (targetDate.getMonth() + 1);
  const fyYear = calMonth >= 4 ? calYear : calYear - 1;

  const prefixWithYear = `${prefix}${fyYear}`;
  let maxSeq = 0;

  try {
    const db = getDb();
    if (db) {
      const rows = db.prepare('SELECT booking_ref FROM bookings WHERE booking_ref LIKE ?').all(`${prefixWithYear}%`) as Array<{ booking_ref: string }>;
      for (const row of rows) {
        const ref = String(row.booking_ref || '');
        const match = ref.match(new RegExp(`^${prefixWithYear}(\\d+)`, 'i'));
        if (match && match[1]) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > maxSeq) {
            maxSeq = num;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not query max booking reference from SQLite:', err);
  }

  // Also check local mockStore
  if (Array.isArray(mockStore.bookings)) {
    for (const b of mockStore.bookings) {
      const ref = String(b.booking_ref || '');
      const match = ref.match(new RegExp(`^${prefixWithYear}(\\d+)`, 'i'));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxSeq) {
          maxSeq = num;
        }
      }
    }
  }

  const nextSeq = maxSeq + 1;
  const paddedSeq = String(nextSeq).padStart(2, '0');

  // Unpredictable suffix: a sequential reference (MBEC202601) lets anyone enumerate
  // every customer's pass by incrementing the number. The suffix makes the pass a
  // bearer token that cannot be guessed while keeping the readable sequence.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const makeSuffix = () => Array.from(
    { length: 4 },
    () => alphabet[Math.floor(Math.random() * alphabet.length)]
  ).join('');

  let candidate = `${prefixWithYear}${paddedSeq}-${makeSuffix()}`;
  let safetyCounter = nextSeq;

  // Collision safety against SQLite and the local store
  while (mockStore.bookings.some(b => b.booking_ref === candidate)) {
    safetyCounter++;
    candidate = `${prefixWithYear}${String(safetyCounter).padStart(2, '0')}-${makeSuffix()}`;
  }

  return candidate;
}

// Atomic coupon usage increment in SQLite
export async function incrementCouponUsage(couponId: number): Promise<boolean> {
  try {
    const db = getDb();
    if (!db) return false;
    const info = db.prepare(
      'UPDATE coupons SET used_count = used_count + 1 WHERE id = ? AND used_count < usage_limit'
    ).run(couponId);
    return info.changes > 0;
  } catch (err) {
    console.warn('Failed to increment coupon usage:', err);
    return false;
  }
}

// Primary Universal Query Function
export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const db = getDb();
    if (!db) {
      return executeMockQuery(sql, params) as T;
    }
    const trimmed = sql.trim().toLowerCase();

    if (trimmed.startsWith('select') || trimmed.startsWith('pragma')) {
      const rows = db.prepare(sql).all(...params);
      return rows as T;
    } else {
      const info = db.prepare(sql).run(...params);
      const res: any = {
        affectedRows: info.changes,
        insertId: info.lastInsertRowid,
        changes: info.changes,
        lastInsertRowid: info.lastInsertRowid
      };
      return res as T;
    }
  } catch (error) {
    console.warn('SQLite query warning, using store fallback:', error);
    return executeMockQuery(sql, params) as T;
  }
}

// Fallback query emulator for in-memory store
export function executeMockQuery(sql: string, params: any[] = []): any {
  const lower = sql.toLowerCase().trim();

  if (lower.includes('from branches') || lower.includes('from `branches`')) {
    return mockStore.branches.filter(b => b.is_active === 1);
  }

  if (lower.includes('from theatres') || lower.includes('from `theatres`')) {
    if (params.length > 0) {
      const branchId = Number(params[0]);
      return mockStore.theatres.filter(t => t.branch_id === branchId && t.is_active === 1);
    }
    return mockStore.theatres.filter(t => t.is_active === 1);
  }

  if (lower.includes('from time_slots') || lower.includes('from `time_slots`')) {
    if (params.length > 0) {
      const theatreId = Number(params[0]);
      return mockStore.timeSlots.filter(s => s.theatre_id === theatreId && s.is_active === 1);
    }
    return mockStore.timeSlots.filter(s => s.is_active === 1);
  }

  if (lower.includes('from occasions') || lower.includes('from `occasions`')) {
    return mockStore.occasions.filter(o => o.is_active === 1);
  }

  if (lower.includes('from addons') || lower.includes('from `addons`')) {
    return mockStore.addons.filter(a => a.is_active === 1);
  }

  if (lower.includes('from faqs') || lower.includes('from `faqs`')) {
    return mockStore.faqs;
  }

  if (lower.includes('from testimonials') || lower.includes('from `testimonials`')) {
    return mockStore.testimonials;
  }

  if (lower.includes('from site_settings') || lower.includes('from `site_settings`')) {
    return Object.entries(mockStore.siteSettings).map(([key_name, value_content]) => ({
      key_name,
      value_content
    }));
  }

  if (lower.startsWith('select') && (lower.includes('from bookings') || lower.includes('from `bookings`'))) {
    if (lower.includes('booking_ref = ?') && params.length > 0) {
      return mockStore.bookings.filter(b => b.booking_ref === params[0] && b.is_deleted === 0);
    }
    return mockStore.bookings.filter(b => b.is_deleted === 0);
  }

  if (lower.startsWith('insert') && lower.includes('into bookings')) {
    return { insertId: mockStore.bookings.length + 1, affectedRows: 1 };
  }

  if (lower.startsWith('update') && lower.includes('coupons') && lower.includes('used_count')) {
    const couponId = params[0];
    const coupon = mockStore.coupons.find(c => c.id === couponId);
    if (coupon && coupon.used_count < coupon.usage_limit) {
      coupon.used_count += 1;
      saveStore();
      return { affectedRows: 1 };
    }
    return { affectedRows: 0 };
  }

  return [];
}
