/*
  # Fix RLS policies for image_tags table

  1. Changes
    - Drop existing policies
    - Create new comprehensive policies for image_tags table
    - Add proper admin access controls
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can manage image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can insert image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can delete image_tags" ON image_tags;

-- Enable RLS
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Public read access for image_tags"
  ON image_tags FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admin write access for image_tags"
  ON image_tags
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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_image_tags_image_id 
ON image_tags(image_id);

CREATE INDEX IF NOT EXISTS idx_image_tags_tag_id 
ON image_tags(tag_id);