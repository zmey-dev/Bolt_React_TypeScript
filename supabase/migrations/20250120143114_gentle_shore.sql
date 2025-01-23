-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Public read access for generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Files can be updated by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Files can be deleted by anyone" ON storage.objects;

-- Create single unified policy for all operations
CREATE POLICY "Storage access policy"
ON storage.objects
FOR ALL
TO public
USING (bucket_id = 'images')
WITH CHECK (bucket_id = 'images');