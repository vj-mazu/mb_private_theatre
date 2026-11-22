# Deploying Movie Bash on Hostinger

You need a **Hostinger VPS** (KVM 1 or higher). Shared, "Web" and "Cloud" hosting only offer MySQL and
can't run this site, because it needs Node.js and PostgreSQL.

The installer does everything in **one command**: the website, the PostgreSQL database, free HTTPS,
firewall, and a daily backup. When the site starts it creates the database, the tables and the indexes,
and the first admin account if there is none.

---

## 1. Create the VPS

1. hPanel → **VPS** → OS: **Ubuntu 24.04 with Docker**.
2. Note the VPS **IP address**. Set a strong root password, or add your SSH key.

## 2. Point your domain at it

hPanel → **Domains** → your domain → **DNS**:

| Type | Name | Value |
| --- | --- | --- |
| A | `@` | VPS IP |
| A | `www` | VPS IP |

Allow up to an hour for DNS to update. HTTPS works once it has.

## 3. Install, one command

Open hPanel → VPS → **Browser terminal** (or `ssh root@YOUR_IP`) and run:

```bash
git clone https://github.com/vj-mazu/mb_private_theatre.git /opt/moviebash && cd /opt/moviebash && sudo bash deploy/install.sh
```

If the repository is private, Git asks for a username and a password. Use a GitHub personal access token as the password.

The installer asks for:

| Question | Example | Note |
| --- | --- | --- |
| Domain | `moviebash.in` | without `https://` |
| Database name | `moviebash` | any name, letters/numbers/underscore |
| Database user | `moviebash` | |
| Database password | press Enter | generates a strong one; if you type your own, avoid `@ : / ?` |
| Admin username / password | `admin` / press Enter | printed at the end; change it after logging in |
| WhatsApp token / phone-number ID | optional | can be added to `.env` later |

When it finishes, it prints your website and admin URLs and the admin login.
Check it at `https://your-domain/api/health`, which should return `{"ok":true,"db":"up"}`.

## 4. Move your existing data

On your current PC: **Admin → Settings & backup → Backup with images** downloads a `.json` file.
Upload it to the server (hPanel File Manager → `/opt/moviebash/backups/`), then run:

```bash
cd /opt/moviebash
docker compose exec app node scripts/db-restore.js backups/YOUR-FILE.json --yes
```

This **replaces** all data on the server with the backup. A backup made without images keeps the images already on the server.

---

## Everyday commands (run in `/opt/moviebash`)

| Task | Command |
| --- | --- |
| Update to the newest code | `git pull && docker compose up -d --build` |
| View logs | `docker compose logs -f app` |
| Restart | `docker compose restart app` |
| Backup now | `docker compose exec app node scripts/db-backup.js` |
| Restore a backup | `docker compose exec app node scripts/db-restore.js backups/FILE --yes` |
| Change settings (WhatsApp keys etc.) | `nano .env` then `docker compose up -d` |

**Backups:** the installer schedules a backup every night at 02:30 into `/opt/moviebash/backups` and keeps the latest 30.
Each one includes every booking, setting and uploaded image. Download a copy to your PC now and then.
You can also download a backup any time from **Admin → Settings & backup**.

## Environment variables (`.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `DOMAIN`, `NEXT_PUBLIC_APP_URL` | yes | Your domain and site URL (used for HTTPS, ticket links, SEO) |
| `JWT_SECRET` | yes | Signs admin logins: a long random string |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | yes | Database name and credentials |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | first start | First admin account (only used when no users exist) |
| `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` | optional | Meta WhatsApp Cloud API: automatic messages |
| `WHATSAPP_TEMPLATE_*` | optional | Approved template names, for messages outside the 24-hour chat window |
| `WHATSAPP_ADMIN_NUMBER` | optional | Gets an alert for each website booking and enquiry |

## Security (what is already in place)

- HTTPS with an auto-renewing certificate and HSTS. The firewall only allows ports 22, 80 and 443.
- PostgreSQL is not exposed to the internet; only the app container can reach it.
- Admin sessions use signed, http-only, secure cookies that expire after 12 hours. Staff only see their branch, and no revenue.
- Login, booking, coupon, enquiry and upload endpoints are rate-limited.
- Prices, coupons, cake weight and discounts are always recalculated on the server.
- Uploads are re-encoded server-side (max 1600 px WebP) and stored in the database, so they're included in backups.
- Strict Content-Security-Policy, X-Frame-Options and nosniff headers, and no framework version header.
- `.env` is readable by root only and never committed to Git.

**Your checklist:** change the admin password after the first login, give each staff member their own account (Admin → Staff), and keep a backup copy off the server.

Known advisories (all need major upgrades, planned separately):
- Next.js 14: the remaining advisories are denial-of-service issues fixed only in Next 15+. The site doesn't use the affected features (no remote image patterns, no server actions).
- Zod 3: oversized-collection memory issue. Booking inputs cap every list, so this is mitigated.
- exceljs: uses an old `uuid` package. It's only used inside the admin Excel export.

---

## Running on a Windows PC (testing)

1. Install Node.js 20+ and PostgreSQL.
2. Copy `.env.example` to `.env.local`, then set `DATABASE_URL` (for example `postgresql://postgres:PASSWORD@localhost:5432/moviebash`) and `JWT_SECRET`.
3. Double-click **`start-local.bat`**. It installs packages, creates the database and tables, and opens the site at http://localhost:3105.

## Test deployment: Vercel (site + API) + Supabase (database)

The website and its API are one Next.js app, so Vercel hosts both. No separate backend (Render) is needed.

1. **Supabase**: create a project in region **Mumbai (ap-south-1)**. In *Connect*, copy two URLs:
   - *Session pooler* (port 5432): used once from your PC for setup.
   - *Transaction pooler* (port 6543): used by Vercel.
2. **Create tables + admin** (from this folder, PowerShell):
   ```powershell
   $env:DATABASE_URL="<session pooler URL>"; $env:DATABASE_SSL="true"; $env:ADMIN_USERNAME="admin"; $env:ADMIN_PASSWORD="<strong password>"
   npm run db:setup
   ```
   To copy your local data instead: `npm run db:backup` (with your local `.env.local`), then with the Supabase variables above:
   `node scripts/db-restore.js backups\<newest>.json.gz --yes`
3. **Vercel**: import the GitHub repo. In *Settings → Environment Variables* add:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | Supabase **transaction pooler** URL (port 6543) |
   | `DATABASE_SSL` | `true` |
   | `JWT_SECRET` | long random string (`openssl rand -base64 48`) |
   | `NEXT_PUBLIC_APP_URL` | `https://<your-project>.vercel.app` |
   | `NEXT_PUBLIC_BUSINESS_PHONE` | `+91…` |
   | `WHATSAPP_*` | optional, same as `.env.example` |

   Then *Deployments → Redeploy* (`NEXT_PUBLIC_*` values are read at build time).

Notes: the app runs in Mumbai (`vercel.json`). After changing `db/schema.sql`, run `npm run db:setup` against Supabase again, because Vercel skips the automatic table check.
