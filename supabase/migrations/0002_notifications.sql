-- Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own notifications" 
  ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Function to handle new claim notifications
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

  -- Construct message based on item type
  IF item_type = 'LOST' THEN
    -- Someone claims they FOUND your lost item
    notification_message := 'Someone claims to have found your lost item: ' || item_title;
  ELSE
    -- Someone claims they OWN the item you found
    notification_message := 'Someone is claiming ownership of the item you found: ' || item_title;
  END IF;

  -- Insert notification for the item owner
  INSERT INTO public.notifications (user_id, title, message, link)
  VALUES (
    item_owner_id,
    'New Claim Request',
    notification_message,
    '/items/' || new.item_id -- Link to item detail where they can manage it (or dashboard)
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger logic
CREATE TRIGGER on_claim_created
  AFTER INSERT ON public.claims
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_claim();
