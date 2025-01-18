/*
  # Add tags functionality

  1. New Tables
    - `tags`: Stores unique tag names
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamp)
    - `image_tags`: Junction table for image-tag relationships
      - `image_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Public read access
    - Admin write access
*/

-- Create tags table
CREATE TABLE IF NOT EXISTS tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create image_tags junction table
CREATE TABLE IF NOT EXISTS image_tags (
  image_id uuid REFERENCES gallery_images(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (image_id, tag_id)
);

-- Enable RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_tags ENABLE ROW LEVEL SECURITY;

-- Public read access for tags
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT TO public USING (true);

-- Public read access for image_tags
CREATE POLICY "Anyone can view image_tags"
  ON image_tags FOR SELECT TO public USING (true);

-- Admin write access for tags
CREATE POLICY "Admins can insert tags"
  ON tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update tags"
  ON tags
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete tags"
  ON tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admin write access for image_tags
CREATE POLICY "Admins can insert image_tags"
  ON image_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete image_tags"
  ON image_tags
  FOR DELETE
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