-- Drop existing trigger and function
DROP TRIGGER IF EXISTS custom_image_upload_trigger ON quote_request_images;
DROP FUNCTION IF EXISTS handle_custom_image_upload;

-- Create improved function to handle custom image uploads
CREATE OR REPLACE FUNCTION handle_custom_image_upload()
RETURNS TRIGGER AS $$
DECLARE
  next_order integer;
BEGIN
  -- Check if we need to create a gallery image
  IF NOT EXISTS (
    SELECT 1 FROM gallery_images WHERE id = NEW.image_id
  ) THEN
    -- Only proceed if we have a URL
    IF NEW.url IS NULL THEN
      RAISE EXCEPTION 'URL is required for custom uploads';
    END IF;

    -- Get the next display order
    SELECT COALESCE(MAX(display_order), 0) + 1
    INTO next_order
    FROM gallery_images;

    -- Create the gallery image with the next display order
    INSERT INTO gallery_images (
      id,
      title,
      url,
      width,
      height,
      custom_upload,
      display_order,
      created_at,
      updated_at
    ) VALUES (
      NEW.image_id,
      'Custom Upload',
      NEW.url,
      800,
      600,
      true,
      next_order,
      now(),
      now()
    );
  END IF;

  -- Clear the URL after we've used it
  NEW.url = NULL;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to handle custom upload: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for custom uploads
CREATE TRIGGER custom_image_upload_trigger
  BEFORE INSERT ON quote_request_images
  FOR EACH ROW
  EXECUTE FUNCTION handle_custom_image_upload();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_images_display_order 
ON gallery_images(display_order);