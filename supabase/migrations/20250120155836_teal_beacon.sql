-- Drop existing quote_request_images table
DROP TABLE IF EXISTS quote_request_images CASCADE;

-- Recreate quote_request_images table with proper constraints
CREATE TABLE quote_request_images (
  quote_request_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE,
  image_id uuid REFERENCES gallery_images(id) ON DELETE SET NULL,
  notes text,
  url text,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (quote_request_id, image_id)
);

-- Enable RLS
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create quote request images"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own quote request images"
  ON quote_request_images
  FOR SELECT
  TO public
  USING (
    quote_request_id IN (
      SELECT id FROM quote_requests 
      WHERE email = current_user
    )
  );

-- Add index for better performance
CREATE INDEX idx_quote_request_images_quote_id 
ON quote_request_images(quote_request_id);

CREATE INDEX idx_quote_request_images_image_id 
ON quote_request_images(image_id);