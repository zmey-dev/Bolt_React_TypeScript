-- Update the admin user's role to super_admin
UPDATE profiles 
SET role = 'super_admin'
WHERE email = 'dudesonwill@gmail.com';

-- Create a function to ensure the super admin always exists
CREATE OR REPLACE FUNCTION ensure_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- If we're trying to demote the super admin, prevent it
  IF OLD.email = 'dudesonwill@gmail.com' AND NEW.role != 'super_admin' THEN
    RAISE EXCEPTION 'Cannot change role of super admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to protect super admin role
DROP TRIGGER IF EXISTS protect_super_admin ON profiles;
CREATE TRIGGER protect_super_admin
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION ensure_super_admin();