/*
  # Update quote request images schema

  1. Changes
    - Add custom_upload flag to gallery_images table
    - Create function to handle custom uploads
    - Add indexes for better performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add custom_upload flag to gallery_images
ALTER TABLE gallery_images
ADD COLUMN IF NOT EXISTS custom_upload boolean DEFAULT false;

-- Add index for custom uploads
CREATE INDEX IF NOT EXISTS idx_gallery_images_custom_upload 
ON gallery_images(custom_upload) 
WHERE custom_upload = true;

-- Create function to handle custom image uploads
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

  -- Only insert if image doesn't exist
  IF NOT image_exists THEN
    INSERT INTO gallery_images (
      id,
      title,
      url,
      width,
      height,
      custom_upload
    ) VALUES (
      NEW.image_id,
      'Custom Upload',
      NEW.url,
      800, -- Default width
      600, -- Default height
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom uploads
DROP TRIGGER IF EXISTS custom_image_upload_trigger ON quote_request_images;
CREATE TRIGGER custom_image_upload_trigger
  BEFORE INSERT ON quote_request_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_custom_image_upload();