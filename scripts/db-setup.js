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

const url = process.env.DATABASE_URL;
if (!url) { console.error('DATABASE_URL is not set'); process.exit(1); }
const ssl = process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false;
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
  'audit_log', 'whatsapp_messages', 'booking_events', 'payments', 'bookings', 'users', 'coupons', 'gallery',
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
  ['Entry', 'Bubble Entry', 'Bubble machine for a dreamy entry.', 399, '/images/addons/bubble-entry.webp'],
  ['Decor', 'LED Name / Number Board', 'Custom glowing name or number.', 299, '/images/addons/led-name-board.webp'],
  ['Gifts', 'Red Rose Bouquet', 'Fresh hand-tied red roses.', 499, '/images/addons/rose-bouquet.webp'],
  ['Gifts', 'Teddy Mascot Surprise', 'Giant teddy mascot appearance.', 699, '/images/addons/teddy-mascot.webp'],
  ['Photography', 'DSLR Photography', 'Dedicated photographer, edited photos.', 999, '/images/addons/dslr-photography.webp'],
  ['Photography', 'iPhone Reel', 'Short edited reel shot on iPhone.', 499, '/images/addons/iphone-reel.webp'],
  ['Extras', 'Party Poppers (2)', 'Confetti poppers for the cake moment.', 149, '/images/addons/party-poppers.webp'],
];

const PACKAGES = [
  {
    name: 'Standard', tagline: 'Everything you need for a perfect celebration', highlight: true,
    includes: ['500g cake (choose flavour)', 'Fog entry (2 pots)', 'Celebration decoration', 'LED name & number board', 'Neon light (Happy Birthday / Love)', '4K projector & Dolby sound'],
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
async function createFirstAdmin(client) {
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
  ['Is parking available?', 'Yes, 2-wheeler and 4-wheeler parking is available at both branches.'],
  ['Can we bring pets?', 'No, pets are not allowed inside the theatres.'],
  ['What if a technical issue occurs during the event?', 'A partial refund or rescheduling is provided as per our terms and conditions.'],
  ['What decorations do you have?', 'Love, Birthday, Anniversary and Celebration themes, plus custom decoration on request.'],
  ['What add-ons do you have?', 'Cake, snacks, fog entry, cold pyro, special decoration, baby cart entry, photography and more.'],
  ['When can we book add-ons?', 'While booking the room, or anytime up to 24 hours before the event.'],
  ['Can we watch our own movie or videos?', 'Yes. Use your own OTT login (Netflix, Prime, Hotstar and more) or bring a pen drive.'],
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
  body: 'Movie Bash began with a simple idea: celebrations feel bigger when they are private. Today our theatres in Electronic City and BTM 2nd Stage host birthdays, anniversaries, proposals and family movie nights every day.\n\nEvery room has a big 4K screen, Dolby sound, comfortable recliners and a decorated celebration corner. Bring your own movie, choose your cake and decoration, and the whole theatre is yours.',
  quote: 'Walk in, see the setup, hit play on your favourite movie… and watch the moment turn special.',
  image: '/images/ecity-family-theatre.webp',
};

/** Seeds website content tables when empty. Safe to run repeatedly. */
async function ensureContent(client) {
  const count = async (t) => (await client.query(`SELECT count(*)::int AS n FROM ${t}`)).rows[0].n;
  if (!(await count('faqs'))) {
    for (const [i, [q, a]] of FAQS.entries()) await client.query('INSERT INTO faqs (question, answer, sort_order) VALUES ($1,$2,$3)', [q, a, i]);
    console.log('Seeded FAQs.');
  }
  if (!(await count('testimonials'))) {
    for (const [i, [n, o, t]] of TESTIMONIALS.entries()) await client.query('INSERT INTO testimonials (name, occasion, text, sort_order) VALUES ($1,$2,$3,$4)', [n, o, t, i]);
    console.log('Seeded testimonials.');
  }
  await client.query("INSERT INTO settings (key, value) VALUES ('story', $1) ON CONFLICT (key) DO NOTHING", [JSON.stringify(STORY)]);
  const btm = ['/images/rooms/btm-butterfly-blush.webp', '/images/rooms/btm-lavender-mist.webp', '/images/rooms/btm-scarlet-red.webp',
    '/images/rooms/btm-shadow-suit.webp', '/images/rooms/btm-shadow-suit.webp', '/images/btm_celebration_stage.webp',
    '/images/btm_golden_arch.webp', '/images/btm_wings_arch.webp', '/images/ecity-celebration-theatre.webp', '/images/ecity-family-theatre.webp',
    '/images/hero_8388.webp', '/images/hero_8441.webp'];
  for (const url of btm) {
    if (!fs.existsSync(path.join(root, 'public', url))) continue;
    const category = url.includes('btm') ? 'BTM 2nd Stage' : 'Electronic City';
    await client.query('INSERT INTO gallery (image_url, category, sort_order) SELECT $1,$2,-1 WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE image_url=$1)', [url, category]);
  }
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
      console.log('Data already present — content checked.');
      return;
    }

    const storePath = path.join(root, 'data', 'store.json');
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
        [t.id, t.branch_id, t.name, t.capacity, isCouple ? 4 : 12, t.custom_price || t.base_price, t.extra_person_price || 150,
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
        subtitle: 'Birthdays, anniversaries, proposals and movie nights — in Electronic City and BTM 2nd Stage, Bengaluru.',
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
