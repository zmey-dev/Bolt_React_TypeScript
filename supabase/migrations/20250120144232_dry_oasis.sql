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
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to generated folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update of own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete of own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Public write access" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_read_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_public_write_20250120" ON storage.objects;

-- Create storage policies with unique names
CREATE POLICY "storage_objects_read_20250120"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_objects_insert_20250120"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

CREATE POLICY "storage_objects_update_20250120"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_objects_delete_20250120"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'images');

-- Create generated folder structure
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata)
SELECT 
  'images',
  'generated/.keep',
  auth.uid(),
  now(),
  now(),
  '{"mimetype": "text/plain", "size": 0}'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'images' 
  AND (name = 'generated/' OR name = 'generated/.keep')
);