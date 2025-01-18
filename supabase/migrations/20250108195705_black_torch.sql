-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;

-- Create more comprehensive policies for quote_requests
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own quote requests"
  ON quote_requests
  FOR SELECT
  TO public
  USING (email = current_user);

-- Create policies for quote_request_images
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