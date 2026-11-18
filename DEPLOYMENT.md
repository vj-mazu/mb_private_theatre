# 🚀 Deployment Guide: Next.js 14 + Embedded SQLite WAL

This guide explains how to deploy **Movie Bash** to production with **zero hardcoded URLs, ports, or credentials**, maintaining bank-grade security, lightning-fast media delivery, and an embedded **SQLite 3 database** (`better-sqlite3` with WAL mode).

---

## 🏗 Architecture Overview

```
                        ┌───────────────────────────────────────────────┐
                        │             Next.js 14 Production Server       │
                        │                                               │
   [Users & Mobile] ───►│  • App Router (Fast SSR/SSG/ISR)              │
                        │  • Dynamic Image Optimization (WebP/AVIF)     │
                        │  • RESTful API Routes (/api/*)                │
                        │  • Embedded SQLite 3 (better-sqlite3 WAL)     │
                        │  • High-performance sub-millisecond queries   │
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
   - All credentials (`JWT_SECRET`, `ADMIN_PASSWORD`, `TWILIO_AUTH_TOKEN`) are configured strictly via environment variables.
   - `.env`, `.env.local`, and all `.env.*` files are in `.gitignore`. Only `.env.example` with sanitized placeholders is tracked.

2. **Zero Hardcoded Ports & Domains**:
   - Next.js runs with dynamic port binding (`process.env.PORT`).
   - All client-side fetch requests use relative paths (`/api/bookings`, `/api/theatres`, etc.), ensuring the application operates seamlessly on any custom domain, localhost, or preview URL without modifying code.

3. **Zero Configuration SQLite Engine**:
   - High-performance, self-contained embedded database located at `data/movie_bash.db`.
   - Write-Ahead Logging (`PRAGMA journal_mode = WAL`) enables concurrent high-throughput reads with safe, atomic transactions.
   - Zero external database services, network latency, connection pool limits, or monthly cloud database hosting fees.

---

## 📦 Database Initialization & Verification

The database auto-initializes on startup:
```bash
node scripts/init-sqlite.js
```
This automatically creates all schema tables and indexes, and seeds initial venue metadata (Electronic City & BTM 2nd Stage screens, standard time slots, occasions, and addon items).

---

## ⚡ Production Deployment (Node.js / Docker / VPS / Railway / Render)

### Step 1: Install Dependencies & Build
```bash
npm install
npm run build
```

### Step 2: Environment Variables
Configure the following environment variables:

| Variable | Recommended Production Value | Description |
|---|---|---|
| `SQLITE_DB_PATH` | `data/movie_bash.db` | Embedded SQLite file path |
| `JWT_SECRET` | *(A random 32+ char string)* | Secures admin session cookies |
| `ADMIN_EMAIL` | `admin@moviebash.in` | Super admin login username |
| `ADMIN_PASSWORD` | `YourSecurePassword2026!` | Admin dashboard password |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | `your_live_auth_token` | Twilio Auth Token |
| `TWILIO_WHATSAPP_NUMBER` | `whatsapp:+14155238886` | Twilio WhatsApp sender number |
| `TWILIO_ADMIN_WHATSAPP` | `919448986953` | Mobile number to receive admin alerts |
| `NEXT_PUBLIC_APP_URL` | `https://moviebash.in` | Public canonical site URL |

### Step 3: Run Production Server
```bash
npm start
```
The server will bind to `process.env.PORT` (or port 3000 by default).
