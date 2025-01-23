-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;
DROP POLICY IF EXISTS "Users can read own quote request images" ON quote_request_images;

-- Create more permissive policies for quote request images
CREATE POLICY "public_insert_quote_request_images"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "public_select_quote_request_images"
  ON quote_request_images
  FOR SELECT
  TO public
  USING (true);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_id 
ON quote_request_images(quote_request_id);

CREATE INDEX IF NOT EXISTS idx_quote_request_images_image_id 
ON quote_request_images(image_id);