-- Create access_code_uses table to track usage
CREATE TABLE IF NOT EXISTS access_code_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid REFERENCES access_codes(id) ON DELETE CASCADE,
  used_at timestamptz DEFAULT now(),
  ip_address text -- Store IP for security/auditing
);

-- Enable RLS
ALTER TABLE access_code_uses ENABLE ROW LEVEL SECURITY;

-- Allow public to insert usage records
CREATE POLICY "Anyone can record code usage"
  ON access_code_uses
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can view usage records
CREATE POLICY "Admins can view code usage"
  ON access_code_uses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_access_code_uses_code_id 
ON access_code_uses(code_id);

CREATE INDEX IF NOT EXISTS idx_access_code_uses_used_at 
ON access_code_uses(used_at DESC);

-- Update access_codes table to track last use
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;

-- Create function to update access code usage
CREATE OR REPLACE FUNCTION update_access_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the access code's use count and last used timestamp
  UPDATE access_codes
  SET 
    use_count = COALESCE(use_count, 0) + 1,
    last_used_at = NEW.used_at
  WHERE id = NEW.code_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to track usage
CREATE TRIGGER track_access_code_usage
  AFTER INSERT ON access_code_uses
  FOR EACH ROW
  EXECUTE FUNCTION update_access_code_usage();