-- Create gallery_types table
CREATE TABLE IF NOT EXISTS gallery_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gallery_types ENABLE ROW LEVEL SECURITY;

-- First, modify gallery_images id to be uuid
DO $$ 
BEGIN
  -- Update existing records to use UUID
  UPDATE gallery_images
  SET id = gen_random_uuid()
  WHERE id IS NOT NULL;

  -- Alter the column type
  ALTER TABLE gallery_images 
  ALTER COLUMN id TYPE uuid USING id::uuid;

  -- Set default for id column
  ALTER TABLE gallery_images 
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
END $$;

-- Now add the gallery_type_id column
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS gallery_type_id uuid REFERENCES gallery_types(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_type_id ON gallery_images(gallery_type_id);

-- Create policies for gallery_types
CREATE POLICY "Anyone can view gallery types"
  ON gallery_types
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage gallery types"
  ON gallery_types
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_gallery_types_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_gallery_types_updated_at
  BEFORE UPDATE ON gallery_types
  FOR EACH ROW
  EXECUTE FUNCTION update_gallery_types_updated_at();