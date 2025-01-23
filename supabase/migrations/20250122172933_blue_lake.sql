-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can view quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can delete quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Affiliates can view own quote requests" ON quote_requests;

-- Create updated policies that include super_admin role
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
    OR affiliate_id = auth.uid()
  );

CREATE POLICY "Admins can update quote requests"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete quote requests"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_affiliate_id 
ON quote_requests(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_access_code_id 
ON quote_requests(access_code_id);