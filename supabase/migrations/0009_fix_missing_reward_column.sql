-- FIX: Add missing reward_amount column
-- Run this in Supabase SQL Editor

-- 1. Add column if it doesn't exist
ALTER TABLE public.items 
ADD COLUMN IF NOT EXISTS reward_amount numeric DEFAULT NULL;

-- 2. Force schema cache reload (Supabase usually does this automatically, but this ensures it)
NOTIFY pgrst, 'reload schema';
