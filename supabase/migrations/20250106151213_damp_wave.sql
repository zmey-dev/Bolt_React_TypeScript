-- Remove created_by_email column
ALTER TABLE access_codes
DROP COLUMN IF EXISTS created_by_email;

-- Create function for expired codes index
CREATE OR REPLACE FUNCTION is_expired(expires_at timestamptz)
RETURNS boolean
IMMUTABLE
LANGUAGE sql AS $$
  SELECT CASE 
    WHEN expires_at IS NULL THEN false
    ELSE expires_at < '2024-01-06 00:00:00'::timestamptz
  END;
$$;

-- Add index for expired codes using immutable function
CREATE INDEX IF NOT EXISTS idx_access_codes_expired 
ON access_codes(expires_at) 
WHERE is_expired(expires_at);

-- Create function to handle expired codes
CREATE OR REPLACE FUNCTION handle_expired_codes()
RETURNS TRIGGER AS $$
BEGIN
  -- If code is expired, set it to inactive
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at < now() THEN
    NEW.is_active = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically handle expired codes
DROP TRIGGER IF EXISTS check_expired_codes ON access_codes;
CREATE TRIGGER check_expired_codes
  BEFORE INSERT OR UPDATE ON access_codes
  FOR EACH ROW
  EXECUTE FUNCTION handle_expired_codes();