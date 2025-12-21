-- COMPREHENSIVE FIX FOR ADMIN DASHBOARD
-- Run this in Supabase SQL Editor

-- 1. Ensure Columns Exist (Safe to run multiple times)
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_deleted boolean not null default false;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. Reset Items RLS Policies
-- Drop potential conflicting policies
DROP POLICY IF EXISTS "items select public" ON public.items;
DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items;
DROP POLICY IF EXISTS "items select admin" ON public.items;
DROP POLICY IF EXISTS "items select admin and owner" ON public.items;
DROP POLICY IF EXISTS "items update admin" ON public.items;
DROP POLICY IF EXISTS "items update admin and owner" ON public.items;
DROP POLICY IF EXISTS "items delete owner" ON public.items;

-- A) SELECT: Public sees active, Admin/Owner sees all
CREATE POLICY "items select policy"
  ON public.items FOR SELECT
  USING (
    is_deleted = false 
    OR 
    (auth.role() = 'authenticated' AND (
      -- Admin Check
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
      OR
      -- Owner Check
      user_id = auth.uid()
    ))
  );

-- B) UPDATE: Admin can update ANY (soft delete), Owner can update OWN
CREATE POLICY "items update policy"
  ON public.items FOR UPDATE
  USING (
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR
    (auth.uid() = user_id)
  );

-- C) DELETE: Owner can hard delete (optional), Admin usually uses soft delete (update)
CREATE POLICY "items delete policy"
  ON public.items FOR DELETE
  USING (
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR
    (auth.uid() = user_id)
  );

-- D) INSERT: Authenticated users can create
DROP POLICY IF EXISTS "items insert authenticated" ON public.items;
CREATE POLICY "items insert authenticated"
  ON public.items FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 3. Reset Claims RLS Policies (Ensure Admins can see/edit claims)
DROP POLICY IF EXISTS "claims select admin" ON public.claims;
DROP POLICY IF EXISTS "claims select by claimant or owner" ON public.claims;
DROP POLICY IF EXISTS "claims update admin" ON public.claims;

-- A) SELECT Claims
CREATE POLICY "claims select policy"
  ON public.claims FOR SELECT
  USING (
    -- Admin
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR
    -- Claimant
    auth.uid() = claimant_id
    OR
    -- Item Owner (Check if item belongs to user)
    EXISTS (SELECT 1 FROM public.items WHERE id = item_id AND user_id = auth.uid())
  );

-- B) UPDATE Claims (Admins approve/reject)
CREATE POLICY "claims update policy"
  ON public.claims FOR UPDATE
  USING (
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- C) INSERT Claims
DROP POLICY IF EXISTS "claims insert authenticated" ON public.claims;
CREATE POLICY "claims insert authenticated"
  ON public.claims FOR INSERT
  WITH CHECK (auth.uid() = claimant_id);
