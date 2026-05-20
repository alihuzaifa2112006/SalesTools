# Saller — Tricon Studios Marketing & Sales CRM

A production-ready, multi-tenant Marketing & Sales CRM built with Next.js 14, MongoDB, and JWT authentication.

## Tech Stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** MongoDB (Mongoose) — `SalesTools` database
- **Auth:** Custom JWT (Access + Refresh tokens in HttpOnly cookies)
- **UI:** Tailwind CSS with premium Apple/Stripe-inspired design
- **Charts:** Recharts

## Getting Started

1. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your MongoDB URI and JWT secrets.

3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- **Multi-Tenant Workspaces** — Create, join, and switch between team workspaces
- **Lead Tracker** — Manage clients from Instagram, Facebook, Google Maps, WhatsApp, cold calls
- **Payment Tracking** — Total value, received, remaining balance, pending status
- **Activity Logs** — Record interactions, follow-ups, and status changes
- **Dashboard Analytics** — Conversion rates, sales velocity, lead source distribution
- **Secure Auth** — bcrypt hashing, HttpOnly/SameSite cookies, JWT middleware

## Database Collections

| Collection       | Purpose                    |
|------------------|----------------------------|
| `user`           | User accounts              |
| `workspaces`     | Multi-tenant workspaces    |
| `leads`          | Client/lead records        |
| `activity_logs`  | Interaction history        |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages & API routes
├── components/           # UI & dashboard components
├── contexts/             # React context (Auth)
├── lib/                  # DB, auth, validations, utils
├── models/               # Mongoose schemas
├── types/                # TypeScript definitions
└── middleware.ts         # JWT route protection
```
