/*
  # Add notes to quote request images

  1. Changes
    - Add notes column to quote_request_images table for storing per-image notes
*/

-- Add notes column to quote_request_images
ALTER TABLE quote_request_images
ADD COLUMN notes text;