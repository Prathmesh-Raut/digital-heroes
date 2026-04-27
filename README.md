# Digital Heroes

Digital Heroes is a subscription-based SaaS platform for golf score tracking, monthly prize draws, and charity giving. This build uses Next.js 16, Tailwind CSS, route handlers, a Supabase-backed runtime path, and a local demo fallback so the product can be developed locally and then deployed against a fresh Supabase + Vercel setup for submission.

## What’s included

- Public marketing flow with featured charities, pricing, and searchable charity directory
- JWT cookie auth with signup, login, logout, and protected dashboard/admin routes
- Subscription lifecycle UI for monthly and yearly plans
- Score management with:
  - Stableford validation (1-45)
  - unique date enforcement
  - automatic trimming to the latest five scores
  - reverse chronological display
- Draw engine with:
  - random mode
  - weighted mode based on score frequency
  - simulation before publish
  - jackpot rollover behavior
- Winner proof upload and admin review flow
- Charity preference management plus independent donations
- Admin tooling for draws, charity CRUD, subscriptions, users, and winner review
- Supabase schema and seed data under [`supabase/`](./supabase)
- Runtime store that switches between local demo mode and Supabase-backed persistence
- Stripe checkout path plus webhook handling for subscription and donation flows when live keys are configured
- Health endpoint at `/api/health` for runtime/deployment readiness

## PRD additions included

Compared with the original prompt, this implementation also includes the extra PRD details from the PDF:

- public visitor flows
- featured charity section
- charity events on profile pages
- independent charity donations
- email notification hook stub
- edit/delete handling for same-date scores
- multi-country-ready user model

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- shadcn/ui primitives
- Recharts
- Zod
- JWT sessions with `jose`
- Supabase-ready SQL schema
- Stripe integration boundary/stub

## Local run

1. Install dependencies:

```bash
npm install
```

2. Copy envs:

```bash
copy .env.example .env.local
```

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`

## Demo accounts

- Member: `maya@digitalheroes.dev` / `DemoPass123!`
- Admin: `admin@digitalheroes.dev` / `DemoPass123!`

## Runtime modes

- `demo`: local fallback using the in-memory seed store
- `supabase`: app data is read/written through the Supabase admin client and the public/browser keys

The app stays in `demo` mode by default for local development. For the actual assignment submission and live deployment, switch to `supabase`.

## Supabase setup

1. Create a brand-new Supabase project for the submission.
2. Run [`supabase/schema.sql`](./supabase/schema.sql).
3. Run [`supabase/seed.sql`](./supabase/seed.sql) if you want starter content and demo accounts.
4. Add the project credentials to `.env.local` or Vercel environment variables.
5. Set `NEXT_PUBLIC_RUNTIME_MODE=supabase`.

Required variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Stripe setup

Add these environment variables when wiring live billing:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_MONTHLY_PRICE_ID`
- `STRIPE_YEARLY_PRICE_ID`

The webhook endpoint lives at `/api/stripe/webhook`.

If Stripe is not configured, the app falls back to direct local/demo completion for development. For the real submission, configure live Stripe products and the webhook in Vercel.

## Quality checks

```bash
npm run lint
npm run build
```

## Deployment Checklist

The assignment screenshots and PRD require:

1. Use a new Vercel account/project for deployment.
2. Use a new Supabase project instead of any personal existing backend.
3. Deploy a live link.
4. Submit only the requested details.

Recommended deployment steps:

1. Create a fresh Vercel project from this repo.
2. Add all environment variables from `.env.example`.
3. Replace `AUTH_SECRET` with a strong random value.
4. Set `NEXT_PUBLIC_APP_URL` to the deployed domain.
5. Switch `NEXT_PUBLIC_RUNTIME_MODE=supabase`.
6. Configure Stripe prices and webhook.
7. Run the SQL schema and seed on the new Supabase project.
8. Verify `/api/health` shows the expected service readiness before submitting.
