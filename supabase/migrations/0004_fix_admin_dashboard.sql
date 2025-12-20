-- ==========================================
-- FIX ADMIN DASHBOARD & MISSING FEATURES
-- ==========================================

-- 1. ADD SOFT DELETE TO ITEMS
-- ------------------------------------------
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS is_deleted boolean not null default false;
ALTER TABLE public.items ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- 2. UPDATE ITEMS RLS (Admin Access + Soft Delete)
-- ------------------------------------------
DROP POLICY IF EXISTS "items select public" ON public.items;
DROP POLICY IF EXISTS "Items are viewable by everyone" ON public.items; -- Drop old one if exists

CREATE POLICY "items select public" 
  ON public.items FOR SELECT 
  USING (is_deleted = false);

DROP POLICY IF EXISTS "items select admin and owner" ON public.items;
CREATE POLICY "items select admin and owner" 
  ON public.items FOR SELECT 
  USING (
    -- Admin sees everything
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR 
    -- Owner sees their own (even deleted)
    (auth.uid() = user_id)
  );

DROP POLICY IF EXISTS "items update admin" ON public.items;
CREATE POLICY "items update admin"
  ON public.items FOR UPDATE
  USING (
    -- Admin can update anything (e.g., delete)
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
    OR
    -- Users update their own
    (auth.uid() = user_id)
  );

-- 3. UPDATE CLAIMS RLS (Admin Access)
-- ------------------------------------------
-- Allow admins to VIEW all claims
DROP POLICY IF EXISTS "claims select admin" ON public.claims;
CREATE POLICY "claims select admin" 
  ON public.claims FOR SELECT 
  USING (
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- Allow admins to UPDATE claims (Approve/Reject)
DROP POLICY IF EXISTS "claims update admin" ON public.claims;
CREATE POLICY "claims update admin" 
  ON public.claims FOR UPDATE 
  USING (
    (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  );

-- 4. FIX NOTIFICATIONS (Trigger & Policies)
-- ------------------------------------------
-- Add missing policy for users to mark notifications as read
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create/Update Function for Claim Notifications
CREATE OR REPLACE FUNCTION public.handle_new_claim()
RETURNS TRIGGER AS $$
DECLARE
  item_owner_id UUID;
  item_title TEXT;
  item_type TEXT;
  notification_message TEXT;
BEGIN
  -- Get item details
  SELECT user_id, title, type INTO item_owner_id, item_title, item_type
  FROM public.items
  WHERE id = new.item_id;

  -- Construct message
  IF item_type = 'LOST' THEN
    notification_message := 'Someone claims to have found your lost item: ' || item_title;
  ELSE
    notification_message := 'Someone is claiming ownership of the item you found: ' || item_title;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (item_owner_id, 'New Claim Request', notification_message, '/items/' || new.item_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate Trigger
DROP TRIGGER IF EXISTS on_claim_created ON public.claims;
CREATE TRIGGER on_claim_created
  AFTER INSERT ON public.claims
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_claim();
