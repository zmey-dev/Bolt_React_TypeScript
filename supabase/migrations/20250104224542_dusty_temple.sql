/*
  # Fix quote request submission with proper image handling

  1. Changes
    - Add proper handling for custom uploads
    - Fix foreign key constraints
    - Add better error handling for image creation

  2. Security
    - Maintain existing RLS policies
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS custom_image_upload_trigger ON quote_request_images;
DROP FUNCTION IF EXISTS handle_custom_image_upload;

-- Create improved function to handle custom image uploads
CREATE OR REPLACE FUNCTION handle_custom_image_upload()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if we need to create a gallery image
  IF NOT EXISTS (
    SELECT 1 FROM gallery_images WHERE id = NEW.image_id
  ) THEN
    -- Only proceed if we have a URL
    IF NEW.url IS NULL THEN
      RAISE EXCEPTION 'URL is required for custom uploads';
    END IF;

    -- Create the gallery image first
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
      800,
      600,
      true,
      now(),
      now()
    );
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error and re-raise
    RAISE NOTICE 'Error in handle_custom_image_upload: %', SQLERRM;
    RAISE;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom uploads
CREATE TRIGGER custom_image_upload_trigger
  BEFORE INSERT ON quote_request_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_custom_image_upload();

-- Add deferred foreign key constraint
ALTER TABLE quote_request_images 
DROP CONSTRAINT IF EXISTS quote_request_images_image_id_fkey,
ADD CONSTRAINT quote_request_images_image_id_fkey 
  FOREIGN KEY (image_id) 
  REFERENCES gallery_images(id) 
  DEFERRABLE INITIALLY DEFERRED;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_request_images_image_id 
ON quote_request_images(image_id);

CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_request_id 
ON quote_request_images(quote_request_id);