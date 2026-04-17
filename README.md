# GolfDraw — Subscription Golf Platform

A subscription-driven web application combining golf performance tracking, charity fundraising, and a monthly draw-based reward engine. Built with Next.js 16, Prisma 7, Stripe, and NextAuth.

**Live:** [https://golf-platform-delta-three.vercel.app](https://golf-platform-delta-three.vercel.app)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment (Vercel)](#deployment-vercel)
- [Test Credentials](#test-credentials)
- [PRD Requirements Coverage](#prd-requirements-coverage)

---

## Features

### User-Facing

- **Subscription Engine** — Monthly (£9.99) and Yearly (£99.99) plans via Stripe Checkout with billing portal
- **Score Tracking** — Enter up to 5 Stableford scores (1–45 range), one per date, with rolling replacement
- **Monthly Draws** — Scores serve as draw numbers; 5-match, 4-match, and 3-match prize tiers
- **Charity Integration** — Select a charity at signup, adjust contribution percentage (min 10%), make independent donations
- **Winner Verification** — Submit proof of scores, track payout status (Pending → Paid)
- **Dark/Light Theme** — Toggle between dark and light modes

### Admin Panel

- **User Management** — View, search, edit roles, manage all users
- **Draw Management** — Create draws (Random or Algorithmic), simulate, execute, and publish results
- **Charity Management** — Full CRUD for charities with activate/deactivate
- **Winner Management** — Review proof submissions, approve/reject, mark payouts
- **Analytics Dashboard** — Total users, active subscriptions, prize pool, charity contributions

### Public Pages

- **Homepage** — Animated hero, how-it-works flow, charity spotlight, prize pool CTA
- **How It Works** — Step-by-step explanation with FAQ accordion
- **Pricing** — Plan comparison cards with Stripe checkout integration
- **Charities** — Searchable charity directory

---

## Tech Stack

| Layer          | Technology                                               |
| -------------- | -------------------------------------------------------- |
| Framework      | Next.js 16.2.4 (App Router, Turbopack)                   |
| Language       | TypeScript 5                                             |
| Database       | PostgreSQL (Neon)                                        |
| ORM            | Prisma 7 with `@prisma/adapter-pg`                       |
| Authentication | NextAuth.js 4 (JWT strategy, Google OAuth + Credentials) |
| Payments       | Stripe (Checkout, Webhooks, Billing Portal)              |
| Styling        | Tailwind CSS 4, shadcn/ui, Radix UI                      |
| Animations     | Framer Motion                                            |
| Email          | Nodemailer (Gmail SMTP)                                  |
| Validation     | Zod 4                                                    |
| Deployment     | Vercel                                                   |

---

## Project Structure

```
golf-platform/
├── prisma/
│   └── schema.prisma          # Database schema (12 models)
├── src/
│   ├── app/
│   │   ├── (public)/          # Public pages (home, pricing, charities, how-it-works)
│   │   ├── admin/             # Admin panel (dashboard, users, draws, charities, winners)
│   │   ├── api/               # REST API routes
│   │   │   ├── admin/         #   Admin endpoints (analytics, charities, draws, users, winners)
│   │   │   ├── auth/          #   NextAuth handler
│   │   │   ├── charities/     #   Public charity endpoints
│   │   │   ├── donations/     #   Donation endpoint
│   │   │   ├── draws/         #   Public draw results
│   │   │   ├── profile/       #   User profile CRUD
│   │   │   ├── register/      #   User registration
│   │   │   ├── scores/        #   Score CRUD with rolling logic
│   │   │   ├── stripe/        #   Checkout & billing portal
│   │   │   ├── webhooks/      #   Stripe webhook handler
│   │   │   └── winners/       #   Public winners list
│   │   ├── auth/              # Sign-in & Sign-up pages
│   │   └── dashboard/         # User dashboard (scores, draws, charity, profile, winnings)
│   ├── components/
│   │   ├── ui/                # shadcn/ui components (50+ components)
│   │   ├── navbar.tsx         # Responsive navbar with auth state
│   │   ├── footer.tsx         # Site footer
│   │   ├── providers.tsx      # Theme + Session providers
│   │   └── theme-toggle.tsx   # Dark/light mode toggle
│   ├── hooks/                 # Custom React hooks
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── email.ts           # Email templates (draw results, winner alerts)
│   │   ├── prisma.ts          # Prisma client with pg adapter
│   │   ├── session.ts         # Server-side session helpers
│   │   ├── stripe.ts          # Stripe client + plan config
│   │   └── validations.ts     # Zod schemas
│   ├── middleware.ts          # Route protection (auth + role-based)
│   └── types/                 # TypeScript declarations
├── prisma.config.ts           # Prisma configuration
├── package.json
└── .env                       # Environment variables (not committed)
```

---

## Database Schema

12 models across authentication, business logic, and charity domains:

```
User ──┬── Account (OAuth)
       ├── Session
       ├── Subscription (Stripe)
       ├── Score (1-45 Stableford, 5 max, unique per date)
       ├── DrawEntry (user's numbers per draw)
       ├── Winner (prize + verification status)
       └── Donation (independent charity donations)

Draw ──┬── DrawEntry
       ├── DrawResult (5/4/3-match outcomes)
       └── Winner

Charity ──┬── User (selected charity)
           └── Donation

VerificationToken (NextAuth)
```

**Key Enums:** `Role` (USER/SUBSCRIBER/ADMIN), `SubscriptionStatus` (ACTIVE/CANCELLED/EXPIRED/PAST_DUE), `DrawType` (RANDOM/ALGORITHMIC), `DrawStatus` (PENDING/SIMULATED/EXECUTED/PUBLISHED), `MatchType` (FIVE/FOUR/THREE_MATCH), `WinnerStatus` (PENDING/PROOF_SUBMITTED/APPROVED/REJECTED/PAID)

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [Neon](https://neon.tech) serverless)
- Stripe account (test mode)
- Google OAuth credentials (Google Cloud Console)

### Installation

```bash
# Clone the repository
git clone https://github.com/TheUzair/GolfDraw.git
cd GolfDraw

# Install dependencies (also runs prisma generate via postinstall)
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Push schema to database
npx prisma db push

# (Optional) Seed the database
npx tsx prisma/seed.ts

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000          # Use production URL on Vercel
NEXTAUTH_SECRET=your-secret-key             # Generate with: openssl rand -base64 32

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...           # Create in Stripe Dashboard
STRIPE_YEARLY_PRICE_ID=price_...            # Create in Stripe Dashboard

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password             # Gmail App Password
EMAIL_FROM=your-email@gmail.com
```

### URL Configuration

The app automatically uses the correct URL based on environment:

- **Local development:** `NEXTAUTH_URL=http://localhost:3000`
- **Production (Vercel):** `NEXTAUTH_URL=https://golf-platform-delta-three.vercel.app`

All redirects (Stripe checkout success/cancel, OAuth callbacks, email links) derive from `NEXTAUTH_URL`.

---

## Deployment (Vercel)

### Prerequisites

- Vercel CLI installed globally: `npm i -g vercel`
- GitHub repository connected

### Deploy

```bash
# Link and deploy
vercel --prod --yes
```

### Required Vercel Environment Variables

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

| Variable                  | Value                                          |
| ------------------------- | ---------------------------------------------- |
| `DATABASE_URL`            | Your PostgreSQL connection string              |
| `NEXTAUTH_URL`            | `https://golf-platform-delta-three.vercel.app` |
| `NEXTAUTH_SECRET`         | Your secret key                                |
| `GOOGLE_CLIENT_ID`        | Google OAuth client ID                         |
| `GOOGLE_CLIENT_SECRET`    | Google OAuth client secret                     |
| `STRIPE_SECRET_KEY`       | Stripe secret key                              |
| `STRIPE_PUBLISHABLE_KEY`  | Stripe publishable key                         |
| `STRIPE_WEBHOOK_SECRET`   | Stripe webhook signing secret                  |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe monthly price ID                        |
| `STRIPE_YEARLY_PRICE_ID`  | Stripe yearly price ID                         |
| `SMTP_HOST`               | `smtp.gmail.com`                               |
| `SMTP_PORT`               | `587`                                          |
| `SMTP_USER`               | SMTP email                                     |
| `SMTP_PASSWORD`           | SMTP app password                              |
| `EMAIL_FROM`              | Sender email address                           |

### Prisma on Vercel

Prisma client is auto-generated during the build process:

- `postinstall` script runs `prisma generate` after `npm install`
- `build` script runs `prisma generate && next build`

No manual `prisma generate` step needed — it's handled automatically.

### Google OAuth Redirect URI

Add this to your Google Cloud Console OAuth 2.0 credentials:

```
https://golf-platform-delta-three.vercel.app/api/auth/callback/google
```

### Stripe Webhook Endpoint

Create a webhook in Stripe Dashboard pointing to:

```
https://golf-platform-delta-three.vercel.app/api/webhooks/stripe
```

Events to listen for:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Test Credentials

| Role  | Email              | Password    |
| ----- | ------------------ | ----------- |
| Admin | REDACTED | REDACTED |

New users can register via the Sign Up page or Google OAuth.

---

## PRD Requirements Coverage

### ✅ Fully Implemented

| Section                 | Feature                                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Subscription**        | Monthly/Yearly plans, Stripe Checkout, billing portal, webhook lifecycle (renewal/cancellation/lapsed), access control, welcome email                            |
| **Score Management**    | 5-score rolling logic, Stableford 1–45 range, one score per date, date-based entry, CRUD operations, reverse chronological display                               |
| **Draw System**         | 5/4/3-number match types, random & algorithmic generation, simulation mode, admin execution & publishing, jackpot rollover, auto draw entry creation from scores |
| **Prize Pool**          | 40%/35%/25% tier split, auto-calculation from subscribers, equal split among winners, jackpot carry-forward                                                      |
| **Charity**             | Selection at signup, min 10% contribution, adjustable percentage, independent donations, searchable directory, featured charities, individual charity profiles   |
| **Winner Verification** | Proof submission, admin approve/reject, payment states (Pending → Proof Submitted → Approved → Paid)                                                             |
| **User Dashboard**      | Subscription status, score entry/edit/delete, charity selection & percentage, winnings overview with payment tracking                                            |
| **Admin Dashboard**     | User management with search, draw configuration & simulation, charity CRUD, winner verification & payout, analytics overview, admin score editing                |
| **UI/UX**               | Modern emotion-driven design, Framer Motion animations, responsive mobile-first layout, clear CTAs, dark/light theme                                             |
| **Technical**           | JWT authentication, bcrypt hashing, middleware route + subscription protection, TypeScript, Zod validation, email notifications                                  |

### ⚠️ Partial / Simplified

| Feature               | Status                                               |
| --------------------- | ---------------------------------------------------- |
| Proof upload          | Accepts URL input instead of file upload             |
| Multi-country support | Hardcoded GBP currency; no i18n or regional settings |

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

---

## Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Generate Prisma client + production build
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma db push   # Push schema changes to database
```

---

## License

This project is licensed under the [MIT License](LICENSE).
