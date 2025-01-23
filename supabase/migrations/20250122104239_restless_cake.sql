/*
  # Add admin access policy for gallery_images

  1. Changes
    - Add policy to allow admin access to gallery_images table
    - Ensure both admin and super_admin roles have access
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin access for gallery_images" ON gallery_images;

-- Create new policy for admin access
CREATE POLICY "Admin access for gallery_images"
  ON gallery_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_created_at 
ON gallery_images(created_at DESC);