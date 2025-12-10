-- Create the 'items' bucket for storing lost and found images
-- We use ON CONFLICT to avoid errors if it already exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('items', 'items', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public access to view images
-- This enables everyone to see the images on the site
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'items' );

-- Policy: Allow authenticated users to upload images
-- This ensures only logged-in users can report items with images
CREATE POLICY "Authenticated Uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'items' );

-- Policy: Allow users to delete their own images (optional but good practice)
-- Matches the user's ID with the owner field of the object
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'items' AND auth.uid() = owner );
