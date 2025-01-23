-- Add affiliate_id to quote_requests table
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS affiliate_id uuid REFERENCES profiles(id);

-- Add access_code_id to quote_requests table
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS access_code_id uuid REFERENCES access_codes(id);

-- Rename created_by to created_by_id in access_codes table
ALTER TABLE access_codes 
RENAME COLUMN created_by TO created_by_id;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_affiliate_id 
ON quote_requests(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_quote_requests_access_code_id 
ON quote_requests(access_code_id);

CREATE INDEX IF NOT EXISTS idx_access_codes_created_by_id 
ON access_codes(created_by_id);

-- Update policies to reflect new column names
DROP POLICY IF EXISTS "Admins can manage access codes" ON access_codes;
CREATE POLICY "Admins can manage access codes"
  ON access_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add policy for affiliates to view their own access codes
CREATE POLICY "Affiliates can view own access codes"
  ON access_codes
  FOR SELECT
  TO authenticated
  USING (created_by_id = auth.uid());

-- Add policy for affiliates to view their own quote requests
CREATE POLICY "Affiliates can view own quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (affiliate_id = auth.uid());