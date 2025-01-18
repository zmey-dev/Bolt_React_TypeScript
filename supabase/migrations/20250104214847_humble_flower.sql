-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can validate access codes" ON access_codes;
DROP POLICY IF EXISTS "Admins can manage access codes" ON access_codes;

-- Create access_codes table if it doesn't exist
CREATE TABLE IF NOT EXISTS access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  uses_remaining integer,
  last_used_at timestamptz,
  
  -- Add constraint to ensure uses_remaining is positive
  CONSTRAINT positive_uses CHECK (uses_remaining IS NULL OR uses_remaining >= 0)
);

-- Enable RLS if not already enabled
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Anyone can validate access codes"
  ON access_codes
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (uses_remaining IS NULL OR uses_remaining > 0)
  );

CREATE POLICY "Admins can manage access codes"
  ON access_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_codes_code ON access_codes(code);
CREATE INDEX IF NOT EXISTS idx_access_codes_expires_at ON access_codes(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_access_codes_is_active ON access_codes(is_active) WHERE is_active = true;