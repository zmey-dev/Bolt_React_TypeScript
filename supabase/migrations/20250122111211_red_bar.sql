-- Create a sequence for display order
CREATE SEQUENCE IF NOT EXISTS gallery_images_display_order_seq;

-- Create function to get next display order atomically
CREATE OR REPLACE FUNCTION get_next_display_order()
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
  next_val integer;
BEGIN
  -- Get next value from sequence
  SELECT nextval('gallery_images_display_order_seq') INTO next_val;
  
  -- Return as JSON object
  RETURN json_build_object('next_order', next_val);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_next_display_order TO authenticated;

-- Update existing display orders to use sequence
DO $$
DECLARE
  max_order integer;
BEGIN
  -- Get current maximum display order
  SELECT COALESCE(MAX(display_order), 0)
  INTO max_order
  FROM gallery_images;
  
  -- Set sequence to start after current maximum
  PERFORM setval('gallery_images_display_order_seq', max_order);
END $$;