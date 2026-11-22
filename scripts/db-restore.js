/**
 * Restores a Movie Bash backup into the database (replaces ALL current data).
 *
 *   node scripts/db-restore.js <backup.json | backup.json.gz> --yes
 *
 * Accepts the file from Admin → Settings → Backup, or from `npm run db:backup` (./backups/*.json.gz).
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

// Parent tables first.
const ORDER = ['files', 'settings', 'branches', 'theatres', 'slots', 'packages', 'package_prices', 'cakes', 'addons', 'occasions',
  'gallery', 'coupons', 'promos', 'testimonials', 'faqs', 'enquiries', 'users', 'bookings', 'payments', 'booking_events', 'whatsapp_messages', 'audit_log', 'slot_blocks'];

async function main() {
  const file = process.argv[2];
  if (!file || !process.argv.includes('--yes')) {
    console.log('Usage: node scripts/db-restore.js <backup.json|backup.json.gz> --yes\nThis REPLACES all data in the database.');
    process.exit(1);
  }
  let raw = fs.readFileSync(file);
  if (file.endsWith('.gz')) raw = zlib.gunzipSync(raw);
  const backup = JSON.parse(raw.toString('utf8'));
  if (backup.app !== 'moviebash' || !backup.tables) throw new Error('This is not a Movie Bash backup file');

  const url = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString: url, ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false });
  const client = await pool.connect();
  try {
    await client.query(fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8'));
    const { rows: colRows } = await client.query(
      "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public'");
    const columns = {};
    for (const r of colRows) (columns[r.table_name] ||= {})[r.column_name] = r.data_type;

    await client.query('BEGIN');
    // A backup made without images keeps the images already in this database.
    const order = backup.tables.files ? ORDER : ORDER.filter((t) => t !== 'files');
    await client.query(`TRUNCATE ${order.join(', ')} RESTART IDENTITY CASCADE`);
    for (const table of order) {
      const rows = backup.tables[table] || [];
      const types = columns[table] || {};
      for (const row of rows) {
        const cols = Object.keys(row).filter((c) => c in types);
        const values = cols.map((c) => {
          const v = row[c];
          if (v === null || v === undefined) return null;
          if (types[c] === 'bytea') return Buffer.from(v, 'base64');
          if ((types[c] === 'jsonb' || types[c] === 'json') && typeof v !== 'string') return JSON.stringify(v);
          return v;
        });
        await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')})`, values);
      }
      if (types.id && types.id !== 'uuid') {
        await client.query(`SELECT setval(pg_get_serial_sequence('${table}','id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), 1))`);
      }
      console.log(`${table.padEnd(18)} ${rows.length}`);
    }
    await client.query('COMMIT');
    console.log(`Restored backup from ${backup.created_at}.`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error('Restore failed:', err.message); process.exit(1); });
