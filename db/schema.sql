-- Movie Bash — PostgreSQL schema (single source of truth)
-- Idempotent: safe to run on every boot.

CREATE TABLE IF NOT EXISTS files (
  id          UUID PRIMARY KEY,
  mime        TEXT NOT NULL,
  size        INTEGER NOT NULL,
  name        TEXT,
  data        BYTEA NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS branches (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  address     TEXT NOT NULL DEFAULT '',
  phone       TEXT NOT NULL DEFAULT '',
  map_url     TEXT NOT NULL DEFAULT '',
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS theatres (
  id                  SERIAL PRIMARY KEY,
  branch_id           INTEGER NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  base_capacity       INTEGER NOT NULL DEFAULT 2,
  max_capacity        INTEGER NOT NULL DEFAULT 6,
  base_price          INTEGER NOT NULL DEFAULT 899,   -- "Custom" (room only) price
  extra_person_price  INTEGER NOT NULL DEFAULT 150,
  image_url           TEXT NOT NULL DEFAULT '',
  images              JSONB NOT NULL DEFAULT '[]',
  video_url           TEXT NOT NULL DEFAULT '',
  sort_order          INTEGER NOT NULL DEFAULT 0,
  is_active           BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS slots (
  id          SERIAL PRIMARY KEY,
  theatre_id  INTEGER NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  start_time  TEXT NOT NULL,   -- HH:MM (24h)
  end_time    TEXT NOT NULL,   -- HH:MM (24h), may be past midnight
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS packages (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  tagline     TEXT NOT NULL DEFAULT '',
  includes    JSONB NOT NULL DEFAULT '[]',
  includes_cake BOOLEAN NOT NULL DEFAULT true,
  image_url   TEXT NOT NULL DEFAULT '',
  highlight   BOOLEAN NOT NULL DEFAULT false,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS package_prices (
  package_id     INTEGER NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  theatre_id     INTEGER NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  PRIMARY KEY (package_id, theatre_id)
);

CREATE TABLE IF NOT EXISTS cakes (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  price       INTEGER NOT NULL DEFAULT 0,   -- charged only when not included in package
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS addons (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL DEFAULT 'Extras',
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price       INTEGER NOT NULL DEFAULT 0,
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS occasions (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS gallery (
  id          SERIAL PRIMARY KEY,
  image_url   TEXT NOT NULL,
  caption     TEXT NOT NULL DEFAULT '',
  category    TEXT NOT NULL DEFAULT 'General',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS coupons (
  id            SERIAL PRIMARY KEY,
  code          TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL DEFAULT 'flat',      -- flat | percent
  value         INTEGER NOT NULL DEFAULT 0,
  min_amount    INTEGER NOT NULL DEFAULT 0,
  usage_limit   INTEGER,                           -- null = unlimited
  used_count    INTEGER NOT NULL DEFAULT 0,
  show_on_site  BOOLEAN NOT NULL DEFAULT true,
  expires_on    DATE,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  username      TEXT NOT NULL UNIQUE,
  phone         TEXT NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff',     -- admin | staff
  branch_id     INTEGER REFERENCES branches(id) ON DELETE SET NULL,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id                   SERIAL PRIMARY KEY,
  ref                  TEXT NOT NULL UNIQUE,
  branch_id            INTEGER NOT NULL REFERENCES branches(id),
  theatre_id           INTEGER NOT NULL REFERENCES theatres(id),
  slot_id              INTEGER NOT NULL REFERENCES slots(id),
  booking_date         DATE NOT NULL,
  slot_label           TEXT NOT NULL DEFAULT '',

  customer_name        TEXT NOT NULL,
  phone                TEXT NOT NULL,
  whatsapp             TEXT NOT NULL DEFAULT '',
  email                TEXT NOT NULL DEFAULT '',
  special_person_name  TEXT NOT NULL DEFAULT '',
  occasion             TEXT NOT NULL DEFAULT '',

  package_id           INTEGER REFERENCES packages(id) ON DELETE SET NULL,
  package_name         TEXT NOT NULL DEFAULT 'Custom',
  base_amount          INTEGER NOT NULL DEFAULT 0,
  guests               INTEGER NOT NULL DEFAULT 2,
  extra_persons        INTEGER NOT NULL DEFAULT 0,
  extra_person_amount  INTEGER NOT NULL DEFAULT 0,
  cake_id              INTEGER REFERENCES cakes(id) ON DELETE SET NULL,
  cake_name            TEXT NOT NULL DEFAULT '',
  cake_amount          INTEGER NOT NULL DEFAULT 0,
  items                JSONB NOT NULL DEFAULT '[]',  -- [{kind:'addon'|'custom', addon_id?, name, price, qty}]
  items_amount         INTEGER NOT NULL DEFAULT 0,
  coupon_code          TEXT NOT NULL DEFAULT '',
  discount             INTEGER NOT NULL DEFAULT 0,
  total                INTEGER NOT NULL DEFAULT 0,
  amount_paid          INTEGER NOT NULL DEFAULT 0,

  status               TEXT NOT NULL DEFAULT 'awaiting_payment',
                       -- awaiting_payment | payment_review | confirmed | completed | cancelled
  source               TEXT NOT NULL DEFAULT 'website',
                       -- website | whatsapp | walkin | phone | instagram | other
  payment_screenshot   TEXT NOT NULL DEFAULT '',
  hold_expires_at      TIMESTAMPTZ,
  notes                TEXT NOT NULL DEFAULT '',
  cancel_reason        TEXT NOT NULL DEFAULT '',
  created_by           TEXT NOT NULL DEFAULT 'customer',
  closed_at            TIMESTAMPTZ,
  closed_by            TEXT NOT NULL DEFAULT '',
  is_deleted           BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
  ON bookings (theatre_id, booking_date, slot_id)
  WHERE is_deleted = false AND status <> 'cancelled';
CREATE INDEX IF NOT EXISTS bookings_date_idx   ON bookings (booking_date);
CREATE INDEX IF NOT EXISTS bookings_phone_idx  ON bookings (phone);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON bookings (status);

CREATE TABLE IF NOT EXISTS payments (
  id          SERIAL PRIMARY KEY,
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount      INTEGER NOT NULL,
  method      TEXT NOT NULL DEFAULT 'upi',   -- upi | cash | card | bank
  note        TEXT NOT NULL DEFAULT '',
  recorded_by TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS booking_events (
  id          SERIAL PRIMARY KEY,
  booking_id  INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  details     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id          SERIAL PRIMARY KEY,
  booking_id  INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
  to_phone    TEXT NOT NULL,
  kind        TEXT NOT NULL,                -- confirmation | reminder | reschedule | cancellation | custom
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'queued', -- queued | sent | failed | not_configured
  provider_id TEXT NOT NULL DEFAULT '',
  error       TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  actor       TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT NOT NULL DEFAULT '',
  details     JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Forward-compatible column additions for existing databases
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cake_id INTEGER REFERENCES cakes(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS testimonials (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  occasion    TEXT NOT NULL DEFAULT '',
  rating      INTEGER NOT NULL DEFAULT 5,
  text        TEXT NOT NULL,
  image_url   TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS faqs (
  id          SERIAL PRIMARY KEY,
  question    TEXT NOT NULL,
  answer      TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS enquiries (
  id             SERIAL PRIMARY KEY,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  email          TEXT NOT NULL DEFAULT '',
  branch         TEXT NOT NULL DEFAULT '',
  occasion       TEXT NOT NULL DEFAULT '',
  preferred_date DATE,
  message        TEXT NOT NULL DEFAULT '',
  status         TEXT NOT NULL DEFAULT 'new',   -- new | contacted | converted | closed
  notes          TEXT NOT NULL DEFAULT '',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS promos (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  text         TEXT NOT NULL DEFAULT '',
  image_url    TEXT NOT NULL DEFAULT '',
  coupon_code  TEXT NOT NULL DEFAULT '',
  link_url     TEXT NOT NULL DEFAULT '/book',
  button_label TEXT NOT NULL DEFAULT 'Book now',
  placement    TEXT NOT NULL DEFAULT 'popup',   -- popup | banner
  starts_on    DATE,
  ends_on      DATE,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Upgrades (idempotent) ─────────────────────────────────────────────────
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cake_kg NUMERIC(3,1) NOT NULL DEFAULT 0.5;
ALTER TABLE packages ADD COLUMN IF NOT EXISTS included_addons JSONB NOT NULL DEFAULT '[]';  -- shown to guests: what the package already covers
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS package_includes JSONB NOT NULL DEFAULT '[]'; -- snapshot of the package inclusions at booking time
ALTER TABLE cakes ALTER COLUMN price SET DEFAULT 499;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='bookings' AND column_name='cake_size') THEN
    UPDATE bookings SET cake_kg = 1 WHERE cake_size = '1kg';
    ALTER TABLE bookings DROP COLUMN cake_size;
  END IF;
END $$;
ALTER TABLE cakes DROP COLUMN IF EXISTS price_1kg;

-- ─── Indexes for filters, search, pagination and joins ─────────────────────
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS bookings_live_date_idx   ON bookings (booking_date DESC, id DESC) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS bookings_branch_date_idx ON bookings (branch_id, booking_date);
CREATE INDEX IF NOT EXISTS bookings_theatre_date_idx ON bookings (theatre_id, booking_date);
CREATE INDEX IF NOT EXISTS bookings_source_idx      ON bookings (source);
CREATE INDEX IF NOT EXISTS bookings_created_idx     ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_hold_idx        ON bookings (hold_expires_at) WHERE status = 'awaiting_payment';
CREATE INDEX IF NOT EXISTS bookings_name_trgm_idx   ON bookings USING gin (customer_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS bookings_special_trgm_idx ON bookings USING gin (special_person_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS bookings_ref_trgm_idx    ON bookings USING gin (ref gin_trgm_ops);
CREATE INDEX IF NOT EXISTS payments_booking_idx     ON payments (booking_id);
CREATE INDEX IF NOT EXISTS events_booking_idx       ON booking_events (booking_id, created_at DESC);
CREATE INDEX IF NOT EXISTS wa_booking_idx           ON whatsapp_messages (booking_id);
CREATE INDEX IF NOT EXISTS wa_created_idx           ON whatsapp_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS wa_status_idx            ON whatsapp_messages (status);
CREATE INDEX IF NOT EXISTS enquiries_status_idx     ON enquiries (status, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_created_idx        ON audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS theatres_branch_idx      ON theatres (branch_id);
CREATE INDEX IF NOT EXISTS slots_theatre_idx        ON slots (theatre_id);
CREATE INDEX IF NOT EXISTS package_prices_theatre_idx ON package_prices (theatre_id);
CREATE INDEX IF NOT EXISTS gallery_live_idx         ON gallery (featured DESC, sort_order) WHERE is_active;

-- ─── Extra hours & slot blocks ─────────────────────────────────────────────
ALTER TABLE theatres ADD COLUMN IF NOT EXISTS extra_hour_price INTEGER NOT NULL DEFAULT 449;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_hours INTEGER NOT NULL DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS extra_hour_amount INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS slot_blocks (
  id          SERIAL PRIMARY KEY,
  theatre_id  INTEGER NOT NULL REFERENCES theatres(id) ON DELETE CASCADE,
  block_date  DATE NOT NULL,
  slot_id     INTEGER REFERENCES slots(id) ON DELETE CASCADE,  -- NULL = whole day
  reason      TEXT NOT NULL DEFAULT '',
  created_by  TEXT NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS slot_blocks_lookup_idx ON slot_blocks (theatre_id, block_date);
-- Actual start/end of the booked slot (slots can shift later when an earlier booking takes extra hours).
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_start TEXT NOT NULL DEFAULT '';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS slot_end TEXT NOT NULL DEFAULT '';
