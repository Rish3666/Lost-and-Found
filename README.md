# University Lost & Found Portal

A modern, full-featured web application designed to streamline the reporting and recovery of lost items on campus. Built with Next.js 16, Supabase, and Shadcn UI.

## 🚀 Features

### Core Functionality
- **Report Lost Items**: detailed forms with image upload, location, and date incident.
- **Report Found Items**: specialized workflow with "Handover Decision" (drop off at admin vs. keep).
- **Advanced Search**: Browse items with live search, category filters (Electronics, ID Cards, etc.), and status tracking.

### Secure Claims System
- **Identity Verification**: Users must log in to claim items.
- **Self-Claim Prevention**: Reporters cannot claim their own items.
- **Proof of Ownership**: Claimants must submit a description or proof to verify ownership.

### Dashboards
- **User Dashboard**: Track your reported items and the status of your claims.
- **Admin Dashboard**: Secure panel for administrators to review, approve, or reject claims.

### Authentication
- **Secure Auth**: Email/Password login via Supabase.
- **Social Login**: Google OAuth integration.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI (Radix Primitives)
- **Database & Auth**: Supabase (PostgreSQL, GoTrue, Storage)
- **State Management**: Tanstack Query (React Query)
- **Forms**: React Hook Form + Zod

## 🏁 Getting Started

Follow these steps to set up the project locally.

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/lost-and-found.git
cd lost-and-found
npm install
```

### 2. Set up Supabase
1.  Create a new project at [database.new](https://database.new).
2.  Go to the **SQL Editor** in your Supabase Dashboard.
3.  Copy and run the contents of `supabase/setup.sql`. This will:
    *   Create all necessary tables (`items`, `claims`, `profiles`, `notifications`).
    *   Set up Row Level Security (RLS) policies.
    *   Create the `items` storage bucket.

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Enable Authentication
1.  In Supabase, go to **Authentication** -> **Providers** and enable **Google** (optional).
2.  Enable **Email** auth.
3.  **Important**: In **URL Configuration**, add your redirects:
    *   Local: `http://localhost:3000/auth/callback`
    *   Production: `https://your-project.vercel.app/auth/callback`

### 5. Run the server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔒 Admin Access
To make a user an admin (to access `/admin`):
1.  Sign up via the app.
2.  Go to your Supabase Table Editor -> `profiles` table.
3.  Find your user and change the `role` column from `student` to `admin`.

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
