-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "storage_read_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy_20250120" ON storage.objects;

-- Create new storage policies with proper permissions
CREATE POLICY "storage_read_policy_20250120"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_insert_policy_20250120"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'images');

CREATE POLICY "storage_update_policy_20250120"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_delete_policy_20250120"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'images');

-- Update bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  owner = auth.uid()
WHERE id = 'images';

-- Create generated folder
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
  AND name = 'generated/.keep'
);