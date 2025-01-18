-- Drop existing function
DROP FUNCTION IF EXISTS reorder_gallery_images;

-- Create function to handle reordering gallery images with proper permissions
CREATE OR REPLACE FUNCTION reorder_gallery_images(
  image_ids uuid[],
  new_orders int[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Run as function owner
SET search_path = public -- Set safe search path
AS $$
BEGIN
  -- Verify user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can reorder images';
  END IF;

  -- Temporarily disable the display_order uniqueness constraint
  ALTER TABLE gallery_images DROP CONSTRAINT IF EXISTS gallery_images_display_order_key;
  
  -- Update orders in a single transaction
  FOR i IN 1..array_length(image_ids, 1) LOOP
    UPDATE gallery_images
    SET 
      display_order = new_orders[i],
      updated_at = now()
    WHERE id = image_ids[i];
  END LOOP;
  
  -- Re-enable the uniqueness constraint
  ALTER TABLE gallery_images ADD CONSTRAINT gallery_images_display_order_key UNIQUE (display_order);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION reorder_gallery_images TO authenticated;

-- Ensure RLS is enabled
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Update admin policies to allow all operations
CREATE POLICY "Admins can manage gallery images"
  ON gallery_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );