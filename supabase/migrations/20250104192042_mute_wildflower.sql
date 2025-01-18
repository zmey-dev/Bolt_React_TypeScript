-- Ensure proper cascade deletion for quote requests
ALTER TABLE quote_request_images
DROP CONSTRAINT IF EXISTS quote_request_images_quote_request_id_fkey,
ADD CONSTRAINT quote_request_images_quote_request_id_fkey
  FOREIGN KEY (quote_request_id)
  REFERENCES quote_requests(id)
  ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_id ON quote_requests(id);
CREATE INDEX IF NOT EXISTS idx_quote_request_images_quote_request_id 
  ON quote_request_images(quote_request_id);

-- Add RLS policies for deletion
DROP POLICY IF EXISTS "Admins can delete quote requests" ON quote_requests;
CREATE POLICY "Admins can delete quote requests"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );