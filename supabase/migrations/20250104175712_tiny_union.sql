/*
  # Fix tags and policies

  1. Changes
    - Drop existing policies before recreating them
    - Add missing policies for image_tags table
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Anyone can view image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage image_tags" ON image_tags;

-- Create tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create image_tags junction table if it doesn't exist
CREATE TABLE IF NOT EXISTS image_tags (
  image_id uuid REFERENCES gallery_images(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (image_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can view image_tags"
  ON image_tags FOR SELECT TO public USING (true);

-- Admin write access
CREATE POLICY "Admins can manage tags"
  ON tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage image_tags"
  ON image_tags
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add some initial tags
INSERT INTO tags (name) VALUES
  ('Architectural'),
  ('Concert'),
  ('Festival'),
  ('Installation'),
  ('Laser Show'),
  ('LED Wall'),
  ('Neon'),
  ('Projection Mapping'),
  ('Stage Design'),
  ('Urban')
ON CONFLICT (name) DO NOTHING;