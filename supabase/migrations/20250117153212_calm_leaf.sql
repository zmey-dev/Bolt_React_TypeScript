-- Add gallery_type_id column
ALTER TABLE gallery_images
ADD COLUMN IF NOT EXISTS gallery_type_id uuid REFERENCES gallery_types(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_type_id 
ON gallery_images(gallery_type_id);