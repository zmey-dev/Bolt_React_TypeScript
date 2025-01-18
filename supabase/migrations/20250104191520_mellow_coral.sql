-- Add cascade deletion to quote_request_images
ALTER TABLE quote_request_images
DROP CONSTRAINT IF EXISTS quote_request_images_quote_request_id_fkey,
ADD CONSTRAINT quote_request_images_quote_request_id_fkey
  FOREIGN KEY (quote_request_id)
  REFERENCES quote_requests(id)
  ON DELETE CASCADE;

-- Ensure notes column exists and has proper constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quote_request_images' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE quote_request_images ADD COLUMN notes text;
  END IF;
END $$;