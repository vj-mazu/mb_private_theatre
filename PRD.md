# Movie Bash: Product Requirements

## Purpose
Movie Bash runs private theatres for celebrations in Bengaluru (Electronic City, BTM 2nd Stage).
The product is the public website, where guests discover rooms and book them online, and an admin panel,
where staff take walk-in, WhatsApp and phone bookings and run the business.

## Users
| User | Needs |
| --- | --- |
| Guest | See rooms, packages and prices; book a slot in under 2 minutes; pay a small advance; get a ticket with location |
| Staff | Take and edit bookings for their branch, verify payments, add extras on the day, close bookings and collect the balance. No revenue view |
| Admin | Everything staff can do, plus pricing, content, coupons, promotions, staff accounts, revenue reports, backups |

## Booking rules
- A **slot** stops being bookable `slot_cutoff_minutes` after it starts (default 30, set in Settings).
- A website booking **holds** the slot for `hold_minutes` (default 20) until the payment screenshot is uploaded. Unpaid holds are released automatically.
- Only one active booking per theatre, date and slot (enforced by a database unique index).
- **Price** = package price for that theatre (or the theatre's Custom price)
  + extra guests × extra-person price
  + cake + add-ons + custom items − discount.
- **Cake** is sold in 500 g units, 0.5–5 kg, at ₹499 per 500 g (editable per flavour). A package includes the first 500 g.
- **Package inclusions**: a package can list add-ons it already includes (for example, 1 fog entry). When a guest adds one, the included quantity is free and only the extra quantity is charged.
- **Extra hours**: up to 2 per booking at the theatre's extra-hour price (default ₹449). Slots normally follow the configured timetable.
  When a booking runs past its slot, the following free slots move later to start 15 min after it (cascading); the last slot of the day never moves,
  and a moved slot that no longer fits before the next booked/blocked slot becomes unavailable. Extra hours are refused if they would reach a booked or blocked slot.
  Each booking stores its actual start/end, so its ticket time never changes afterwards.
- **Blocked slots**: admins can block a slot or a whole day per theatre (Admin → Block slots); a slot with a booking cannot be blocked.
- **Concurrency**: every create/edit/reschedule locks that theatre-day in PostgreSQL, recomputes the schedule and only then writes, so overlapping or duplicate bookings are impossible.
- **Coupons** are validated on the server (active, not expired, under the usage limit, minimum amount). A coupon that's switched off disappears from the website and from linked promotions.
- All amounts are recalculated on the server. Prices sent by the browser are never trusted.

## Booking lifecycle
`awaiting_payment` (website hold) → `payment_review` (screenshot uploaded) → `confirmed` → `completed` (closed), or → `cancelled`.
Staff bookings start as `confirmed`. Editing date or slot is a reschedule, and the guest is notified.
Closing a booking lets staff add or remove add-ons and custom items, set a discount and record the final payment.

## Notifications (WhatsApp Cloud API)
Messages are sent on receipt, confirmation, reschedule and cancellation, and on demand (reminder or custom).
The confirmation is a booking sheet: ticket number, special person, WhatsApp, occasion, branch, theatre, timings, package,
extra persons, cake, add-ons, extras, discount, total, advance, balance, payment type, booking source, map link,
helpline and the "good to know" notes. Every message is logged in Admin → WhatsApp log.

## Website
Home (hero, occasions, story, venues, packages, cakes, add-ons, how it works, reviews, gallery with Instagram reels, FAQ, enquiry),
Our story, Gallery, Book (4 steps → payment → ticket), Ticket, Policies.
All content (images, text, prices, packages, cakes, add-ons, occasions, coupons, promotions, FAQs, testimonials, reels, rating) is editable in admin.

## Admin
Dashboard · Bookings (filters, search, pagination, Excel export) · New booking · Enquiries · Revenue · Coupons (with code generator) ·
Promotions & ads · WhatsApp log · Branches & packages (branches, theatres, slots, packages, cakes, add-ons, occasions) · Gallery ·
Website content · Staff · Settings & backup.

## Non-functional
- Mobile-first; every page works at 360 px width.
- Public data is cached on the server and cleared automatically on any admin change. Pages respond in under 100 ms on the server.
- Images are served responsively at quality 90. Uploads are compressed on the server.
- Security: see `DEPLOYMENT.md` → Security.
- Data: one PostgreSQL database with automatic schema upgrades, indexes for every list and filter, and nightly backups.

## Architecture
```
app/(site)        public pages (server components read cached data)
app/admin         admin panel (client pages calling /api/admin/*)
app/api           JSON API (public: catalog, availability, bookings, coupons, enquiries, files; admin: everything else)
lib/booking-rules shared pricing & time rules (browser + server use the same code)
lib/server/*      db, auth, booking engine, CRUD, cache, WhatsApp, files, promos
db/schema.sql     the whole schema + idempotent upgrades + indexes
scripts/          db-setup (auto on start) · db-backup · db-restore
deploy/install.sh one-command server install
```
