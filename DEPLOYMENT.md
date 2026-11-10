# 🚀 Deployment Guide: Vercel (Frontend & Serverless API) + Cloud Database / Render

This guide explains how to deploy **Movie Bash** to production with **zero hardcoded URLs, ports, or credentials**, maintaining bank-grade security, lightning-fast media delivery, and a completely **fresh database** ready for real customer bookings.

---

## 🏗 Architecture Overview

```
                        ┌───────────────────────────────────────────────┐
                        │          Vercel Global Edge Network           │
                        │                                               │
   [Users & Mobile] ───►│  • Next.js 14 App Router (Fast SSR/SSG/ISR)   │
                        │  • Dynamic Image Optimization (WebP/AVIF)     │
                        │  • Serverless API Routes (/api/*)             │
                        └──────────────────────┬────────────────────────┘
                                               │
                                               │ Encrypted SSL (DATABASE_URL)
                                               ▼
                        ┌───────────────────────────────────────────────┐
                        │     Cloud Database (Render / TiDB / Aiven)    │
                        │                                               │
                        │  • MySQL 8.0+ Connection Pool                 │
                        │  • Fresh schema (Zero fake/dummy records)     │
                        │  • Automated backups & SSL encryption         │
                        └──────────────────────┬────────────────────────┘
                                               │
                                               ▼
                        ┌───────────────────────────────────────────────┐
                        │        Twilio WhatsApp Cloud Gateway          │
                        │                                               │
                        │  • Instant 2-way booking confirmations        │
                        │  • Direct venue manager notification          │
                        └───────────────────────────────────────────────┘
```

---

## 🔒 Security & Fresh Database Principles

1. **Zero Hardcoded Secrets in Git**:
   - All credentials (`DATABASE_URL`, `JWT_SECRET`, `ADMIN_PASSWORD`, `TWILIO_AUTH_TOKEN`) are configured strictly via cloud environment variables.
   - `.env`, `.env.local`, and all `.env.*` files are in `.gitignore`. Only `.env.example` with sanitized placeholders is tracked.

2. **Zero Hardcoded Ports & Domains**:
   - Next.js runs with dynamic port binding (`process.env.PORT`).
   - All client-side fetch requests use relative paths (`/api/bookings`, `/api/theatres`, etc.), ensuring the application operates seamlessly on any custom domain, localhost, or preview URL without modifying code.

3. **Fresh Database (Zero Seed / No Fake Data)**:
   - The tables for `customers`, `bookings`, and `booking_addons` start **100% empty**.
   - No mock reservations exist in `seed.sql`, `lib/mock-data.ts`, or `data/store.json`.
   - The database only contains initial venue metadata (Electronic City & BTM 2nd Stage screens, standard time slots, occasions, and addon items).

---

## 📦 Part 1: Setting Up the Cloud Database (Zero Manual Steps Required!)

You can host your MySQL database for free using any provider that supports MySQL 8.0:
- **TiDB Cloud Serverless** (Free forever 5GB, 100% MySQL compatible - **Recommended for Vercel/Render**)
- **Aiven Cloud** (Free MySQL managed instance)
- **Render MySQL / Docker Web Service**
- **Railway / Clever Cloud**

### 1. Create your database
Create a database (e.g. `movie_bash` or defaultdb) on your chosen provider.

### 2. Copy your Connection URL
Copy the MySQL connection string provided in your database dashboard:
```text
mysql://username:password@hostname:3306/movie_bash?sslmode=require
```

### 3. ✨ Built-In Automatic Server Seeding (Zero CLI Commands!)
**You do NOT need to run any manual MySQL commands or import files via DBeaver!**
The server automatically handles this on boot:
1. When the server connects via `DATABASE_URL`, it checks if the `branches` table exists.
2. If tables do not exist (fresh database), it automatically creates all schema tables from `schema.sql` and inserts initial venues, screens, showtimes, and addons from `seed.sql`.
3. It keeps `customers` and `bookings` completely fresh at **0 records** for live commercial use.
4. On future server restarts or deployments, it recognizes that tables already exist and leaves everything untouched, ensuring zero data loss!

*(Optional Manual Fallback)*: If you ever prefer running SQL scripts manually:
```bash
mysql -h <YOUR_HOST> -u <YOUR_USER> -p -D movie_bash < schema.sql
mysql -h <YOUR_HOST> -u <YOUR_USER> -p -D movie_bash < seed.sql
```

---

## ⚡ Part 2: Deploying Frontend & APIs to Vercel

Vercel provides zero-configuration deployment for Next.js 14 with global edge caching and automatic SSL.

### Step 1: Push Code to GitHub / GitLab
Ensure your local branch is committed:
```bash
git add .
git commit -m "feat: complete production booking system with dynamic packages & fresh store"
git push origin main
```

### Step 2: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** ➜ **Project**.
3. Import your `movie_bash` repository.
4. Leave Framework Preset as **Next.js**.

### Step 3: Add Environment Variables in Vercel
In the **Environment Variables** section, paste the following keys:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `DATABASE_URL` | `mysql://user:pass@host:3306/movie_bash?sslmode=require` | Cloud MySQL connection string |
| `DB_SSL` | `true` | Enforces SSL encryption for cloud databases |
| `JWT_SECRET` | *(A random 32+ char string, e.g. run `openssl rand -hex 32`)* | Secures admin session cookies |
| `ADMIN_EMAIL` | `admin@moviebash.in` | Super admin login username |
| `ADMIN_PASSWORD` | `YourSecurePassword2026!` | Admin dashboard password |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | `your_live_auth_token` | Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` | Twilio WhatsApp sender number |
| `TWILIO_ADMIN_WHATSAPP` | `919448986953` | Mobile number to receive admin alerts |
| `NEXT_PUBLIC_BUSINESS_PHONE` | `+919902923656` | Public phone shown on customer site |
| `NEXT_PUBLIC_BUSINESS_EMAIL` | `bookmoviebash@gmail.com` | Public contact email |

### Step 4: Click Deploy
Vercel will compile the Next.js application, bundle serverless functions, optimize all WebP images, and provide a production HTTPS URL (e.g., `https://moviebash.vercel.app`).

---

## 🖥 Part 3: Deploying on Render (Free Tier Alternative)

If you prefer deploying the entire Node.js server on Render:

1. Log in to [Render](https://render.com).
2. Click **New +** ➜ **Web Service**.
3. Connect your GitHub repository.
4. Set the following build settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. In **Advanced** ➜ **Environment Variables**, enter the same keys as listed in the table above.
6. Click **Create Web Service**. Render will automatically detect the dynamic `PORT` environment variable and host your live website.

---

## 📱 Twilio WhatsApp Setup Guide

### Testing Mode (Twilio Sandbox)
1. Add `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886`.
2. To receive test messages during development, send the join code shown in your Twilio Console (e.g., `join cry-important`) to `+1 415 523 8886`.
3. Sandbox sessions remain active for **72 hours**.

### Production Live Mode (Direct Delivery to Any Number)
1. In the Twilio Console, navigate to **Messaging** ➜ **Senders** ➜ **WhatsApp Senders**.
2. Register your business profile (`Movie Bash Private Theatre`) with Meta verification.
3. Once approved, replace `TWILIO_WHATSAPP_NUMBER` with your official WhatsApp sender number (e.g. `whatsapp:+919902923656`).
4. In production mode, customers **do not** need to send any sandbox join code — messages are delivered directly and instantly to any mobile number in India (+91) upon reservation!

---

## 🔍 Pre-Launch Verification Checklist

- [x] **No Hardcoded URLs**: All API routes use relative paths (`/api/*`).
- [x] **No Secrets in Code**: Checked via git audit; `.env*` properly excluded.
- [x] **Port Dynamic**: `package.json` runs `next start` respecting `process.env.PORT`.
- [x] **Fresh Database**: 0 bookings and 0 customers in database and persistent store.
- [x] **Ultra-Fast Images**: All 52 assets compressed to WebP format with lazy-loading and GPU-accelerated hero carousels.
- [x] **Admin Authentication**: Secure bcrypt password comparison with HTTP-only JWT cookies.
- [x] **Instant Booking Summary**: Automated breakdown of packages, custom add-ons, extra guests, extra hours, and free cakes.
