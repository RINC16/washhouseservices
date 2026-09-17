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
- Role-aware login for customer and administrator accounts
- Protected admin dashboard, all-orders view and order operations
- Controlled one-step order status progression with audit history
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

3. In the Supabase SQL Editor, run the files in `supabase/migrations/` in filename order.
4. In **Authentication → URL Configuration**, add the Codespace preview URL and eventual production URL as permitted redirect URLs.

## Create the first administrator

1. Create an account through the website using the email that should manage WashHouse.
2. Run the admin portal migration: `supabase/migrations/202609170001_admin_portal.sql`.
3. In the Supabase SQL Editor, promote that existing account (replace the email):

   ```sql
   update public.profiles as profile
   set role = 'admin'
   from auth.users as account
   where profile.id = account.id
     and lower(account.email) = lower('admin@example.com');
   ```

The same sign-in page is used for everyone. Administrators are sent to `/admin`; all new registrations remain customers by default. There is no public admin registration option.

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

The customer booking and tracking foundation and the first admin order-management portal are included. Staff accounts, live slot-capacity management, payments and transactional notifications are planned for later phases.
