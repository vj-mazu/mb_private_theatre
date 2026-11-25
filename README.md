# Movie Bash

Private theatre booking website and admin panel (Next.js 14 + PostgreSQL).

## Setup

```bash
npm install
cp .env.example .env.local      # fill DATABASE_URL, JWT_SECRET, WhatsApp keys
npm run db:setup                # creates tables (safe to re-run)
npm run dev                     # http://localhost:3105
```

`node scripts/db-setup.js --reset` rebuilds the database from scratch (refuses if bookings exist unless `--force`).

## Structure

| Path | What it is |
| --- | --- |
| `db/schema.sql` | The whole database schema |
| `lib/booking-rules.ts` | Shared pricing, slot timing and expiry rules (client + server) |
| `lib/server/` | Database, booking engine, WhatsApp, auth, CRUD |
| `app/(site)/` | Public website: home, `/book`, `/ticket/[ref]`, gallery, policies |
| `app/admin/` | Admin panel |
| `app/api/` | API routes (`/api/admin/*` require sign-in) |

**Docs:** [DEPLOYMENT.md](DEPLOYMENT.md) (Hostinger, one-command install, backups, security) · [PRD.md](PRD.md) (rules & architecture).
On Windows, double-click `start-local.bat`.

## Booking flow

1. Customer picks slot → package → cake & add-ons → details. Slots close automatically
   `slot_cutoff_minutes` after they start (Admin → Settings).
2. The slot is held for `hold_minutes` while the customer pays the advance by UPI QR and uploads the screenshot.
   Unpaid holds are released automatically.
3. Booking shows as **Verify payment** in admin → staff confirms → guest gets the ticket on WhatsApp.
4. On the day, staff can add/remove extras and **Close** the booking with the final payment.

Walk-in, WhatsApp and phone bookings are created from **Admin → New booking** and are confirmed immediately.

## WhatsApp

Uses the official Meta WhatsApp Cloud API (`lib/server/whatsapp.ts`). Set `WHATSAPP_TOKEN` and
`WHATSAPP_PHONE_NUMBER_ID`. Business-initiated messages need approved templates — see `.env.example`
for the variable order. Every message (sent, failed or not configured) is listed in **Admin → WhatsApp log**.

## Backups

- Admin → Settings → Backup downloads a full JSON backup (optionally with images).
- `npm run db:backup` writes a gzipped backup to `./backups` and keeps the latest 7 (the server installer schedules it nightly at 12:00 midnight IST). `npm test` runs the automatic tests (see DEPLOYMENT.md). `npm run db:restore -- FILE --yes` restores one.
- Uploaded images (payment screenshots, gallery, packages) are stored in PostgreSQL, so database backups include them.
