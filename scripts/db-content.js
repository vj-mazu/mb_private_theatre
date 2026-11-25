/**
 * Movie Bash — website content kept up to date on every start (used by scripts/db-setup.js).
 * Each change only replaces old default values or runs once (see `once`), so edits made in Admin are never overwritten.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

// Old BTM 1st Stage room photos (replaced by the new themes in Dec 2026) and the new BTM gallery photos.
const BTM_OLD_PHOTOS = ['/images/rooms/btm-butterfly-blush.webp', '/images/rooms/btm-lavender-mist.webp', '/images/rooms/btm-scarlet-red.webp',
  '/images/rooms/btm-scarlet-red-alt.webp', '/images/rooms/btm-shadow-suit.webp', '/images/rooms/room_7_1795000596195.webp',
  '/images/btm_celebration_stage.webp', '/images/btm_golden_arch.webp', '/images/btm_wings_arch.webp'];
const BTM_GALLERY = ['gold-luxe-birthday-1', 'red-ruby-birthday-2', 'green-emerald-kids-1', 'gold-luxe-bride-2', 'red-ruby-proposal-2', 'green-emerald-groom-7'];

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

  // BTM 1st Stage rooms renamed to the new themes (photos from the owner's Drive). Same rooms, so slots, prices, capacity and
  // bookings stay. Old BTM photos and videos are removed. Purple Royale has no photos yet (added later in Admin).
  await once(client, 'btm_rooms_renamed_dec2026', async () => {
    const B = (n) => `/images/btm/${n}.webp`;
    for (const [from, to, photos] of [
      ['Butterfly Blush', 'Gold Luxe', ['gold-luxe-birthday-1', 'gold-luxe-birthday-4', 'gold-luxe-anniversary-1', 'gold-luxe-anniversary-3', 'gold-luxe-bride-2', 'gold-luxe-bride-4']],
      ['Lavender Mist', 'Purple Royale', []],
      ['Scarlet Red', 'Red Ruby', ['red-ruby-birthday-2', 'red-ruby-birthday-4', 'red-ruby-anniversary-2', 'red-ruby-anniversary-3', 'red-ruby-proposal-2', 'red-ruby-proposal-1']],
      ['Shadow Suit', 'Green Emerald', ['green-emerald-kids-1', 'green-emerald-kids-14', 'green-emerald-anniversary-2', 'green-emerald-bride-2', 'green-emerald-groom-7', 'green-emerald-kids-16', 'green-emerald-kids-2']],
    ]) {
      const urls = photos.map(B);
      await client.query("UPDATE theatres SET name=$2, image_url=$3, images=$4, video_url='' WHERE name=$1", [from, to, urls[0] || '', JSON.stringify(urls)]);
    }
    await client.query('DELETE FROM gallery WHERE image_url = ANY($1::text[])', [BTM_OLD_PHOTOS]);
    for (const [i, n] of BTM_GALLERY.entries()) {
      await client.query("INSERT INTO gallery (image_url, category, sort_order) SELECT $1, 'BTM 1st Stage', $2 WHERE NOT EXISTS (SELECT 1 FROM gallery WHERE image_url=$1)", [B(n), i]);
    }
  });

  // Anything still pointing at a deleted old BTM photo (branch card, hero/story settings, packages, occasions) gets the new one.
  // Safe on every start: it only touches those old file paths, which no longer exist.
  const btmSwap = [['/images/btm_celebration_stage.webp', 'gold-luxe-birthday-1'], ['/images/btm_golden_arch.webp', 'gold-luxe-bride-2'],
    ['/images/btm_wings_arch.webp', 'green-emerald-kids-1'], ['/images/rooms/btm-butterfly-blush.webp', 'gold-luxe-birthday-1'],
    ['/images/rooms/btm-lavender-mist.webp', 'gold-luxe-birthday-4'], ['/images/rooms/btm-scarlet-red.webp', 'red-ruby-birthday-2'],
    ['/images/rooms/btm-scarlet-red-alt.webp', 'red-ruby-birthday-4'], ['/images/rooms/btm-shadow-suit.webp', 'green-emerald-kids-1'],
    ['/images/rooms/room_7_1795000596195.webp', 'green-emerald-kids-14']];
  for (const [from, n] of btmSwap) {
    const to = `/images/btm/${n}.webp`;
    await client.query('UPDATE branches SET image_url=$2 WHERE image_url=$1', [from, to]);
    await client.query('UPDATE branches SET story_image=$2 WHERE story_image=$1', [from, to]);
    for (const t of ['packages', 'occasions', 'theatres']) await client.query(`UPDATE ${t} SET image_url=$2 WHERE image_url=$1`, [from, to]);
    await client.query('UPDATE settings SET value = replace(value::text, $1, $2)::jsonb WHERE value::text LIKE $3', [from, to, `%${from}%`]);
  }

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
  // Short slots: couple room packages are ₹300 less (other rooms keep the ₹400 default). Once only, so Admin edits stay.
  await once(client, 'short_slot_couple_300', () =>
    client.query("UPDATE theatres SET short_slot_discount=300 WHERE name='Couple Theater' AND short_slot_discount=400"));
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
    const btm = [...BTM_GALLERY.map((n) => `/images/btm/${n}.webp`), '/images/ecity-celebration-theatre.webp', '/images/ecity-family-theatre.webp',
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

module.exports = { ensureContent, seedShowcaseVideos, once };
