-- Add email column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Update profiles with emails from auth.users
UPDATE profiles
SET email = users.email
FROM auth.users
WHERE profiles.id = users.id
AND profiles.email IS NULL;

-- Add trigger to keep email in sync
CREATE OR REPLACE FUNCTION sync_profile_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_user_email ON auth.users;
CREATE TRIGGER sync_user_email
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_email();

-- Add created_by_email to access_codes if it doesn't exist
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS created_by_email text;

-- Update existing access codes with creator emails
UPDATE access_codes
SET created_by_email = profiles.email
FROM profiles
WHERE access_codes.created_by = profiles.id
AND access_codes.created_by_email IS NULL;