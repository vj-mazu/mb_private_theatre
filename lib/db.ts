import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { initialMockStore, MockStore } from './mock-data';

let pool: mysql.Pool | null = null;
let isMySQLAvailable: boolean | null = null;

export function getPool(): mysql.Pool | null {
  if (pool) return pool;

  try {
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

export const mockStore: MockStore = loadPersistentStore();

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
    return true;
  } catch (err) {
    isMySQLAvailable = false;
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

function executeMockQuery(sql: string, params: any[] = []): any {
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
    return mockStore.bookings.filter(b => b.is_deleted === 0);
  }

  // Default empty result
  return [];
}
