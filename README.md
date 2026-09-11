# WashHouse Services

An independently owned laundry collection and delivery platform rebuilt from the original Base44 prototype.

## Stack

- Next.js 16 App Router with TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL and Row Level Security
- Vercel-ready deployment

## Included in this foundation

- Responsive homepage based on the supplied mobile and desktop screenshots
- Service catalogue and pricing
- Four-step collection booking journey
- Supabase email/password authentication
- Customer dashboard and order list
- Nine-stage order tracking page
- Cancellation before collection
- Initial database migration, seed services and RLS policies
- Secure environment template with no committed secrets

## Run in GitHub Codespaces

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open the forwarded port for `http://localhost:3000`.

## Connect Supabase

1. Open **Project Settings → API** in Supabase.
2. Copy the project URL and publishable key into `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. In the Supabase SQL Editor, run `supabase/migrations/202609110001_initial_schema.sql`.
4. In **Authentication → URL Configuration**, add the Codespace preview URL and eventual production URL as permitted redirect URLs.

Never add the database password or Supabase `service_role` key to `.env.local` or GitHub.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Project structure

```text
src/app/                 App Router pages
src/components/          Shared layout and interface components
src/features/            Booking, authentication and order features
src/data/                Service catalogue used by the interface
src/lib/supabase/        Browser, server and session clients
supabase/migrations/     Version-controlled database schema
```

## Current boundary

The customer booking and tracking foundation is included. Staff and admin operations, live slot-capacity management, payments and transactional notifications are planned for later phases.
