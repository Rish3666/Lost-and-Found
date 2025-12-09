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

## Supabase
Migration SQL lives in `supabase/migrations/0001_init.sql`:
- Profiles (extends `auth.users`)
- Items with status/type/category enums
- Claims with RLS for owners/claimants
- Public bucket `item-images` with authenticated uploads

## Scripts
- `npm run dev` – start dev server
- `npm run lint` – lint with ESLint
