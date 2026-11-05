# 🎬 Movie Bash — Private Theatre & Celebration Booking Platform

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)]()

A high-performance, modern web application and management platform for **Movie Bash**, Bengaluru's premier private cinema and celebration destination. Engineered with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, and **MySQL 8** (with an automatic resilient fallback store).

---

## 📑 Table of Contents

- [Architectural Highlights](#-architectural-highlights)
- [Folder & Directory Structure](#-folder--directory-structure)
- [Core Customer Features](#-core-customer-features)
- [Admin Management Portal](#-admin-management-portal)
- [Accurate Theatre & Slot Schedules](#-accurate-theatre--slot-schedules)
- [Asset & Media Performance](#-asset--media-performance)
- [Design System & Typography](#-design-system--typography)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [API Routes Reference](#-api-routes-reference)

---

## 🏛 Architectural Highlights

- **Zero-Friction Customer Booking**: No account creation or password wall required. Customers select their venue, date, slot, occasion, and add-ons, enter their phone number and name, and reserve directly.
- **Direct WhatsApp Confirmation**: Upon booking submission, an order summary message is automatically formatted and triggered to the Movie Bash venue manager (`+91 99029 23656`), with a 1-click WhatsApp action on the confirmation screen.
- **3D Arched Video Carousel**: Math-driven cylinder projection using native CSS `clip-path` and dynamic transforms with continuous smooth auto-scrolling, touch/drag physics, and gentle hover pause.
- **Dual-Mode Persistence**: Seamlessly switches between **MySQL 8.0** connection pooling (`mysql2/promise`) and an automatic atomic JSON store (`data/store.json`) for zero-downtime local development and high availability.
- **Strict High-Contrast Accessibility**: Clean, crisp typography eliminating low-contrast washed-out tones in favor of deep black (`#101410`), rich forest green (`#08482D`), and vibrant amber/gold accents.

---

## 📁 Folder & Directory Structure

```text
movie_bash/
├── app/                                 # Next.js 14 App Router
│   ├── (public pages)
│   │   ├── page.tsx                     # Landing page with Arched Video Carousel & Booking Bar
│   │   ├── layout.tsx                   # Root layout, Google Fonts & Metadata
│   │   ├── globals.css                  # Custom Tailwind layers & animations
│   │   ├── about/page.tsx               # Brand story & cinema hall specifications
│   │   ├── book-now/                    # Dynamic multi-step & direct branch booking flows
│   │   │   ├── page.tsx                 # Universal booking entry
│   │   │   └── [branch-slug]/page.tsx   # Direct branch reservation
│   │   ├── book-now-btm-stage-2/        # Direct SEO landing for BTM 2nd Stage
│   │   ├── book-now-electronic-city/    # Direct SEO landing for Electronic City
│   │   ├── booking-success/[bookingRef]/# Instant reservation confirmation + WhatsApp dispatch
│   │   ├── contact/page.tsx             # Contact form, Google Maps & WhatsApp support
│   │   ├── faq/page.tsx                 # Searchable private screening FAQs
│   │   ├── gallery/page.tsx             # Filterable photo gallery with lightbox modal
│   │   ├── testimonials/page.tsx        # Customer reviews (4.9★ rating display)
│   │   ├── venues/                      # Dedicated branch facility walkthroughs
│   │   │   ├── btm-stage-2/page.tsx
│   │   │   └── electronic-city/page.tsx
│   │   ├── blog/                        # Celebration ideas, party tips & SEO guides
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── privacy-policy/page.tsx      # Privacy terms
│   │   ├── refund-policy/page.tsx       # Cancellation & refund rules
│   │   └── terms-and-conditions/page.tsx# Service terms
│   │
│   ├── admin/                           # Protected Venue Management Portal
│   │   ├── layout.tsx                   # Responsive sidebar, navigation drawer & auth check
│   │   ├── page.tsx                     # Executive KPIs, branch switcher & live occupancy
│   │   ├── bookings/page.tsx            # Live bookings ledger, search, filters & actions
│   │   ├── cms/page.tsx                 # Content & slot schedule manager
│   │   ├── deleted/page.tsx             # Soft-deleted bookings audit & 1-click restore
│   │   ├── reports/page.tsx             # Revenue accounting, slot utilization & CSV export
│   │   └── login/page.tsx               # Admin authentication console
│   │
│   └── api/                             # RESTful API Route Handlers
│       ├── admin/                       # Protected admin endpoints (JWT auth)
│       │   ├── bookings/                # List, update status, soft-delete, export CSV
│       │   │   ├── [id]/route.ts
│       │   │   ├── [id]/restore/route.ts
│       │   │   └── export/route.ts
│       │   ├── cms/route.ts             # Update slot schedules, add-ons & settings
│       │   ├── login/route.ts           # Admin login handler
│       │   ├── me/route.ts              # Session verification
│       │   └── stats/route.ts           # Aggregated revenue & booking metrics
│       ├── availability/route.ts        # Real-time slot availability & double-booking lock
│       ├── bookings/route.ts            # Booking creation & notification dispatch
│       ├── branches/route.ts            # Active branch locations
│       ├── theatres/route.ts            # Theatres list by branch
│       ├── coupons/validate/route.ts    # Discount coupon validation
│       ├── enquiries/route.ts           # Customer contact submissions
│       └── newsletter/route.ts          # WhatsApp VIP broadcast subscriptions
│
├── components/                          # Reusable Modular UI Components
│   ├── AddonsStrip.tsx                  # Celebration add-ons showcase (Cakes, Fog, Pyro)
│   ├── AnnouncementBar.tsx              # Top sticky promotion banner
│   ├── BookingWizard.tsx                # High-converting frictionless booking engine
│   ├── BranchMarquee.tsx                # Infinite scrolling trust marquee
│   ├── FaqSection.tsx                   # Interactive FAQ accordions
│   ├── FinalCtaBanner.tsx               # High-impact bottom reservation banner
│   ├── FloatingContact.tsx              # Quick Call & WhatsApp floating widgets
│   ├── Footer.tsx                       # Full site footer, quick links & legal
│   ├── HeroSection.tsx                  # 3D arched auto-scrolling video carousel & quick bar
│   ├── HomeIntro.tsx                    # Value proposition & cinema hall highlights
│   ├── HomeStats.tsx                    # Trust indicators (12,500+ guests, 4.9★ rating)
│   ├── Navbar.tsx                       # Responsive header with direct WhatsApp CTA
│   ├── OccasionsSection.tsx             # Birthday, Anniversary, Proposal cards
│   ├── SocialHighlights.tsx             # Instagram customer reels & gallery preview
│   ├── TestimonialsSection.tsx          # Real customer testimonials
│   ├── TheatresSlotsSection.tsx         # Interactive branch slot explorer
│   ├── VenuesSection.tsx                # Venue photos & amenity comparisons
│   ├── WhatWeProvideSection.tsx         # 4K projection, Dolby Atmos, privacy features
│   └── WhyChooseUs.tsx                  # Core differentiators
│
├── data/
│   └── store.json                       # Atomic fallback persistent JSON database
├── lib/
│   ├── db.ts                            # MySQL connection pool + fallback adapter
│   └── mock-data.ts                     # Initial seeded data & TypeScript interfaces
├── public/
│   ├── images/                          # Highly-optimized WebP photos (full + thumbnails)
│   └── videos/                          # Lightweight MP4 celebration clips (< 500 KB each)
├── scripts/
│   ├── compress_videos.js               # Utility script for MP4 ffmpeg compression
│   └── optimize_images.js               # Utility script for WebP conversion & thumbnails
├── middleware.ts                        # Edge route guard for /admin routes
├── schema.sql                           # MySQL 8.0 table definitions & indexes
├── seed.sql                             # Seed records, slots & admin credentials
└── tailwind.config.ts                   # Custom color palette, fonts & animations
```

---

## 🎯 Core Customer Features

### 1. Frictionless Booking Wizard (`/book-now`)
- **No Login Barrier**: Customers complete reservations immediately without creating an account or waiting for SMS verification.
- **Dynamic Branch & Date Selection**: Automatically checks slot availability and blocks past dates.
- **Real-Time Double-Booking Lock**: Validates selected theatre slots instantly to prevent duplicate reservations.
- **Custom Celebration Add-ons**: Fresh Truffle/Red Velvet cakes, Magical Fog entry, Cold Fire Pyro sparklers, Rose Bouquets, and Professional Photoshoots.
- **Dynamic Pricing Engine**: Computes base tier pricing, extra guest additions, add-on totals, and coupon discounts with clear advance and balance breakdown.

### 2. Direct WhatsApp Dispatch
When a reservation is submitted:
1. The booking record is stored with a unique reference (e.g., `MB-EC-84920`).
2. An instant WhatsApp message is generated with full booking specs and opened directly to Movie Bash operations:
   ```text
   🎉 New Booking Reservation Request
   Ref: MB-EC-84920
   Name: Rahul Sharma
   Phone: 9876543210
   Branch: Electronic City
   Theatre: Couple Theater (4K Screen)
   Date: 15-11-2026
   Slot: 6:30 PM – 8:30 PM
   Occasion: Birthday Celebration
   Guests: 2
   Add-ons: Fresh Truffle Cake (₹499), Fog Entry (₹499)
   Total: ₹2,198
   Advance: ₹750
   Balance: ₹1,448
   ```
3. The customer is redirected to `/booking-success/[bookingRef]` featuring a prominent 1-click **"Send Details to WhatsApp (+91 99029 23656)"** button.

---

## 🛠 Admin Management Portal (`/admin`)

- **Secure Route Guard**: Protected via Edge Middleware (`middleware.ts`) with signed JWT cookies.
- **Live Operations Dashboard**:
  - Today's showtime schedule per theatre.
  - Gross revenue, advance deposits collected, and balance pending.
  - Branch filter switcher (Electronic City vs. BTM 2nd Stage).
- **Bookings Ledger**:
  - Real-time search across Booking Ref, Customer Name, and Phone.
  - Filter by branch, theatre, status, and occasion.
  - Mark completed, collect balance, or soft-delete.
  - 1-click **CSV Export** for accounting and record keeping.
- **Soft-Delete & Audit History (`/admin/deleted`)**:
  - Prevents accidental deletions; cancelled bookings are archived with cancellation reason and can be restored in 1 click.
- **CMS Manager (`/admin/cms`)**:
  - Live editing for theatre base prices, extra person charges, add-on pricing, slot schedules, and banner announcements.

---

## ⏰ Accurate Theatre & Slot Schedules

### Branch 1: Electronic City
*Located at 4th Floor, Srinivasam, Nagananthapura Main Road, Beside Sri Vishnu Grand, Bengaluru 560100.*

| Theatre | Capacity | Daily Slots | Timing Schedule |
|---|---|---|---|
| **Couple Theater** | 2-4 Guests | 7 Slots | 10:00 AM – 12:00 PM<br>12:15 PM – 2:15 PM<br>2:30 PM – 4:30 PM<br>5:00 PM – 6:00 PM<br>6:30 PM – 8:30 PM<br>8:45 PM – 10:45 PM<br>11:00 PM – 1:00 AM |
| **Celebration Theater** | 4-8 Guests | 7 Slots | 9:30 AM – 11:30 AM<br>12:00 PM – 2:00 PM<br>2:30 PM – 4:30 PM<br>4:45 PM – 6:45 PM<br>7:00 PM – 9:00 PM<br>9:15 PM – 11:15 PM<br>11:30 PM – 1:00 AM |
| **Family Theater** | 6-20 Guests | 6 Slots | 10:00 AM – 12:00 PM<br>12:30 PM – 2:30 PM<br>3:00 PM – 5:00 PM<br>6:00 PM – 8:00 PM<br>8:30 PM – 10:30 PM<br>10:45 PM – 12:45 AM |

### Branch 2: BTM 2nd Stage (4 Private Theatres)
*Located at 2nd Floor, 16th Main Road, Near Udupi Garden Signal, BTM 2nd Stage, Bengaluru 560076.*

| Theatre | Capacity | Daily Slots | Timing Schedule |
|---|---|---|---|
| **Couple Theater** | 2-4 Guests | 7 Slots | 10:00 AM – 12:00 PM<br>12:15 PM – 2:15 PM<br>2:30 PM – 4:30 PM<br>5:00 PM – 6:00 PM<br>6:30 PM – 8:30 PM<br>8:45 PM – 10:45 PM<br>11:00 PM – 1:00 AM |
| **Celebration Theater** | 4-8 Guests | 7 Slots | 9:30 AM – 11:30 AM<br>12:00 PM – 2:00 PM<br>2:30 PM – 4:30 PM<br>4:45 PM – 6:45 PM<br>7:00 PM – 9:00 PM<br>9:15 PM – 11:15 PM<br>11:30 PM – 1:00 AM |
| **VIP Celebration Suite** | 4-8 Guests | 7 Slots | 10:00 AM – 12:00 PM<br>12:15 PM – 2:15 PM<br>2:30 PM – 4:30 PM<br>4:45 PM – 6:45 PM<br>7:00 PM – 9:00 PM<br>9:15 PM – 11:15 PM<br>11:30 PM – 1:00 AM |
| **Family Theater** | 6-20 Guests | 6 Slots | 10:00 AM – 12:00 PM<br>12:30 PM – 2:30 PM<br>3:00 PM – 5:00 PM<br>6:00 PM – 8:00 PM<br>8:30 PM – 10:30 PM<br>10:45 PM – 12:45 AM |

---

## ⚡ Asset & Media Performance

To guarantee near-instant page loads on mobile 4G networks:
- **Images**: All images are WebP-compressed, averaging **~40 KB** each, with pre-generated responsive thumbnails (`_thumb.webp`). Total image bundle is under **2.3 MB** for 52 assets.
- **Videos**: 7 real celebration MP4 clips compressed to **~450 KB** each (total video bundle is under **3.2 MB**).
- **Video Carousel**: Uses `preload="auto"`, `muted`, `playsInline`, and poster images to prevent bandwidth contention and layout shifts.

---

## 🎨 Design System & Typography

- **Deep Black**: `#101410` (Ultra-crisp headings & body text)
- **Forest Green**: `#08482D` (Primary CTAs, trust badges, hand-drawn notes)
- **Royal Navy**: `#0A1F5C` (Deep premium background banners & sidebar)
- **Vibrant Amber**: `#F59E0B` / `#FCD34D` (High-contrast highlights & star ratings)
- **Sand Cream**: `#FAF6E9` (Warm luxury section backgrounds)
- **Typography**: 
  - `Playfair Display`: High-luxury headline serif.
  - `Inter` / `Inter Tight`: Clean, modern UI body font.
  - `Caveat`: Authentic hand-drawn celebratory notes and arrows.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm** or **pnpm** / **yarn**

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Create Production Build
```bash
npm run build
npm start
```

---

## 🔐 Credentials

### Admin Management Console
- **URL**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Default Email**: `admin@moviebash.in`
- **Default Password**: `Admin@MovieBash2026!`

---

## 📡 API Routes Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/branches` | Fetch active branches | Public |
| `GET` | `/api/theatres?branchId=1` | Fetch theatres by branch | Public |
| `GET` | `/api/availability?theatre=1&date=YYYY-MM-DD` | Real-time slot availability | Public |
| `POST` | `/api/bookings` | Create new reservation | Public |
| `POST` | `/api/coupons/validate` | Check promo code discount | Public |
| `POST` | `/api/enquiries` | Submit contact form | Public |
| `POST` | `/api/newsletter` | WhatsApp VIP subscription | Public |
| `POST` | `/api/admin/login` | Admin authentication | Public |
| `GET` | `/api/admin/me` | Current admin session | Admin JWT |
| `GET` | `/api/admin/stats` | KPI counters & revenue | Admin JWT |
| `GET` | `/api/admin/bookings` | Filter & search bookings | Admin JWT |
| `PATCH` | `/api/admin/bookings/[id]` | Update status / soft-delete | Admin JWT |
| `POST` | `/api/admin/bookings/[id]/restore`| Restore deleted booking | Admin JWT |
| `GET` | `/api/admin/bookings/export` | Download CSV accounting ledger | Admin JWT |
| `GET/POST`| `/api/admin/cms` | Retrieve or update CMS config | Admin JWT |

---

## 📄 License & Ownership
Copyright © 2026 **Movie Bash Private Theatre (Bengaluru)**. All rights reserved.
Developed with enterprise-grade quality standards.
