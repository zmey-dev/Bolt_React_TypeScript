-- Create storage bucket for generated images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "storage_read_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_insert_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_update_policy_20250120" ON storage.objects;
DROP POLICY IF EXISTS "storage_delete_policy_20250120" ON storage.objects;

-- Create new storage policies with simplified permissions
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

-- Update bucket configuration with proper CORS settings
ALTER TABLE storage.buckets 
ADD COLUMN IF NOT EXISTS cors_origins text[] DEFAULT '{*}',
ADD COLUMN IF NOT EXISTS cors_methods text[] DEFAULT '{GET,POST,PUT,DELETE,OPTIONS}',
ADD COLUMN IF NOT EXISTS cors_allowed_headers text[] DEFAULT '{Authorization,Content-Type,Accept,Origin,User-Agent}',
ADD COLUMN IF NOT EXISTS cors_exposed_headers text[] DEFAULT '{Content-Range}',
ADD COLUMN IF NOT EXISTS cors_max_age integer DEFAULT 3600;

-- Update bucket settings
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  cors_origins = '{*}',
  cors_methods = '{GET,POST,PUT,DELETE,OPTIONS}',
  cors_allowed_headers = '{Authorization,Content-Type,Accept,Origin,User-Agent}',
  cors_exposed_headers = '{Content-Range}',
  cors_max_age = 3600
WHERE id = 'images';