/*
  # Add display order to gallery types

  1. Changes
    - Add display_order column to gallery_types table
    - Set initial display order based on creation date
    - Add index for better performance
*/

-- Add display_order column
ALTER TABLE gallery_types 
ADD COLUMN IF NOT EXISTS display_order integer;

-- Set initial display_order based on created_at
WITH ordered_types AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM gallery_types
)
UPDATE gallery_types
SET display_order = ordered_types.row_num
FROM ordered_types
WHERE gallery_types.id = ordered_types.id;

-- Make display_order NOT NULL after setting initial values
ALTER TABLE gallery_types 
ALTER COLUMN display_order SET NOT NULL;

-- Add index for efficient ordering
CREATE INDEX IF NOT EXISTS gallery_types_display_order_idx 
ON gallery_types(display_order);