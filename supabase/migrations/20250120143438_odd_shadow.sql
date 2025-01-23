-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Storage access policy" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Files can be updated by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Files can be deleted by anyone" ON storage.objects;

-- Create separate policies for better control
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "Allow public upload to generated folder"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'images' AND
  position('generated/' in name) = 1
);

CREATE POLICY "Allow public update of own uploads"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'images' AND
  position('generated/' in name) = 1
);

CREATE POLICY "Allow public delete of own uploads"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'images' AND
  position('generated/' in name) = 1
);