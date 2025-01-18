-- Create function to handle reordering gallery images
CREATE OR REPLACE FUNCTION reorder_gallery_images(
  image_ids uuid[],
  new_orders int[]
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
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