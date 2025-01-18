-- Drop existing constraints and indexes
DROP INDEX IF EXISTS idx_tags_gallery_type_id;
DROP INDEX IF EXISTS idx_gallery_images_gallery_type_id;

-- Add gallery_type_id to tags table
ALTER TABLE tags
ADD COLUMN IF NOT EXISTS gallery_type uuid REFERENCES gallery_types(id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tags_gallery_type 
ON tags(gallery_type);

-- Add unique constraint for tag name within a gallery
ALTER TABLE tags
ADD CONSTRAINT tags_name_gallery_type_unique 
UNIQUE (name, gallery_type);

-- Update gallery_images table
ALTER TABLE gallery_images
RENAME COLUMN gallery_type_id TO gallery_type;

-- Create index for gallery_type
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_type 
ON gallery_images(gallery_type);