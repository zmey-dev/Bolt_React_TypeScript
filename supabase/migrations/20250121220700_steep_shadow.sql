-- Update the admin user's role to super_admin
UPDATE profiles 
SET role = 'super_admin'
WHERE email = 'dudesonwill@gmail.com';

-- Create a function to protect the super admin role
CREATE OR REPLACE FUNCTION protect_super_admin()
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
  EXECUTE FUNCTION protect_super_admin();

-- Ensure the super admin has all necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;