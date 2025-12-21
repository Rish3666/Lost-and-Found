-- Fix Admin permissions for Updating/Deleting items
-- This policy ensures admins can update ANY item (required for soft delete)

DROP POLICY IF EXISTS "items update admin" ON public.items;
DROP POLICY IF EXISTS "items update admin and owner" ON public.items;

CREATE POLICY "items update admin and owner"
  ON public.items FOR UPDATE
  USING (
    -- Admin can update anything
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR
    -- Users update their own
    (auth.uid() = user_id)
  );
