-- Drop existing primary key and foreign key constraints
ALTER TABLE quote_request_images 
DROP CONSTRAINT IF EXISTS quote_request_images_pkey,
DROP CONSTRAINT IF EXISTS quote_request_images_image_id_fkey;

-- Create a new id column for primary key
ALTER TABLE quote_request_images
ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;

-- Make image_id nullable and add foreign key with ON DELETE SET NULL
ALTER TABLE quote_request_images 
ALTER COLUMN image_id DROP NOT NULL,
ADD CONSTRAINT quote_request_images_image_id_fkey
  FOREIGN KEY (image_id)
  REFERENCES gallery_images(id)
  ON DELETE SET NULL;

-- Create unique constraint for quote_request_id and image_id pair
-- This maintains the business logic of one image per quote request
ALTER TABLE quote_request_images
ADD CONSTRAINT quote_request_images_request_image_unique 
UNIQUE (quote_request_id, image_id)
DEFERRABLE INITIALLY DEFERRED;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_request_images_image_id 
ON quote_request_images(image_id)
WHERE image_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_request_id 
ON quote_request_images(quote_request_id);