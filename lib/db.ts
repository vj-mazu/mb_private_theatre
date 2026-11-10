import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { initialMockStore, MockStore } from './mock-data';

let pool: mysql.Pool | null = null;
let isMySQLAvailable: boolean | null = null;

export function getPool(): mysql.Pool | null {
  if (pool) return pool;

  try {
    // 1. If DATABASE_URL is provided (e.g. Render, Railway, PlanetScale, Aiven)
    if (process.env.DATABASE_URL) {
      pool = mysql.createPool({
        uri: process.env.DATABASE_URL,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        timezone: '+05:30',
        dateStrings: true,
        multipleStatements: true,
        ssl: process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('sslmode=') 
          ? { rejectUnauthorized: false } 
          : undefined
      });
      return pool;
    }

    // 2. Standard individual environment variables
    pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'movie_bash',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      timezone: '+05:30',
      dateStrings: true,
      multipleStatements: true,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined
    });
    return pool;
  } catch (err) {
    console.warn('MySQL pool initialization failed, using in-memory store:', err);
    return null;
  }
}

// Persistent Store Mechanism (saves to data/store.json so data persists across restarts)
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

function loadPersistentStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
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
    fs.writeFileSync(STORE_FILE, JSON.stringify(mockStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving persistent store:', err);
  }
}

// Check if MySQL is actually responding
let hasAutoInitialized = false;

async function ensureDatabaseSchemaAndSeed(p: mysql.Pool) {
  if (hasAutoInitialized) return;
  hasAutoInitialized = true;

  try {
    const conn = await p.getConnection();
    try {
      // 1. Check if the branches table exists
      const [tables]: any = await conn.query("SHOW TABLES LIKE 'branches'");
      const tableExists = Array.isArray(tables) && tables.length > 0;

      if (!tableExists) {
        console.log('[Movie Bash DB] ⚡ Fresh database detected. Auto-creating schema tables...');
        
        const schemaPath = path.join(process.cwd(), 'schema.sql');
        const seedPath = path.join(process.cwd(), 'seed.sql');

        if (fs.existsSync(schemaPath)) {
          let schemaSql = fs.readFileSync(schemaPath, 'utf8')
            .replace(/CREATE DATABASE[^\n;]+;/gi, '')
            .replace(/USE\s+[`\w]+;/gi, '');
          await conn.query(schemaSql);
          console.log('[Movie Bash DB] ✅ Schema tables successfully created.');
        }

        if (fs.existsSync(seedPath)) {
          let seedSql = fs.readFileSync(seedPath, 'utf8')
            .replace(/CREATE DATABASE[^\n;]+;/gi, '')
            .replace(/USE\s+[`\w]+;/gi, '');
          await conn.query(seedSql);
          console.log('[Movie Bash DB] ✅ Venue metadata, slots, occasions & add-ons seeded successfully.');
        }

        console.log('[Movie Bash DB] 🚀 Fresh database ready for live bookings (0 fake bookings, 0 dummy customers)!');
      } else {
        // Tables exist. Check if metadata exists (e.g. branches count > 0)
        const [rows]: any = await conn.query('SELECT COUNT(*) as count FROM `branches`');
        const count = rows[0]?.count || 0;
        if (count === 0) {
          console.log('[Movie Bash DB] ⚡ Empty tables detected. Seeding venue metadata...');
          const seedPath = path.join(process.cwd(), 'seed.sql');
          if (fs.existsSync(seedPath)) {
            let seedSql = fs.readFileSync(seedPath, 'utf8')
              .replace(/CREATE DATABASE[^\n;]+;/gi, '')
              .replace(/USE\s+[`\w]+;/gi, '');
            await conn.query(seedSql);
            console.log('[Movie Bash DB] ✅ Seeded initial venues into existing schema.');
          }
        }
      }
    } finally {
      conn.release();
    }
  } catch (initErr) {
    console.warn('[Movie Bash DB] Auto-initialization notice:', initErr);
  }
}

export async function checkMySQL(): Promise<boolean> {
  if (isMySQLAvailable !== null) return isMySQLAvailable;
  const p = getPool();
  if (!p) {
    isMySQLAvailable = false;
    return false;
  }
  try {
    const conn = await p.getConnection();
    await conn.ping();
    conn.release();
    isMySQLAvailable = true;
    
    // Auto-initialize schema & venue metadata on fresh database boot
    ensureDatabaseSchemaAndSeed(p).catch(err => {
      console.warn('[Movie Bash DB] Background auto-init warning:', err);
    });

    return true;
  } catch (err) {
    isMySQLAvailable = false;
    return false;
  }
}

// Transaction support
export interface TransactionConnection {
  query: (sql: string, params?: any[]) => Promise<any>;
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
  release: () => void;
}

export async function beginTransaction(): Promise<TransactionConnection | null> {
  const isAvailable = await checkMySQL();
  if (!isAvailable || !pool) return null;
  
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  
  return {
    query: async (sql: string, params: any[] = []) => {
      const [rows] = await conn.query(sql, params);
      return rows;
    },
    commit: async () => {
      await conn.commit();
    },
    rollback: async () => {
      await conn.rollback();
    },
    release: () => {
      conn.release();
    }
  };
}

// Advisory lock for distributed double-booking prevention (MySQL advisory lock with in-memory mutex fallback)
const inMemoryLocks = new Map<string, number>();

export async function acquireBookingLock(
  theatreId: number, 
  bookingDate: string, 
  slotId: number, 
  timeoutSeconds: number = 10
): Promise<boolean> {
  const lockName = `booking_${theatreId}_${bookingDate}_${slotId}`;
  const isAvailable = await checkMySQL();
  
  if (isAvailable && pool) {
    try {
      const [rows] = await pool.query('SELECT GET_LOCK(?, ?) as result', [lockName, timeoutSeconds]);
      const result = (rows as any[])[0]?.result;
      return result === 1;
    } catch (err) {
      console.error('Failed to acquire MySQL booking lock, falling back to in-memory lock:', err);
    }
  }

  // Robust in-memory mutex lock
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

  const isAvailable = await checkMySQL();
  if (isAvailable && pool) {
    try {
      await pool.query('SELECT RELEASE_LOCK(?)', [lockName]);
    } catch (err) {
      console.error('Failed to release MySQL booking lock:', err);
    }
  }
}

// Generate clean, short, human-readable booking reference by branch and financial year
// Electronic City: MBEC202601, MBEC202602...
// BTM 2nd Stage:   MBBTM202601, MBBTM202602...
// Financial Year Rollover: Automatically rolls over every year after March 31 (e.g. April 1, 2027 becomes 2027).
export async function generateBookingRef(branchId: number | string = 1, bookingDate?: string): Promise<string> {
  const bId = String(branchId).toLowerCase();
  const isBtm = bId === '2' || bId.includes('btm');
  const prefix = isBtm ? 'MBBTM' : 'MBEC';

  // Indian Financial Year: April 1 to March 31
  // If month >= 4 (April-Dec), FY = calYear (e.g. Nov 2026 -> 2026).
  // If month <= 3 (Jan-March 31), FY = calYear - 1 (e.g. Feb 2027 -> 2026).
  // After March 31 (i.e. from April 1, 2027 onwards), FY rolls over to 2027!
  const targetDate = bookingDate ? new Date(bookingDate) : new Date();
  const calYear = isNaN(targetDate.getTime()) ? new Date().getFullYear() : targetDate.getFullYear();
  const calMonth = isNaN(targetDate.getTime()) ? (new Date().getMonth() + 1) : (targetDate.getMonth() + 1);
  const fyYear = calMonth >= 4 ? calYear : calYear - 1;

  const prefixWithYear = `${prefix}${fyYear}`;
  let maxSeq = 0;

  // 1. Check MySQL if available
  if (pool) {
    try {
      const [rows]: any = await pool.query(
        'SELECT `booking_ref` FROM `bookings` WHERE `booking_ref` LIKE ?',
        [`${prefixWithYear}%`]
      );
      if (Array.isArray(rows)) {
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
      console.warn('Could not query max booking reference from MySQL:', err);
    }
  }

  // 2. Also check mockStore / local persistent store
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
  let candidate = `${prefixWithYear}${paddedSeq}`;

  // Collision safety against active local store
  let safetyCounter = nextSeq;
  while (mockStore.bookings.some(b => b.booking_ref === candidate)) {
    safetyCounter++;
    candidate = `${prefixWithYear}${String(safetyCounter).padStart(2, '0')}`;
  }

  return candidate;
}

// Atomic coupon usage increment
export async function incrementCouponUsage(couponId: number): Promise<boolean> {
  const isAvailable = await checkMySQL();
  if (!isAvailable || !pool) return false;
  
  try {
    const [result] = await pool.query(
      'UPDATE `coupons` SET `used_count` = `used_count` + 1 WHERE `id` = ? AND `used_count` < `usage_limit`',
      [couponId]
    );
    return (result as any).affectedRows > 0;
  } catch (err) {
    console.error('Failed to increment coupon usage:', err);
    return false;
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const isAvailable = await checkMySQL();
  if (isAvailable && pool) {
    try {
      const [rows] = await pool.query(sql, params);
      return rows as T;
    } catch (error) {
      console.error('MySQL query error, using mock fallback:', error);
    }
  }

  // Fallback query emulator for standard SELECT / INSERT / UPDATE / DELETE
  return executeMockQuery(sql, params) as T;
}

export function executeMockQuery(sql: string, params: any[] = []): any {
  const lower = sql.toLowerCase().trim();

  // Handle Branches
  if (lower.includes('from branches') || lower.includes('from `branches`')) {
    return mockStore.branches.filter(b => b.is_active === 1);
  }

  // Handle Theatres
  if (lower.includes('from theatres') || lower.includes('from `theatres`')) {
    if (params.length > 0) {
      const branchId = Number(params[0]);
      return mockStore.theatres.filter(t => t.branch_id === branchId && t.is_active === 1);
    }
    return mockStore.theatres.filter(t => t.is_active === 1);
  }

  // Handle Time Slots
  if (lower.includes('from time_slots') || lower.includes('from `time_slots`')) {
    if (params.length > 0) {
      const theatreId = Number(params[0]);
      return mockStore.timeSlots.filter(s => s.theatre_id === theatreId && s.is_active === 1);
    }
    return mockStore.timeSlots.filter(s => s.is_active === 1);
  }

  // Handle Occasions
  if (lower.includes('from occasions') || lower.includes('from `occasions`')) {
    return mockStore.occasions.filter(o => o.is_active === 1);
  }

  // Handle Addons
  if (lower.includes('from addons') || lower.includes('from `addons`')) {
    return mockStore.addons.filter(a => a.is_active === 1);
  }

  // Handle FAQs
  if (lower.includes('from faqs') || lower.includes('from `faqs`')) {
    return mockStore.faqs;
  }

  // Handle Testimonials
  if (lower.includes('from testimonials') || lower.includes('from `testimonials`')) {
    return mockStore.testimonials;
  }

  // Handle Site Settings
  if (lower.includes('from site_settings') || lower.includes('from `site_settings`')) {
    return Object.entries(mockStore.siteSettings).map(([key_name, value_content]) => ({
      key_name,
      value_content
    }));
  }

  // Handle Bookings SELECT
  if (lower.startsWith('select') && (lower.includes('from bookings') || lower.includes('from `bookings`'))) {
    if (lower.includes('booking_ref = ?') && params.length > 0) {
      return mockStore.bookings.filter(b => b.booking_ref === params[0] && b.is_deleted === 0);
    }
    return mockStore.bookings.filter(b => b.is_deleted === 0);
  }

  // Handle INSERT for bookings (mock)
  if (lower.startsWith('insert') && lower.includes('into bookings')) {
    // This is handled in the API route directly for mock
    return { insertId: mockStore.bookings.length + 1 };
  }

  // Handle UPDATE for coupons used_count
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

  // Default empty result
  return [];
}
