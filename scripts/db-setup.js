/**
 * Movie Bash — database setup / migration.
 *
 *   node scripts/db-setup.js            create tables (idempotent) and seed an empty DB
 *   node scripts/db-setup.js --reset    DROP everything, recreate, import data/store.json
 *
 * Reads DATABASE_URL from .env.local.
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
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

let url = (process.env.DATABASE_URL || '').trim().replace(/^["']|["']$/g, '');
if (!url) { console.error('DATABASE_URL is not set'); process.exit(1); }
// Same rules as lib/server/db.ts: hosted databases (Supabase) use SSL; an sslmode= in the URL is handled here instead.
const useSsl = /^(true|1|yes)$/i.test((process.env.DATABASE_SSL || '').trim()) || /supabase\.(co|com)/i.test(url);
if (useSsl) url = url.replace(/([?&])sslmode=[^&]*&?/i, '$1').replace(/[?&]$/, '');
const ssl = useSsl ? { rejectUnauthorized: false } : false;
const pool = new Pool({ connectionString: url, ssl });

/** Creates the database named in DATABASE_URL if it does not exist yet (needs a user with CREATEDB, e.g. postgres). */
async function ensureDatabase() {
  const target = new URL(url);
  const name = decodeURIComponent(target.pathname.replace(/^\//, ''));
  if (!/^[A-Za-z0-9_]+$/.test(name)) return;
  const admin = new URL(url);
  admin.pathname = '/postgres';
  const { Client } = require('pg');
  const c = new Client({ connectionString: admin.toString(), ssl });
  try {
    await c.connect();
    const { rowCount } = await c.query('SELECT 1 FROM pg_database WHERE datname=$1', [name]);
    if (!rowCount) { await c.query(`CREATE DATABASE "${name}"`); console.log(`Created database "${name}".`); }
  } catch (err) {
    console.log(`(Could not check/create database automatically: ${err.message})`);
  } finally {
    await c.end().catch(() => {});
  }
}

const LEGACY_TABLES = [
  'booking_custom_items', 'booking_edit_history', 'booking_closure_records', 'booking_cancellation_records',
  'payment_transactions', 'staff_users', 'site_settings', 'audit_logs', 'customers', 'time_slots',
  'booking_addons', 'enquiries', 'newsletter_subscribers', 'faqs', 'testimonials',
];
const TABLES = [
  'showcase_videos', 'audit_log', 'whatsapp_messages', 'booking_events', 'payments', 'bookings', 'users', 'coupons', 'gallery',
  'occasions', 'addons', 'cakes', 'package_prices', 'packages', 'slots', 'theatres', 'branches', 'settings', 'files',
];

const to24 = (t) => {
  const m = String(t).trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return String(t);
  let h = Number(m[1]);
  const ap = (m[3] || '').toUpperCase();
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m[2]}`;
};

const CAKES = [
  ['Alphonso Mango', 'alphonso-mango'], ['Mango Forest', 'mango-forest'], ['Pineapple Forest', 'pineapple-forest'],
  ['Blueberry', 'blueberry'], ['Black Currant', 'black-currant'], ['Strawberry Bliss', 'strawberry-bliss'],
  ['Choco Truffle', 'choco-truffle'], ['Black Forest', 'black-forest'], ['White Forest', 'white-forest'],
  ['Butterscotch Crunch', 'butterscotch-crunch'], ['Irish Coffee', 'irish-coffee'],
];

const ADDONS = [
  ['Entry', 'Fog Entry (2 pots)', '2 pots of dense fog for a cinematic walk-in.', 499, '/images/addons/fog-entry.webp'],
  ['Entry', 'Cold Pyro Sparklers', '2 indoor-safe cold pyro fountains.', 399, '/images/addons/cold-pyro.webp'],
  ['Entry', 'Bubble Entry', 'Bubble machine for a dreamy entry.', 399, '/images/addons/bubble-entry-party.webp'],
  ['Decor', 'LED Name / Number Board', 'Custom glowing name or number.', 299, '/images/addons/led-name-board.webp'],
  ['Gifts', 'Red Rose Bouquet', 'Fresh hand-tied red roses.', 499, '/images/addons/rose-bouquet.webp'],
  ['Gifts', 'Teddy Mascot Surprise', 'Giant teddy mascot appearance.', 699, '/images/addons/teddy-mascot.webp'],
  ['Photography', 'DSLR Photography', 'Dedicated photographer, edited photos.', 999, '/images/addons/dslr-photography.webp'],
  ['Photography', 'iPhone Reel', 'Short edited reel shot on iPhone.', 499, '/images/addons/iphone-reel.webp'],
];

const PACKAGES = [
  {
    name: 'Standard', tagline: 'Everything you need for a perfect celebration', highlight: true,
    includes: ['500g cake (choose flavour)', 'Fog entry (1 pot)', 'Celebration decoration', 'LED name & number board', 'Neon light (Happy Birthday / Love)', '4K projector & Dolby sound'],
    price: (t) => t.standard_price || (t.capacity <= 2 ? 1499 : 2200),
  },
  {
    name: 'Premium', tagline: 'The grand celebration with every effect', highlight: false,
    includes: ['500g cake (choose flavour)', 'Fog entry (2 pots)', 'Grand themed decoration', 'Cold pyro entry', 'Rose petals & candle heart', 'Personalised LED name', 'Bubble machine', '4K projector & Dolby sound'],
    price: (t) => t.premium_price || (t.capacity <= 2 ? 2800 : 3500),
  },
];

const OCCASION_IMAGES = {
  'Birthday Party': '/images/couple_3.webp', Anniversary: '/images/couple_6.webp',
  'Date & Proposal': '/images/rooms/btm-butterfly-blush.webp', 'Bachelorette Party': '/images/rooms/btm-lavender-mist.webp',
  Farewell: '/images/occasion-farewell.webp', 'Baby Shower': '/images/ambience_3.webp', 'Corporate Event': '/images/ambience_1.webp',
};

const legacyCouponRows = [];

/** First admin account. Uses ADMIN_USERNAME / ADMIN_PASSWORD, or prints a one-time random password to the log. */
/** Inserts the rows of a Movie Bash backup-format file into an empty database (one transaction). */
async function seedFromFile(client, file) {
  const ORDER = ['files', 'settings', 'branches', 'theatres', 'slots', 'packages', 'package_prices', 'cakes', 'addons', 'occasions',
    'gallery', 'coupons', 'promos', 'testimonials', 'faqs'];
  const seed = JSON.parse(require('zlib').gunzipSync(fs.readFileSync(file)).toString('utf8'));
  const { rows: colRows } = await client.query("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public'");
  const columns = {};
  for (const r of colRows) (columns[r.table_name] ||= {})[r.column_name] = r.data_type;
  await client.query('BEGIN');
  try {
    for (const table of ORDER) {
      const rows = seed.tables[table] || [];
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
        await client.query(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(',')}) ON CONFLICT DO NOTHING`, values);
      }
      if (types.id && types.id !== 'uuid') {
        await client.query(`SELECT setval(pg_get_serial_sequence('${table}','id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), 1))`);
      }
      if (rows.length) console.log(`  ${table.padEnd(16)} ${rows.length}`);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  }
}

/**
 * ADMIN_USERNAME + ADMIN_PASSWORD (10+ characters) are the source of truth for that one admin login:
 * on every setup run (every deploy / container start) it is created, or its password reset to the value set
 * in the hosting environment. Other users, and passwords changed for other accounts, are untouched.
 * Returns true when it applied the login.
 */
async function syncEnvAdmin(client) {
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!username || !password) {
    console.log('! ADMIN_USERNAME / ADMIN_PASSWORD are not set (names must be exactly these, in capitals) - admin login left unchanged.');
    return false;
  }
  if (password.length < 10) {
    console.log(`! ADMIN_PASSWORD is shorter than 10 characters, so it was NOT applied to "${username}". Use 10+ characters.`);
    return false;
  }
  await client.query(
    `INSERT INTO users (name, username, password_hash, role, is_active) VALUES ('Administrator', $1, $2, 'admin', true)
     ON CONFLICT (username) DO UPDATE SET password_hash=EXCLUDED.password_hash, role='admin', is_active=true`,
    [username, bcrypt.hashSync(password, 10)]);
  console.log(`Admin login "${username}" is ready (password from ADMIN_PASSWORD).`);
  return true;
}

async function createFirstAdmin(client) {
  if (await syncEnvAdmin(client)) return;
  const username = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  let password = process.env.ADMIN_PASSWORD || '';
  if (password.length < 10) {
    password = require('crypto').randomBytes(9).toString('base64url');
    console.log('============================================================');
    console.log(`  First admin created:  username "${username}"  password "${password}"`);
    console.log('  Sign in at /admin/login and change it under Staff.');
    console.log('============================================================');
  }
  await client.query("INSERT INTO users (name, username, password_hash, role) VALUES ('Administrator', $1, $2, 'admin') ON CONFLICT (username) DO NOTHING",
    [username, bcrypt.hashSync(password, 10)]);
}

const FAQS = [
  ['How many screens do you have?', 'Each branch has its own set of private theatres — couple, celebration and family rooms.'],
  ['What if we book and want to postpone the date?', 'Please inform us at least 72 hours before your slot and we will move it to an available date.'],
  ['Is alcohol served or smoking permitted?', 'No, both are strictly prohibited across all premises.'],
  ['Are there age restrictions?', '18 and above. Guests below 18 are welcome with family members.'],
  ['Is outside food allowed?', 'Yes, outside food is allowed and you can also order via Swiggy or Zomato.'],
  ['Is parking available?', 'Electronic City has dedicated 2-wheeler and 4-wheeler parking. BTM 1st Stage does not have dedicated parking.'],
  ['Can we bring pets?', 'No, pets are not allowed inside the theatres.'],
  ['What if a technical issue occurs during the event?', 'A partial refund or rescheduling is provided as per our terms and conditions.'],
  ['What decorations do you have?', 'Love, Birthday, Anniversary and Celebration themes, plus custom decoration on request.'],
  ['What add-ons do you have?', 'Cake, snacks, fog entry, cold pyro, special decoration, baby cart entry, photography and more.'],
  ['When can we book add-ons?', 'While booking the room, or anytime up to 24 hours before the event.'],
  ['Can we watch our own movie or videos?', 'Yes. Log in to your own OTT account (Netflix, Prime, Hotstar and more). Pen drives are not supported.'],
];

const TESTIMONIALS = [
  ['Neha Sultana', 'Baby’s birthday', "Had the absolute best time celebrating our baby's birthday here! The team provided outstanding service and genuine cooperation throughout. The photos and videos turned out stunning, and the cake was a huge hit too. Thank you for making our baby's day so memorable!"],
  ['Pavani Pandu', 'Son’s 2nd birthday', "We celebrated our son's 2nd birthday here and it was an unforgettable experience! Everything was well organised and beautifully arranged. The decorations, lighting and ambience were perfect, and the staff were friendly, polite and attentive to every little detail."],
  ['Naveen Sudarshan', 'Birthday', "Had a really nice experience at Movie Bash! The staff were very patient, friendly and supportive throughout. The private theatre setup made the celebration feel extra special and gave us wonderful memories."],
  ['Kavin', 'Family gathering', 'Great place to spend time with friends and family on a special day. Lovely decoration, cozy and neat, great service, easy to book. Outside food is allowed and you can use your own OTT platforms.'],
  ['Shreya', 'Couple celebration', 'One of the best places to celebrate. Booked the couple theatre for 4 members — the fog effect and everything was amazing.'],
  ['Kumar', 'Anniversary', 'Amazing experience for our anniversary. Fog entry, cake, decoration and photo shoot were fabulous.'],
];

const STORY = {
  title: 'Made for moments that matter',
  body: 'Movie Bash began with a simple idea: celebrations feel bigger when they are private. Today our theatres in Electronic City and BTM 1st Stage host birthdays, anniversaries, proposals and family movie nights every day.\n\nEvery room has a big 4K screen, Dolby sound, comfortable recliners and a decorated celebration corner. Bring your own movie, choose your cake and decoration, and the whole theatre is yours.',
  quote: 'Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.',
  image: '/images/story-birthday.webp',
};

/** Seeds website content tables when empty. Safe to run repeatedly. */
/**
 * Small, safe content fixes for databases created earlier. Each only touches the exact old value,
 * so anything the admin has changed since (own photo, own name) is left alone. Safe to run every time.
 */
async function updateContent(client) {
  // Birthday leads the home hero. Only swaps while the order is still the original one, so admin changes win.
  await client.query(`UPDATE occasions SET sort_order = CASE name WHEN 'Birthday Party' THEN 0 ELSE 1 END
    WHERE name IN ('Birthday Party', 'Anniversary')
      AND (SELECT sort_order FROM occasions WHERE name='Anniversary' LIMIT 1) = 0
      AND (SELECT sort_order FROM occasions WHERE name='Birthday Party' LIMIT 1) = 1`);
  // Package wording. Each only matches the exact old lines, so anything an admin has edited since is left alone.
  await client.query(`UPDATE packages SET includes = (
      SELECT jsonb_agg(CASE x WHEN 'Premium decoration' THEN 'Decoration' WHEN 'Happy Birthday neon light' THEN 'Neon light (Happy Birthday / Love)' ELSE x END ORDER BY i)
      FROM jsonb_array_elements_text(includes) WITH ORDINALITY AS t(x, i))
    WHERE name = 'Standard' AND (includes ? 'Premium decoration' OR includes ? 'Happy Birthday neon light')`);
  await client.query(`UPDATE packages SET includes = (
      SELECT jsonb_agg(x ORDER BY i) FROM jsonb_array_elements_text(includes) WITH ORDINALITY AS t(x, i)
      WHERE x <> '500 g cake (choose flavour)')
    WHERE name = 'Premium' AND includes ? 'Everything in Standard' AND includes ? '500 g cake (choose flavour)'`);
  await client.query(`UPDATE settings SET value = replace(value::text, '/images/ecity-family-theatre.webp', '/images/story-birthday.webp')::jsonb
    WHERE key='story' AND value->>'image' = '/images/ecity-family-theatre.webp'`);
  await client.query("UPDATE addons SET image_url='/images/addons/bubble-entry-party.webp' WHERE image_url='/images/addons/bubble-entry.webp'");
  await client.query("UPDATE addons SET image_url='/images/addons/party-popper-confetti.webp' WHERE image_url='/images/addons/party-poppers.webp'");
  await client.query("UPDATE addons SET name='Bubble Entry', description='Bubble machine for a dreamy entry.' WHERE name='Bubbles'");
  await client.query(`UPDATE packages SET includes = (
      SELECT jsonb_agg(CASE WHEN x = 'Bubbles' THEN 'Bubble entry' ELSE x END ORDER BY i)
      FROM jsonb_array_elements_text(includes) WITH ORDINALITY AS t(x, i))
    WHERE includes ? 'Bubbles'`);
  await updateContentNov2026(client);
}

const FOG_TIERS = [
  { qty: 1, price: 399, label: '1 pot' }, { qty: 2, price: 699, label: '2 pots' },
  { qty: 3, price: 1000, label: '3 pots' }, { qty: 5, price: 1500, label: '5 pots' },
];

/** Nov 2026 content changes. Each statement only matches the old default value, so admin edits are kept. */
async function updateContentNov2026(client) {
  // Standard package: fog entry is 1 pot.
  await client.query(`UPDATE packages SET includes = (
      SELECT jsonb_agg(CASE WHEN x = 'Fog entry – 2 pots' THEN 'Fog entry – 1 pot' WHEN x = 'Fog entry (2 pots)' THEN 'Fog entry (1 pot)' ELSE x END ORDER BY i)
      FROM jsonb_array_elements_text(includes) WITH ORDINALITY AS t(x, i))
    WHERE name = 'Standard' AND (includes ? 'Fog entry – 2 pots' OR includes ? 'Fog entry (2 pots)')`);

  // Fog entry is sold in packs: 1 pot ₹399, 2 pots ₹699, 3 pots ₹1000, 5 pots ₹1500.
  await client.query(`UPDATE addons SET name='Fog Entry', price=399, price_tiers=$1,
      description='Dense fog for a cinematic walk-in. Choose 1, 2, 3 or 5 pots.'
    WHERE name='Fog Entry (2 pots)' AND price_tiers='[]'::jsonb`, [JSON.stringify(FOG_TIERS)]);

  // New photos and prices.
  const photo = (from, to) => client.query('UPDATE addons SET image_url=$2 WHERE image_url=$1', [from, to]);
  await photo('/images/addons/fog-entry.webp', '/images/addons/fog-entry-pots.webp');
  await photo('/images/addons/cold-pyro.webp', '/images/addons/cold-pyro-entry.webp');
  await photo('/images/addons/bubble-entry-party.webp', '/images/addons/bubble-entry-machine.webp');
  await photo('/images/addons/led-name-board.webp', '/images/addons/led-name-number.webp');
  await client.query("UPDATE addons SET price=799 WHERE name='Cold Pyro Sparkle Entry' AND price=399");
  await client.query("UPDATE addons SET price=250 WHERE name='Bubble Entry' AND price=399");
  await client.query("UPDATE addons SET price=250 WHERE name='LED Name / Number' AND price=299");
  for (const [i, [name, desc, image]] of [
    ["Kid's Car Entry", 'Grand entry in a light-up kids car.', '/images/addons/kids-car-entry.webp'],
    ['Baby Cart Entry', 'Decorated baby cart entry for the little one.', '/images/addons/baby-cart-entry.webp'],
  ].entries()) {
    await client.query(`INSERT INTO addons (category, name, description, price, image_url, sort_order)
      SELECT 'Entry', $1, $2, 799, $3, $4 WHERE NOT EXISTS (SELECT 1 FROM addons WHERE lower(replace(name, '''', '')) = lower(replace($1, '''', '')))`,
      [name, desc, image, 3 + i]);
  }

  // Extra person: couple ₹99, family & celebration ₹150 (was 149 on some rooms).
  await client.query('UPDATE theatres SET extra_person_price=150 WHERE base_capacity > 2 AND extra_person_price=149');
  await client.query('UPDATE theatres SET extra_person_price=99 WHERE base_capacity <= 2 AND extra_person_price IN (149, 150)');

  // Couple rooms: extra hour ₹400 (was 449).
  await client.query('UPDATE theatres SET extra_hour_price=400 WHERE base_capacity <= 2 AND extra_hour_price=449');

  // Family & celebration rooms: extra hour ₹750 (couple rooms unchanged).
  await client.query('UPDATE theatres SET extra_hour_price=750 WHERE base_capacity > 2 AND extra_hour_price=449');

  // Only Electronic City has dedicated parking; pen drives are not supported.
  await client.query(`UPDATE faqs SET answer=$1 WHERE answer='Yes, 2-wheeler and 4-wheeler parking is available at both branches.'`,
    ['Electronic City has dedicated 2-wheeler and 4-wheeler parking. BTM 1st Stage does not have dedicated parking.']);
  await client.query(`UPDATE faqs SET answer=$1 WHERE answer='Yes. Use your own OTT login (Netflix, Prime, Hotstar and more) or bring a pen drive.'`,
    ['Yes. Log in to your own OTT account (Netflix, Prime, Hotstar and more). Pen drives are not supported.']);
  await client.query(`UPDATE settings SET value = replace(value::text, 'Free 2-wheeler and 4-wheeler parking is available', 'Dedicated parking at Electronic City only (none at BTM 1st Stage)')::jsonb
    WHERE key='visit' AND value::text LIKE '%Free 2-wheeler and 4-wheeler parking is available%'`);

  // Occasion list (once): Birthday, Anniversary, Bride to Be, Groom to Be, Date, Love Proposal / Marry Me, Baby Shower,
  // Naming Ceremony. "Other" (custom text) is built into the booking form.
  await once(client, 'occasions_nov2026', async () => {
    if ((await client.query("SELECT 1 FROM occasions WHERE name='Naming Ceremony'")).rowCount) return; // already applied before this marker existed
    await client.query("UPDATE occasions SET name='Birthday' WHERE name='Birthday Party'");
    await client.query("UPDATE occasions SET name='Bride to Be' WHERE name='Bachelorette Party'");
    await client.query("UPDATE occasions SET name='Love Proposal / Marry Me' WHERE name='Date & Proposal'");
    await client.query("UPDATE occasions SET is_active=false WHERE name IN ('Farewell', 'Corporate Event')");
    const order = ['Birthday', 'Anniversary', 'Bride to Be', 'Groom to Be', 'Date', 'Love Proposal / Marry Me', 'Baby Shower', 'Naming Ceremony'];
    for (const [i, name] of order.entries()) {
      await client.query('INSERT INTO occasions (name, sort_order) SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM occasions WHERE name=$1)', [name, i]);
      await client.query('UPDATE occasions SET sort_order=$2, is_active=true WHERE name=$1', [name, i]);
    }
  });
  await keepLegacyPackLines(client);
  await updateMediaNov2026(client);
}

/**
 * Bookings made before an add-on got pack prices (e.g. "Fog Entry (2 pots)" at ₹499) have no chosen pack.
 * Editing or completing them would re-price that line as the 1-pack price, so keep each such line as a
 * fixed-price custom line with the same name, price and qty. Lines with an `option` or an included qty are left alone.
 */
async function keepLegacyPackLines(client) {
  const legacy = `i->>'kind' = 'addon' AND NOT (i ? 'option') AND COALESCE((i->>'included')::int, 0) = 0
    AND (i->>'addon_id')::int IN (SELECT id FROM addons WHERE jsonb_array_length(price_tiers) > 0)`;
  await client.query(`UPDATE bookings b SET items = (
      SELECT jsonb_agg(CASE WHEN ${legacy}
        THEN jsonb_build_object('kind', 'custom', 'name', i->'name', 'price', i->'price', 'qty', i->'qty') ELSE i END ORDER BY n)
      FROM jsonb_array_elements(b.items) WITH ORDINALITY AS t(i, n))
    WHERE jsonb_typeof(b.items) = 'array' AND EXISTS (SELECT 1 FROM jsonb_array_elements(b.items) AS t(i) WHERE ${legacy})`);
}

/**
 * Photos from the Movie Bash Drive folder (Electronic City rooms), the occasion list for the hero and booking,
 * and the gallery. Runs once for each part; theatre photos are only replaced while still the old defaults.
 */
async function updateMediaNov2026(client) {
  const E = (n) => `/images/ecity/${n}.webp`;

  // Occasions (hero + booking): Kids Birthday, Anniversary, Bride to Be, Groom to Be, Mom To Be, Love Proposal / Marry Me, Date, Baby Shower, Naming Ceremony.
  await once(client, 'occasions_media_nov2026', async () => {
    if ((await client.query("SELECT 1 FROM occasions WHERE name IN ('Mom To Be', 'Kids Birthday')")).rowCount) return; // already applied before this marker existed
    await client.query("UPDATE occasions SET name='Kids Birthday' WHERE name IN ('Birthday', 'Birthday Party')");
    await client.query("UPDATE occasions SET name='Bride to Be' WHERE name='Bachelorette Party'");
    const OLD = ['', '/images/couple_3.webp', '/images/couple_6.webp', '/images/rooms/btm-butterfly-blush.webp', '/images/rooms/btm-lavender-mist.webp', '/images/ambience_3.webp', '/images/ambience_1.webp', '/images/occasion-farewell.webp'];
    const occasions = [
      ['Kids Birthday', E('kids-family-1')], ['Anniversary', E('celebration-anniversary-2')], ['Bride to Be', E('family-bride-1')],
      ['Groom to Be', E('family-groom-2')], ['Mom To Be', E('family-mom-2')], ['Love Proposal / Marry Me', E('couple-anniversary-1')],
      ['Date', E('couple-anniversary-3')], ['Baby Shower', E('celebration-mom-2')], ['Naming Ceremony', E('naming-2')],
    ];
    for (const [i, [name, image]] of occasions.entries()) {
      await client.query('INSERT INTO occasions (name, sort_order, image_url) SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM occasions WHERE name=$1)', [name, i, image]);
      await client.query('UPDATE occasions SET sort_order=$2, is_active=true WHERE name=$1', [name, i]);
      await client.query('UPDATE occasions SET image_url=$2 WHERE name=$1 AND image_url = ANY($3::text[])', [name, image, OLD]);
    }
  });

  // Electronic City rooms: couple = red, celebration = gold, family = purple.
  const rooms = [
    ['Couple Theater', '/images/rooms/room_1_1794980138988.webp', E('couple-anniversary-2'), ['couple-anniversary-1', 'couple-anniversary-3', 'couple-birthday-1', 'couple-birthday-2']],
    ['Celebration Theater', '/images/ecity-celebration-theatre.webp', E('celebration-anniversary-4'), ['celebration-anniversary-1', 'celebration-birthday-2', 'celebration-anniversary-5', 'celebration-bride-2', 'celebration-groom-2', 'celebration-birthday-4']],
    ['Family Theatre', '/images/ecity-family-theatre.webp', E('family-anniversary-2'), ['family-anniversary-1', 'family-birthday-2', 'family-anniversary-4', 'family-bride-2', 'family-groom-1', 'family-mom-2']],
  ];
  for (const [name, old, main, more] of rooms) {
    await client.query('UPDATE theatres SET image_url=$2, images=$3 WHERE name=$1 AND image_url=$4', [name, main, JSON.stringify([main, ...more.map(E)]), old]);
  }

  // "Our story" cards under the hero: new full-size photos while the old small ones are still in place.
  await client.query("UPDATE settings SET value = jsonb_set(value, '{image}', to_jsonb($1::text)) WHERE key='story' AND value->>'image' IN ('/images/story-birthday.webp', '')", [E('celebration-birthday-2')]);
  await client.query('UPDATE branches SET image_url=$1 WHERE slug=$2 AND image_url = ANY($3::text[])', [E('venue-1'), 'electronic-city', ['/images/couple_1.webp', '', E('venue-6')]]);

  await once(client, 'gallery_ecity_nov2026', () => seedEcityGallery(client));
  await updateContentNov2026c(client);
}

/**
 * The Electronic City photos in the gallery. Runs once (a photo deleted in Admin stays deleted) and is skipped
 * when these photos are already there.
 */
async function seedEcityGallery(client) {
  if ((await client.query("SELECT 1 FROM gallery WHERE image_url LIKE '/images/ecity/%' LIMIT 1")).rowCount) return;
  const E = (n) => `/images/ecity/${n}.webp`;
  // Gallery: the new photos first (the last 8 inserted are the ones the home page shows, a mix of rooms).
  const files = (prefix, n) => Array.from({ length: n }, (_, i) => `${prefix}-${i + 1}`);
  const home = ['couple-anniversary-1', 'celebration-anniversary-2', 'family-bride-1', 'kids-family-1', 'family-anniversary-2', 'celebration-birthday-2', 'naming-2', 'family-mom-2'];
  const groups = [
    ['Couples', [...files('couple-anniversary', 3), ...files('couple-birthday', 2)]],
    ['Celebrations', [...files('celebration-anniversary', 5), ...files('celebration-birthday', 6), ...files('celebration-bride', 3), ...files('celebration-groom', 3), ...files('celebration-mom', 2),
      ...files('family-anniversary', 4), ...files('family-birthday', 4), ...files('family-bride', 2), ...files('family-groom', 2), ...files('family-mom', 3),
      ...files('kids-celebration', 2), ...files('kids-family', 8), ...files('naming', 2)]],
    ['Ambience', files('venue', 10)],
  ];
  for (const [category, list] of groups) {
    for (const n of list.filter((x) => !home.includes(x))) {
      await client.query('INSERT INTO gallery (image_url, category, sort_order) SELECT $1,$2,-1 WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE image_url=$1)', [E(n), category]);
    }
  }
  for (const n of home) {
    const category = n.startsWith('couple') ? 'Couples' : 'Celebrations';
    await client.query('INSERT INTO gallery (image_url, category, sort_order) SELECT $1,$2,-1 WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE image_url=$1)', [E(n), category]);
  }
}

/** Runs a one-time change. A marker row in `settings` stops it from running again, so later edits in Admin are never overwritten. */
async function once(client, key, change) {
  const marker = `migrated_${key}`;
  const { rowCount } = await client.query('SELECT 1 FROM settings WHERE key=$1', [marker]);
  if (rowCount) return;
  await change();
  await client.query("INSERT INTO settings (key, value) VALUES ($1, 'true'::jsonb) ON CONFLICT (key) DO NOTHING", [marker]);
}

/** Nov 2026, part 3: BTM 1st Stage, occasion names, Premium fog, and each room's birthday video. */
async function updateContentNov2026c(client) {
  // The BTM branch is in BTM 1st Stage (its address already said so). Only the display name changes; the link name stays.
  const OLD = 'BTM 2nd Stage', NEW = 'BTM 1st Stage';
  await client.query("UPDATE branches SET name = regexp_replace(name, $1, $2, 'gi'), address = regexp_replace(address, $1, $2, 'gi') WHERE name ~* $1 OR address ~* $1", [OLD, NEW]);
  for (const [table, cols] of [['faqs', ['question', 'answer']], ['testimonials', ['text', 'occasion']], ['promos', ['title', 'text']],
    ['enquiries', ['branch']], ['gallery', ['caption', 'category']], ['theatres', ['description']], ['packages', ['tagline']]]) {
    const sets = cols.map((c) => `${c} = regexp_replace(${c}, $1, $2, 'gi')`).join(', ');
    const any = cols.map((c) => `${c} ~* $1`).join(' OR ');
    await client.query(`UPDATE ${table} SET ${sets} WHERE ${any}`, [OLD, NEW]);
  }
  await client.query("UPDATE settings SET value = regexp_replace(value::text, $1, $2, 'gi')::jsonb WHERE value::text ~* $1", [OLD, NEW]);

  // "Date" is now "Movie Date".
  await once(client, 'occasion_movie_date', () => client.query("UPDATE occasions SET name='Movie Date' WHERE name='Date'"));

  // "Birthday" is its own occasion next to "Kids Birthday". It has no hero photo, so the home hero keeps exactly the slides it has.
  await once(client, 'occasion_birthday', async () => {
    if ((await client.query("SELECT 1 FROM occasions WHERE name='Birthday'")).rowCount) return;
    const { rows } = await client.query("SELECT sort_order FROM occasions WHERE name='Kids Birthday' LIMIT 1");
    const at = rows.length ? rows[0].sort_order : 0;
    await client.query('UPDATE occasions SET sort_order = sort_order + 1 WHERE sort_order >= $1', [at]);
    await client.query("INSERT INTO occasions (name, sort_order, image_url) VALUES ('Birthday', $1, '')", [at]);
  });

  // "Kids Birthday" is removed from occasions (booking forms); the home hero shows it as a fixed slide instead.
  await once(client, 'remove_kids_birthday_occasion', () => client.query("DELETE FROM occasions WHERE name='Kids Birthday'"));

  // Premium includes 2 pots of fog (Standard stays at 1). Before fog was sold in packs, "1 × Fog Entry" meant 2 pots.
  await once(client, 'premium_fog_2_pots', async () => {
    const { rows: [fog] } = await client.query("SELECT id FROM addons WHERE name='Fog Entry' AND jsonb_array_length(price_tiers) > 0 ORDER BY id LIMIT 1");
    if (!fog) return;
    await client.query(`UPDATE packages SET included_addons = (
        SELECT jsonb_agg(CASE WHEN (x->>'addon_id')::int = $1 AND (x->>'qty')::int = 1 THEN jsonb_set(x, '{qty}', '2') ELSE x END ORDER BY i)
        FROM jsonb_array_elements(included_addons) WITH ORDINALITY AS t(x, i))
      WHERE name='Premium' AND jsonb_typeof(included_addons) = 'array' AND jsonb_array_length(included_addons) > 0`, [fog.id]);
    await client.query(`UPDATE packages SET includes = (
        SELECT jsonb_agg(x ORDER BY o) FROM (
          SELECT to_jsonb(v) AS x, i::numeric AS o FROM jsonb_array_elements_text(includes) WITH ORDINALITY AS t(v, i)
          UNION ALL SELECT to_jsonb('Fog entry – 2 pots'::text), CASE WHEN includes ? 'Everything in Standard' THEN 1.5 ELSE 0.5 END) s)
      WHERE name='Premium' AND NOT includes ? 'Fog entry – 2 pots'`);
  });

  // Mom To Be and Baby Shower were the same occasion: keep Baby Shower only.
  await once(client, 'occasion_baby_shower_only', async () => {
    if ((await client.query("SELECT 1 FROM occasions WHERE name='Baby Shower'")).rowCount) await client.query("DELETE FROM occasions WHERE name='Mom To Be'");
    else await client.query("UPDATE occasions SET name='Baby Shower' WHERE name='Mom To Be'");
  });

  // Room cover photos show each room's birthday setup (the video that plays is the birthday one). Only replaces the old
  // anniversary covers, so a cover chosen in Admin is kept; the other photos stay in the room's gallery after it.
  for (const [name, oldCover, cover] of [
    ['Couple Theater', '/images/ecity/couple-anniversary-2.webp', '/images/ecity/couple-birthday-2.webp'],
    ['Celebration Theater', '/images/ecity/celebration-anniversary-4.webp', '/images/ecity/celebration-birthday-4.webp'],
    ['Family Theatre', '/images/ecity/family-anniversary-2.webp', '/images/ecity/family-birthday-2.webp']]) {
    await client.query(`UPDATE theatres SET image_url=$3, images = (
        SELECT jsonb_agg(x ORDER BY o) FROM (
          SELECT to_jsonb($3::text) AS x, 0 AS o
          UNION ALL SELECT to_jsonb(v), i FROM jsonb_array_elements_text(images) WITH ORDINALITY AS t(v, i) WHERE v <> $3) s)
      WHERE name=$1 AND image_url=$2`, [name, oldCover, cover]);
  }

  // The home page videos are seeded once. (Not "when the table is new": the website creates empty tables itself when it
  // connects first, so the table can exist before this script has ever run.)
  await once(client, 'showcase_videos_seed', async () => {
    if ((await client.query('SELECT 1 FROM showcase_videos LIMIT 1')).rowCount) return; // already has videos
    await seedShowcaseVideos(client);
  });

  // Home page "Our celebrations, in motion": Birthday first, then Kids birthday, then Anniversary; nothing else.
  await once(client, 'showcase_birthday_first', async () => {
    const url = (f) => `/videos/celebrations/${f}.mp4`;
    await client.query('DELETE FROM showcase_videos WHERE video_url = ANY($1::text[])',
      [['couple-marry-me', 'celebration-bride-to-be', 'celebration-groom-to-be', 'couple-i-love-you'].map(url)]);
    for (const [i, [file]] of SHOWCASE_VIDEOS.entries()) await client.query('UPDATE showcase_videos SET sort_order=$2 WHERE video_url=$1', [url(file), i]);
    await client.query("UPDATE showcase_videos SET room='Celebration room', title='Kids birthday' WHERE video_url=$1 AND room='' AND title='1st birthday setup'", [url('kids-first-birthday')]);
  });

  // "Watch room video" plays each Electronic City room's own birthday video: couple = red, celebration = gold, family = purple.
  // Only replaces the old room-tour defaults, so a video chosen in Admin is kept.
  for (const [from, to] of [['/videos/couple_theatre.mp4', '/videos/celebrations/couple-birthday.mp4'],
    ['/videos/celebration_theatre.mp4', '/videos/celebrations/celebration-birthday.mp4'], ['/videos/family_theatre.mp4', '/videos/celebrations/family-birthday.mp4']]) {
    await client.query('UPDATE theatres SET video_url=$2 WHERE video_url=$1', [from, to]);
  }
}

async function ensureContent(client) {
  await updateContent(client);
  const count = async (t) => (await client.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
  // Starter FAQs and reviews: once only, so deleting them all in Admin does not bring them back on the next start.
  await once(client, 'seed_faqs', async () => {
    if (await count('faqs')) return;
    for (const [i, [q, a]] of FAQS.entries()) await client.query('INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3)', [q, a, i]);
    console.log('Seeded FAQs.');
  });
  await once(client, 'seed_testimonials', async () => {
    if (await count('testimonials')) return;
    for (const [i, [n, o, t]] of TESTIMONIALS.entries()) await client.query('INSERT INTO testimonials (name, occasion, text, sort_order) VALUES ($1,$2,$3,$4)', [n, o, t, i]);
    console.log('Seeded testimonials.');
  });
  await client.query("INSERT INTO settings (key, value) VALUES ('story', $1) ON CONFLICT (key) DO NOTHING", [JSON.stringify(STORY)]);
  // Starter BTM / room photos in the gallery: once only (a photo deleted in Admin stays deleted).
  await once(client, 'seed_btm_gallery', async () => {
    const btm = ['/images/rooms/btm-butterfly-blush.webp', '/images/rooms/btm-lavender-mist.webp', '/images/rooms/btm-scarlet-red.webp',
      '/images/rooms/btm-shadow-suit.webp', '/images/rooms/btm-shadow-suit.webp', '/images/btm_celebration_stage.webp',
      '/images/btm_golden_arch.webp', '/images/btm_wings_arch.webp', '/images/ecity-celebration-theatre.webp', '/images/ecity-family-theatre.webp',
      '/images/hero_8388.webp', '/images/hero_8441.webp'];
    for (const url of btm) {
      if (!fs.existsSync(path.join(root, 'public', url))) continue;
      const category = url.includes('btm') ? 'BTM 1st Stage' : 'Electronic City';
      await client.query('INSERT INTO gallery (image_url, category, sort_order) SELECT $1,$2,-1 WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE image_url=$1)', [url, category]);
    }
  });
}

// Home page videos (Admin → Website → Videos): [file in /public/videos/celebrations, room, title].
const SHOWCASE_VIDEOS = [
  ['couple-birthday', 'Couple room', 'Birthday'], ['celebration-birthday', 'Celebration room', 'Birthday'], ['family-birthday', 'Family room', 'Birthday'],
  ['kids-first-birthday', 'Celebration room', 'Kids birthday'],
  ['couple-anniversary', 'Couple room', 'Anniversary'], ['celebration-anniversary', 'Celebration room', 'Anniversary'],
];

async function seedShowcaseVideos(client) {
  for (const [i, [file, room, title]] of SHOWCASE_VIDEOS.entries()) {
    if (!fs.existsSync(path.join(root, 'public', 'videos', 'celebrations', `${file}.mp4`))) continue;
    await client.query('INSERT INTO showcase_videos (title, room, video_url, poster_url, sort_order) VALUES ($1,$2,$3,$4,$5)',
      [title, room, `/videos/celebrations/${file}.mp4`, `/images/ecity/posters/${file}.webp`, i]);
  }
  console.log('Seeded home page videos.');
}

async function main() {
  await ensureDatabase();
  const reset = process.argv.includes('--reset');
  const client = await pool.connect();
  try {
    if (reset) {
      const bookingCount = await client.query("SELECT to_regclass('public.bookings') AS t");
      if (bookingCount.rows[0].t) {
        const cols = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name='bookings' AND column_name='ref'");
        if (cols.rowCount) {
          const n = await client.query('SELECT count(*)::int AS n FROM bookings');
          if (n.rows[0].n > 0 && !process.argv.includes('--force')) {
            throw new Error(`New-schema bookings table already has ${n.rows[0].n} rows. Re-run with --force to wipe.`);
          }
        }
      }
      const legacyCoupons = await client.query("SELECT 1 FROM information_schema.columns WHERE table_name='coupons' AND column_name='discount_value'");
      if (legacyCoupons.rowCount) {
        const { rows } = await client.query('SELECT code, discount_type, discount_value, min_booking_amount, is_active FROM coupons');
        legacyCouponRows.push(...rows);
      }
      console.log('Dropping legacy + current tables…');
      await client.query(`DROP TABLE IF EXISTS ${[...LEGACY_TABLES, ...TABLES].join(', ')} CASCADE`);
    }

    await client.query(fs.readFileSync(path.join(root, 'db', 'schema.sql'), 'utf8'));
    console.log('Schema ready.');

    const { rows: [{ n: branchCount }] } = await client.query('SELECT count(*)::int AS n FROM branches');
    if (branchCount > 0) {
      await ensureContent(client);
      const { rows: [{ n: userCount }] } = await client.query('SELECT count(*)::int AS n FROM users');
      if (!userCount) await createFirstAdmin(client);
      else await syncEnvAdmin(client);
      console.log('Data already present — content checked.');
      return;
    }

    const storePath = path.join(root, 'data', 'store.json');
    const seedPath = path.join(root, 'db', 'seed.json.gz');
    // Empty database (e.g. a new cloud deployment): load the starter content once - theatres, slots, prices,
    // packages, cakes, add-ons, photos and settings. Never runs again once branches exist.
    if (!fs.existsSync(storePath) && fs.existsSync(seedPath)) {
      await seedFromFile(client, seedPath);
      await ensureContent(client);
      await createFirstAdmin(client);
      console.log('Empty database - starter content loaded (no bookings).');
      return;
    }
    const store = fs.existsSync(storePath) ? JSON.parse(fs.readFileSync(storePath, 'utf8')) : {};
    await client.query('BEGIN');

    // Branches
    for (const [i, b] of (store.branches || []).entries()) {
      await client.query(
        'INSERT INTO branches (id, name, slug, address, phone, map_url, image_url, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
        [b.id, String(b.name).replace(/^Movie Bash\s*[–-]\s*/i, ''), b.slug, b.address, b.phone, b.map_url || '', b.image_url || '', i, b.is_active !== 0]
      );
    }

    // Theatres
    for (const [i, t] of (store.theatres || []).entries()) {
      const isCouple = t.capacity <= 2;
      await client.query(
        `INSERT INTO theatres (id, branch_id, name, base_capacity, max_capacity, base_price, extra_person_price, image_url, images, video_url, sort_order, is_active)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [t.id, t.branch_id, t.name, t.capacity, isCouple ? 4 : 12, t.custom_price || t.base_price, t.extra_person_price || (isCouple ? 99 : 150),
          t.image_url || '', JSON.stringify(t.images || (t.image_url ? [t.image_url] : [])), /\.mp4$/.test(t.video_url || '') ? t.video_url : '', i, t.is_active !== 0]
      );
    }

    // Slots
    for (const s of store.timeSlots || []) {
      await client.query('INSERT INTO slots (id, theatre_id, start_time, end_time, sort_order, is_active) VALUES ($1,$2,$3,$4,$5,$6)',
        [s.id, s.theatre_id, to24(s.start_time), to24(s.end_time), s.sort_order || 0, s.is_active !== 0]);
    }

    // Packages + per-theatre prices
    for (const [i, p] of PACKAGES.entries()) {
      const { rows: [pkg] } = await client.query(
        'INSERT INTO packages (name, tagline, includes, highlight, sort_order) VALUES ($1,$2,$3,$4,$5) RETURNING id',
        [p.name, p.tagline, JSON.stringify(p.includes), p.highlight, i]
      );
      for (const t of store.theatres || []) {
        await client.query('INSERT INTO package_prices (package_id, theatre_id, price) VALUES ($1,$2,$3)', [pkg.id, t.id, p.price(t)]);
      }
    }

    for (const [i, [name, file]] of CAKES.entries()) {
      await client.query('INSERT INTO cakes (name, image_url, price, sort_order) VALUES ($1,$2,$3,$4)', [name, `/images/cakes/${file}.webp`, 499, i]);
    }
    for (const [i, a] of ADDONS.entries()) {
      await client.query('INSERT INTO addons (category, name, description, price, image_url, sort_order) VALUES ($1,$2,$3,$4,$5,$6)', [...a, i]);
    }
    for (const [i, o] of (store.occasions || []).entries()) {
      await client.query('INSERT INTO occasions (name, image_url, sort_order, is_active) VALUES ($1,$2,$3,$4)',
        [o.name, OCCASION_IMAGES[o.name] || o.image_url || '', i, o.is_active !== 0]);
    }

    // Gallery from existing photos
    const imgDir = path.join(root, 'public', 'images');
    const photos = fs.readdirSync(imgDir).filter((f) => /^(couple|celebration|ambience)_\d+\.webp$/.test(f)).sort();
    for (const [i, f] of photos.entries()) {
      const category = f.startsWith('couple') ? 'Couples' : f.startsWith('celebration') ? 'Celebrations' : 'Ambience';
      await client.query('INSERT INTO gallery (image_url, category, sort_order) VALUES ($1,$2,$3)', [`/images/${f}`, category, i]);
    }

    // Coupons (store.json + whatever the old Postgres table had)
    for (const c of [...(store.coupons || []), ...legacyCouponRows]) {
      await client.query(
        'INSERT INTO coupons (code, discount_type, value, min_amount, is_active) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (code) DO NOTHING',
        [String(c.code).toUpperCase(), c.discount_type === 'percentage' ? 'percent' : 'flat', Math.round(c.discount_value), Math.round(c.min_booking_amount || 0), c.is_active !== 0]
      );
    }

    // Users
    const users = store.adminUsers || [];
    for (const u of users) {
      await client.query('INSERT INTO users (name, username, phone, password_hash, role, branch_id, is_active) VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [u.name, u.username || u.email, u.phone || '', u.password_hash, u.role === 'super_admin' ? 'admin' : 'staff', u.branch_id || null, u.is_active !== 0]);
    }
    if (!users.length) await createFirstAdmin(client);

    // Settings
    const s = store.siteSettings || {};
    const settings = {
      business: {
        name: 'Movie Bash', phone: s.business_phone || s.primary_phone || '+91 99029 23656',
        whatsapp: s.whatsapp_number || '919902923656', email: s.business_email || 'bookmoviebash@gmail.com',
        instagram: s.instagram_url || '', facebook: s.facebook_url || '', youtube: s.youtube_url || '',
      },
      payment: { upi_id: '9902923656@upi', payee_name: 'Movie Bash', advance_amount: Number(s.advance_amount_flat) || 500 },
      booking: { slot_cutoff_minutes: 30, hold_minutes: 20, max_extra_hours: 0 },
      hero: {
        title: 'Your private theatre for every celebration',
        subtitle: 'Birthdays, anniversaries, proposals and movie nights — in Electronic City and BTM 1st Stage, Bengaluru.',
        images: ['/images/hero_8388.webp', '/images/btm_celebration_stage.webp', '/images/couple_2.webp', '/images/celebration_5.webp'],
      },
      announcement: { enabled: !!s.announcement_enabled, text: s.announcement_text || '' },
      stats: { rating: 5, reviews: Number(s.google_reviews_count) || 0, celebrations: Number(s.bookings_completed_count) || 0 },
    };
    for (const [key, value] of Object.entries(settings)) {
      await client.query('INSERT INTO settings (key, value) VALUES ($1,$2)', [key, JSON.stringify(value)]);
    }

    // Bookings
    const slotById = new Map((store.timeSlots || []).map((x) => [x.id, x]));
    const theatreById = new Map((store.theatres || []).map((x) => [x.id, x]));
    const statusMap = { confirmed: 'confirmed', completed: 'completed', closed: 'completed', cancelled: 'cancelled', pending: 'payment_review' };
    for (const b of store.bookings || []) {
      const slot = slotById.get(b.slot_id);
      const theatre = theatreById.get(b.theatre_id);
      if (!slot || !theatre) { console.warn('Skipping booking with unknown slot/theatre:', b.booking_ref); continue; }
      const items = [
        ...(b.addons || []).map((a) => ({ kind: 'addon', addon_id: null, name: a.addon_name || a.name, price: Number(a.price) || 0, qty: Number(a.quantity) || 1 })),
        ...(b.custom_item_name ? [{ kind: 'custom', name: b.custom_item_name, price: Number(b.custom_item_amount) || 0, qty: 1 }] : []),
      ];
      const itemsAmount = items.reduce((sum, it) => sum + it.price * it.qty, 0);
      const extraPersons = Number(b.extra_guests || b.extra_persons || 0);
      const { rows: [row] } = await client.query(
        `INSERT INTO bookings (ref, branch_id, theatre_id, slot_id, booking_date, slot_label, customer_name, phone, whatsapp, email,
           special_person_name, occasion, package_name, base_amount, guests, extra_persons, extra_person_amount, cake_name, items, items_amount,
           discount, total, amount_paid, status, source, payment_screenshot, notes, cancel_reason, is_deleted, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30) RETURNING id`,
        [b.booking_ref, b.branch_id, b.theatre_id, b.slot_id, b.booking_date, `${slot.start_time} – ${slot.end_time}`,
          b.customer_name, String(b.customer_phone || '').replace(/\D/g, '').slice(-10), b.whatsapp_number || '', b.customer_email || '',
          b.special_person_name || b.screen_name || '', (store.occasions || []).find((o) => o.id === b.occasion_id)?.name || b.occasion || '',
          b.package_type ? b.package_type[0].toUpperCase() + b.package_type.slice(1) : 'Custom', Math.round(b.subtotal || 0) - extraPersons * (theatre.extra_person_price || 150),
          b.guests || theatre.capacity, extraPersons, extraPersons * (theatre.extra_person_price || 150), b.cake_flavor || '', JSON.stringify(items), itemsAmount,
          Math.round(b.discount || 0), Math.round(b.total || 0), Math.round(b.advance_paid || 0),
          b.is_deleted ? 'cancelled' : (statusMap[b.status] || 'confirmed'), b.source === 'web' ? 'website' : (b.source || 'website'),
          b.payment_screenshot || '', b.notes || '', b.cancelled_reason || '', !!b.is_deleted, b.created_at || new Date().toISOString()]
      );
      if (b.advance_paid > 0) {
        await client.query('INSERT INTO payments (booking_id, amount, method, note, recorded_by) VALUES ($1,$2,$3,$4,$5)',
          [row.id, Math.round(b.advance_paid), b.payment_type || 'upi', 'Advance (imported)', 'migration']);
      }
    }

    await client.query('UPDATE bookings b SET package_id=p.id FROM packages p WHERE lower(b.package_name)=lower(p.name)');
    await client.query('UPDATE bookings b SET cake_id=c.id FROM cakes c WHERE lower(b.cake_name)=lower(c.name)');

    // Keep sequences in step with explicitly inserted ids
    for (const t of ['branches', 'theatres', 'slots']) {
      await client.query(`SELECT setval(pg_get_serial_sequence('${t}','id'), COALESCE((SELECT MAX(id) FROM ${t}), 1))`);
    }
    await client.query('COMMIT');
    await ensureContent(client);
    console.log(fs.existsSync(storePath) ? 'Imported data from data/store.json.' : 'Fresh database ready (restore a backup to load your data).');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => { console.error('Setup failed:', err.message); process.exit(1); });
