# GolfDraw — Play. Win. Give Back.

A full-stack subscription platform where golfers track scores, enter monthly prize draws, and support charities — all in one place. Built with Next.js 16, Prisma 7, Stripe, and NextAuth.

**Live Demo:** [https://golf-platform-delta-three.vercel.app](https://golf-platform-delta-three.vercel.app)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Internationalization (i18n)](#internationalization-i18n)
- [Deployment (Vercel)](#deployment-vercel)
- [Demo Credentials](#demo-credentials)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

GolfDraw turns every round of golf into an opportunity. Subscribers enter up to 5 Stableford scores each month, which double as their lottery-style draw numbers. When the monthly draw runs, matching numbers win a share of the prize pool — and a portion of every subscription goes directly to the charity of the player's choice.

### How It Works

1. **Subscribe** — Choose a Monthly or Yearly plan via Stripe
2. **Track Scores** — Enter your Stableford scores (1–45 range, max 5 per month)
3. **Enter the Draw** — Your scores become your draw numbers automatically
4. **Win Prizes** — Match 3, 4, or all 5 numbers to win from the prize pool
5. **Give Back** — A minimum 10% of your subscription supports your chosen charity

---

## Features

### For Players

- **Subscription Plans** — Monthly and Yearly plans with Stripe Checkout and self-serve billing portal
- **Score Tracking** — Rolling 5-score system with one-per-date uniqueness and Stableford validation
- **Monthly Prize Draws** — 5-match (40%), 4-match (35%), and 3-match (25%) prize tiers with jackpot rollover
- **Charity Support** — Choose a charity, set your contribution percentage (min 10%), and make independent donations
- **Winner Verification** — Upload proof files (images or PDF, up to 5MB) and track payout status through to payment
- **Multilingual** — Full i18n support with English, Spanish, and French translations
- **Multi-Currency** — Locale-aware currency formatting (GBP, EUR) across the entire platform
- **Dark/Light Theme** — System-aware theme toggle with manual override

### For Admins

- **User Management** — Search, filter, edit roles, and manage scores for any user
- **Draw Management** — Create draws (Random or Algorithmic mode), simulate outcomes, execute, and publish results with automated email notifications
- **Charity Management** — Full CRUD with activate/deactivate toggle
- **Winner Management** — Review uploaded proof, approve/reject, mark payouts as complete
- **Analytics Dashboard** — Total users, active subscribers, prize pool, and charity contribution metrics

### Public Pages

- **Homepage** — Animated hero, how-it-works flow, charity spotlight, and live jackpot display
- **How It Works** — Step-by-step guide with interactive FAQ accordion
- **Pricing** — Side-by-side plan comparison with locale-aware pricing and direct checkout
- **Charities** — Searchable directory with individual charity profile pages

---

## Tech Stack

| Layer          | Technology                                      |
| -------------- | ----------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)              |
| Language       | TypeScript 5                                    |
| Database       | PostgreSQL (Neon serverless)                    |
| ORM            | Prisma 7 with `@prisma/adapter-pg`              |
| Authentication | NextAuth.js 4 (JWT, Google OAuth + Credentials) |
| Payments       | Stripe (Checkout, Webhooks, Billing Portal)     |
| i18n           | next-intl (English, Spanish, French)            |
| Styling        | Tailwind CSS 4, shadcn/ui, Radix UI             |
| Animations     | Framer Motion                                   |
| Email          | Nodemailer (SMTP)                               |
| Validation     | Zod 4                                           |
| Deployment     | Vercel                                          |

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
│   │   │   ├── admin/         #   Admin endpoints
│   │   │   ├── auth/          #   NextAuth handler
│   │   │   ├── charities/     #   Public charity endpoints
│   │   │   ├── donations/     #   Donation endpoint
│   │   │   ├── draws/         #   Draw results
│   │   │   ├── profile/       #   User profile CRUD
│   │   │   ├── register/      #   Registration
│   │   │   ├── scores/        #   Score CRUD with rolling logic
│   │   │   ├── stripe/        #   Checkout & billing portal
│   │   │   ├── upload/        #   File upload for proof verification
│   │   │   ├── webhooks/      #   Stripe webhook handler
│   │   │   └── winners/       #   User winners
│   │   ├── auth/              # Sign-in & Sign-up pages
│   │   └── dashboard/         # User dashboard
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives (50+ components)
│   │   ├── locale-switcher.tsx# Language selector
│   │   ├── navbar.tsx         # Responsive navbar with auth state
│   │   ├── footer.tsx         # Translated site footer
│   │   ├── providers.tsx      # Theme + Session + i18n providers
│   │   └── theme-toggle.tsx   # Dark/light mode toggle
│   ├── i18n/
│   │   ├── config.ts          # Supported locales, currency mappings
│   │   └── request.ts         # Server-side locale detection (cookie-based)
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── currency.ts        # Locale-aware currency formatting
│   │   ├── email.ts           # Email templates (welcome, draw results, winner alerts)
│   │   ├── prisma.ts          # Prisma client with pg adapter
│   │   ├── session.ts         # Server-side session helpers
│   │   ├── stripe.ts          # Stripe client + plan config
│   │   └── validations.ts     # Zod schemas
│   ├── messages/
│   │   ├── en.json            # English translations
│   │   ├── es.json            # Spanish translations
│   │   └── fr.json            # French translations
│   ├── middleware.ts          # Auth + role-based + subscription route protection
│   └── types/                 # TypeScript declarations
├── next.config.ts             # Next.js + next-intl plugin config
├── prisma.config.ts           # Prisma configuration
├── package.json
└── .env.example               # Environment variable template
```

---

## Database Schema

12 models across authentication, subscriptions, draws, and charity domains:

```
User ──┬── Account (OAuth providers)
       ├── Session
       ├── Subscription (Stripe lifecycle)
       ├── Score (Stableford 1–45, max 5, unique per date)
       ├── DrawEntry (user's numbers for each draw)
       ├── Winner (prize amount + verification + payout status)
       └── Donation (independent charity donations)

Draw ──┬── DrawEntry
       ├── DrawResult (5/4/3-match outcomes)
       └── Winner

Charity ──┬── User (selected charity)
           └── Donation

VerificationToken (NextAuth email verification)
```

**Key Enums:**

- `Role` — USER, SUBSCRIBER, ADMIN
- `SubscriptionStatus` — ACTIVE, CANCELLED, EXPIRED, PAST_DUE
- `DrawType` — RANDOM, ALGORITHMIC
- `DrawStatus` — PENDING, SIMULATED, EXECUTED, PUBLISHED
- `MatchType` — FIVE_MATCH, FOUR_MATCH, THREE_MATCH
- `WinnerStatus` — PENDING → PROOF_SUBMITTED → APPROVED → PAID (or REJECTED)

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- **PostgreSQL** database — [Neon](https://neon.tech) (free tier) recommended
- **Stripe** account — [Test mode](https://dashboard.stripe.com/test/dashboard) is fine for development
- **Google OAuth** credentials — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### Installation

```bash
# Clone the repository
git clone https://github.com/TheUzair/GolfDraw.git
cd GolfDraw

# Install dependencies (also runs prisma generate via postinstall)
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values — see Environment Variables section below

# Push the schema to your database
npx prisma db push

# (Optional) Seed sample data
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in these values:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key             # openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

> **Tip:** For production, set `NEXTAUTH_URL` to your deployed URL. All OAuth callbacks, Stripe redirects, and email links derive from this value.

---

## Internationalization (i18n)

GolfDraw supports multiple languages and currencies out of the box using [next-intl](https://next-intl-docs.vercel.app/).

### Supported Locales

| Locale | Language | Currency |
| ------ | -------- | -------- |
| `en`   | English  | GBP (£)  |
| `es`   | Spanish  | EUR (€)  |
| `fr`   | French   | EUR (€)  |

### How It Works

- Users select their language from the **language switcher** in the navbar
- The preference is stored in a cookie and persists across sessions
- All UI strings (navigation, pricing, dashboard, etc.) are translated
- Currency formatting adapts automatically using `Intl.NumberFormat`

### Adding a New Language

1. Create a new translation file in `src/messages/` (e.g., `de.json`) using `en.json` as a template
2. Add the locale to `src/i18n/config.ts`:
   ```ts
   export const locales = ["en", "es", "fr", "de"] as const;
   ```
3. Add the locale name and currency mapping in the same file
4. The language will appear automatically in the switcher

---

## Deployment (Vercel)

```bash
npm i -g vercel    # Install Vercel CLI (if needed)
vercel --prod --yes
```

### Required Environment Variables

Set all variables from the [Environment Variables](#environment-variables) section in **Vercel Dashboard → Project Settings → Environment Variables**.

### Prisma on Vercel

Prisma client auto-generates during the build — no manual step needed:

- `postinstall` → `prisma generate` (after `npm install`)
- `build` → `prisma generate && next build`

### Third-Party Configuration

**Google OAuth** — Add this redirect URI in [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

```
https://your-domain.vercel.app/api/auth/callback/google
```

**Stripe Webhook** — Create an endpoint in [Stripe Dashboard](https://dashboard.stripe.com/webhooks) pointing to:

```
https://your-domain.vercel.app/api/webhooks/stripe
```

Subscribe to these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

---

## Demo Credentials

| Role  | Email              | Password    |
| ----- | ------------------ | ----------- |
| Admin | REDACTED | REDACTED |

New accounts can be created via the Sign Up page or Google OAuth.

---

## Available Scripts

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Prisma generate + production build
npm start            # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
npx prisma db push   # Push schema changes to database
```

---

## Contributing

Contributions are welcome! Whether it's a bug fix, new feature, translation, or documentation improvement — all PRs are appreciated.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

### Ideas for Contributions

- Add new language translations (German, Italian, Portuguese, etc.)
- Integrate cloud file storage (e.g., Vercel Blob, AWS S3) for proof uploads
- Add player leaderboards and social features
- Build a mobile app with React Native
- Add real-time draw animations

---

## License

This project is licensed under the [MIT License](LICENSE).
