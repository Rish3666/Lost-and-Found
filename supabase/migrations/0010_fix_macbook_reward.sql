-- FIX: Correct reward amount for Macbook Air
-- Run this in Supabase SQL Editor

UPDATE public.items
SET reward_amount = 3000
WHERE title ILIKE '%M4 macbook air%' AND reward_amount = 2995;
