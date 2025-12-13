# University Lost & Found Portal

Campus-ready lost & found system built with Next.js 14 (App Router), TypeScript, Tailwind (Shadcn UI), Supabase (Auth, DB, Storage), and Lucide icons.

## Getting Started

```bash
npm install
npm run dev
# http://localhost:3000
```

## Tech Stack
- Next.js 14, TypeScript
- Tailwind CSS + Shadcn UI
- Supabase (Postgres, Auth, Storage)
- React Hook Form + Zod
- Lucide React

## Supabase Setup (Important)
The app requires database tables and storage buckets to function.
Run the master setup script in your Supabase Dashboard SQL Editor:

**SQL File:** `supabase/setup.sql`

This script will:
1. Create Tables (`profiles`, `items`, `claims`)
2. Create Storage Bucket (`items`)
3. Set up RLS Policies

Env (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Scripts
- `npm run dev` – start dev server
- `npm run lint` – lint with ESLint
