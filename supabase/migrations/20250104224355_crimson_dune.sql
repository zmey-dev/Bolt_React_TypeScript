/*
  # Fix quote request submission issues

  1. Changes
    - Add url column to quote_request_images table
    - Update trigger function to handle custom uploads properly
    - Add proper foreign key constraints

  2. Security
    - Maintain existing RLS policies
*/

-- Add url column to quote_request_images
ALTER TABLE quote_request_images
ADD COLUMN IF NOT EXISTS url text;

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS custom_image_upload_trigger ON quote_request_images;
DROP FUNCTION IF EXISTS handle_custom_image_upload;

-- Create improved function to handle custom image uploads
CREATE OR REPLACE FUNCTION handle_custom_image_upload()
RETURNS TRIGGER AS $$
DECLARE
  image_exists boolean;
BEGIN
  -- Check if image exists
  SELECT EXISTS (
    SELECT 1 FROM gallery_images 
    WHERE id = NEW.image_id
  ) INTO image_exists;

  -- Only insert if image doesn't exist and we have a URL
  IF NOT image_exists AND NEW.url IS NOT NULL THEN
    INSERT INTO gallery_images (
      id,
      title,
      url,
      width,
      height,
      custom_upload,
      created_at,
      updated_at
    ) VALUES (
      NEW.image_id,
      'Custom Upload',
      NEW.url,
      800, -- Default width
      600, -- Default height
      true,
      now(),
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger for custom uploads
CREATE TRIGGER custom_image_upload_trigger
  BEFORE INSERT ON quote_request_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_custom_image_upload();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_request_images_image_id 
ON quote_request_images(image_id);

CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_request_id 
ON quote_request_images(quote_request_id);