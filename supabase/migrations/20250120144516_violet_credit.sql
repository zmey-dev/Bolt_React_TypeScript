-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "storage_read_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for generated images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload generated images" ON storage.objects;
DROP POLICY IF EXISTS "Files can be updated by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Files can be deleted by anyone" ON storage.objects;
DROP POLICY IF EXISTS "Storage access policy" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to generated folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update of own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete of own uploads" ON storage.objects;

-- Create new storage policies with proper CORS and security settings
CREATE POLICY "storage_read_policy_20250120"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_insert_policy_20250120"
ON storage.objects FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'images' AND
  CASE 
    WHEN auth.role() = 'authenticated' THEN true
    WHEN position('generated/' in name) = 1 THEN true
    ELSE false
  END
);

CREATE POLICY "storage_update_policy_20250120"
ON storage.objects FOR UPDATE
TO public
USING (
  bucket_id = 'images' AND
  CASE 
    WHEN auth.role() = 'authenticated' THEN true
    WHEN position('generated/' in name) = 1 THEN true
    ELSE false
  END
);

CREATE POLICY "storage_delete_policy_20250120"
ON storage.objects FOR DELETE
TO public
USING (
  bucket_id = 'images' AND
  CASE 
    WHEN auth.role() = 'authenticated' THEN true
    WHEN position('generated/' in name) = 1 THEN true
    ELSE false
  END
);

-- Update bucket configuration with proper CORS settings
UPDATE storage.buckets
SET public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    owner = auth.uid()
WHERE id = 'images';

-- Ensure generated folder exists
INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, metadata)
SELECT 
  'images',
  'generated/.keep',
  auth.uid(),
  now(),
  now(),
  jsonb_build_object(
    'mimetype', 'text/plain',
    'size', 0,
    'cacheControl', 'public, max-age=31536000'
  )
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'images' 
  AND (name = 'generated/' OR name = 'generated/.keep')
);