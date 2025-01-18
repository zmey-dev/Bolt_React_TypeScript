/*
  # Add display order to gallery images
  
  1. Changes
    - Add display_order column to gallery_images
    - Set initial order based on created_at
    - Add index for efficient ordering
  
  2. Security
    - Maintain existing RLS policies
*/

-- Add display_order column
ALTER TABLE gallery_images 
ADD COLUMN IF NOT EXISTS display_order integer;

-- Set initial display_order based on created_at
WITH ordered_images AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM gallery_images
)
UPDATE gallery_images
SET display_order = ordered_images.row_num
FROM ordered_images
WHERE gallery_images.id = ordered_images.id;

-- Make display_order NOT NULL after setting initial values
ALTER TABLE gallery_images 
ALTER COLUMN display_order SET NOT NULL;

-- Add index for efficient ordering
CREATE INDEX IF NOT EXISTS gallery_images_display_order_idx 
ON gallery_images(display_order);