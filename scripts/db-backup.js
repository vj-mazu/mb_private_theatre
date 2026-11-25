/**
 * Writes a full JSON backup (including uploaded images) to ./backups and keeps the newest 7.
 * Each file is a complete copy, so the newest one alone restores everything.
 * Scheduled nightly at 00:00 IST by deploy/install.sh, or run:  npm run db:backup
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { Pool } = require('pg');

const root = path.join(__dirname, '..');
for (const file of ['.env.local', '.env']) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^"|"$/g, '');
  }
}

const TABLES = ['settings', 'branches', 'theatres', 'slots', 'packages', 'package_prices', 'cakes', 'addons', 'occasions', 'gallery',
  'coupons', 'promos', 'testimonials', 'faqs', 'enquiries', 'users', 'bookings', 'payments', 'booking_events', 'whatsapp_messages', 'audit_log', 'slot_blocks', 'showcase_videos'];
const KEEP = 7;

(async () => {
  const url = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: url, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false });
  const tables = {};
  for (const t of TABLES) tables[t] = (await pool.query(`SELECT * FROM ${t} ORDER BY 1`)).rows;
  tables.files = (await pool.query("SELECT id, mime, size, name, created_at, encode(data,'base64') AS data FROM files")).rows;
  await pool.end();

  const dir = path.join(root, 'backups');
  fs.mkdirSync(dir, { recursive: true });
  // File name in India time, e.g. moviebash-2026-11-26T00-00-00.json.gz
  const stamp = new Date(Date.now() + 330 * 60_000).toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const file = path.join(dir, `moviebash-${stamp}.json.gz`);
  // Written under a temporary name first: old backups are only removed once the new one is complete.
  fs.writeFileSync(`${file}.part`, zlib.gzipSync(JSON.stringify({ app: 'moviebash', version: 2, created_at: new Date().toISOString(), tables })));
  fs.renameSync(`${file}.part`, file);

  const old = fs.readdirSync(dir).filter((f) => f.startsWith('moviebash-') && f.endsWith('.json.gz')).sort().reverse().slice(KEEP);
  for (const f of old) fs.unlinkSync(path.join(dir, f));
  console.log(`Backup written: ${path.relative(root, file)} (${tables.bookings.length} bookings)`);
})().catch((err) => { console.error('Backup failed:', err.message); process.exit(1); });
