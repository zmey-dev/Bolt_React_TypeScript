-- Drop existing storage policies
DROP POLICY IF EXISTS "storage_objects_read_20250122" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_insert_20250122" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_update_20250122" ON storage.objects;
DROP POLICY IF EXISTS "storage_objects_delete_20250122" ON storage.objects;

-- Create new storage policies with proper role checks
CREATE POLICY "storage_objects_read_20250122"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'images');

CREATE POLICY "storage_objects_insert_20250122"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "storage_objects_update_20250122"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "storage_objects_delete_20250122"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Update bucket configuration
UPDATE storage.buckets
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
WHERE id = 'images';

-- Ensure proper RLS is enabled on gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Drop existing gallery_images policies
DROP POLICY IF EXISTS "Admin access for gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "Anyone can view gallery images" ON gallery_images;

-- Create separate policies for each operation on gallery_images
CREATE POLICY "gallery_images_select_20250122"
  ON gallery_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "gallery_images_insert_20250122"
  ON gallery_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "gallery_images_update_20250122"
  ON gallery_images FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "gallery_images_delete_20250122"
  ON gallery_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at 
ON gallery_images(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_type_id 
ON gallery_images(gallery_type_id);

-- Grant necessary permissions
GRANT ALL ON gallery_images TO authenticated;
GRANT ALL ON storage.objects TO authenticated;