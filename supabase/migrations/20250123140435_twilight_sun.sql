-- Drop existing policies with unique suffix to avoid conflicts
DROP POLICY IF EXISTS "quote_requests_insert_20250123" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_select_20250123" ON quote_requests;
DROP POLICY IF EXISTS "quote_request_images_insert_20250123" ON quote_request_images;
DROP POLICY IF EXISTS "quote_request_images_select_20250123" ON quote_request_images;

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;

-- Create more permissive policies for quote requests with unique names
CREATE POLICY "quote_requests_insert_20250123"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "quote_requests_select_20250123"
  ON quote_requests
  FOR SELECT
  TO public
  USING (true);

-- Create policies for quote request images with unique names
CREATE POLICY "quote_request_images_insert_20250123"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "quote_request_images_select_20250123"
  ON quote_request_images
  FOR SELECT
  TO public
  USING (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at_20250123 
ON quote_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_id_20250123 
ON quote_request_images(quote_request_id);