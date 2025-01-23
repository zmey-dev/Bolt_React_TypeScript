-- Create function to handle quote request creation with proper permissions
CREATE OR REPLACE FUNCTION create_quote_request(
  p_name text,
  p_email text,
  p_phone text,
  p_timeline text,
  p_budget text,
  p_notes text,
  p_affiliate_id uuid DEFAULT NULL,
  p_access_code_id uuid DEFAULT NULL,
  p_images jsonb DEFAULT '[]'::jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER -- Run as function owner
SET search_path = public -- Set safe search path
AS $$
DECLARE
  v_quote_id uuid;
  v_image record;
BEGIN
  -- Input validation
  IF p_name IS NULL OR p_email IS NULL OR p_timeline IS NULL OR p_budget IS NULL THEN
    RAISE EXCEPTION 'Required fields cannot be null';
  END IF;

  -- Create quote request
  INSERT INTO quote_requests (
    name,
    email,
    phone,
    timeline,
    budget,
    notes,
    affiliate_id,
    access_code_id,
    status
  ) VALUES (
    p_name,
    p_email,
    p_phone,
    p_timeline,
    p_budget,
    p_notes,
    p_affiliate_id,
    p_access_code_id,
    'pending'
  )
  RETURNING id INTO v_quote_id;

  -- Insert images if any
  FOR v_image IN SELECT * FROM jsonb_to_recordset(p_images) AS x(
    image_id uuid,
    notes text,
    url text
  )
  LOOP
    INSERT INTO quote_request_images (
      quote_request_id,
      image_id,
      notes,
      url
    ) VALUES (
      v_quote_id,
      v_image.image_id,
      v_image.notes,
      v_image.url
    );
  END LOOP;

  RETURN v_quote_id;
END;
$$;

-- Grant execute permission to public
GRANT EXECUTE ON FUNCTION create_quote_request TO public;

-- Ensure proper RLS policies
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;

-- Create new policies
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create quote request images"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_email ON quote_requests(email);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_id ON quote_request_images(quote_request_id);