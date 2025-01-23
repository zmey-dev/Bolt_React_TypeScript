-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first
DROP POLICY IF EXISTS "Public read access for generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Files can be updated by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Files can be deleted by anyone" ON storage.objects;

-- Create storage policies for generated images
CREATE POLICY "Public read access for generated images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Anyone can upload generated images"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'generated'
);

CREATE POLICY "Files can be updated by anyone"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'generated'
);

CREATE POLICY "Files can be deleted by anyone"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'images' AND
  (storage.foldername(name))[1] = 'generated'
);