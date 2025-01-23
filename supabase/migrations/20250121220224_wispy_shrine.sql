-- Create role enum type
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'affiliate');

-- Drop existing storage policies
DROP POLICY IF EXISTS "Admin users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admin users can delete images" ON storage.objects;

-- Drop existing policies that depend on the role column
DROP POLICY IF EXISTS "Admins can insert gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admins can update gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admins can delete gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admins can insert tags" ON tags;
DROP POLICY IF EXISTS "Admins can update tags" ON tags;
DROP POLICY IF EXISTS "Admins can delete tags" ON tags;
DROP POLICY IF EXISTS "Admins can insert image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can delete image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage image_tags" ON image_tags;
DROP POLICY IF EXISTS "Admins can manage access codes" ON access_codes;
DROP POLICY IF EXISTS "Admins can view code usage" ON access_code_uses;
DROP POLICY IF EXISTS "Admins can view sent emails" ON sent_emails;
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage gallery images" ON gallery_images;
DROP POLICY IF EXISTS "Admins can view access code requests" ON access_code_requests;
DROP POLICY IF EXISTS "Admins can update access code requests" ON access_code_requests;

-- Add temporary column for the new role type
ALTER TABLE profiles 
ADD COLUMN role_new user_role;

-- Update the new column based on existing role values
UPDATE profiles 
SET role_new = CASE 
  WHEN role = 'admin' THEN 'super_admin'::user_role
  ELSE 'affiliate'::user_role
END;

-- Drop the old column and rename the new one
ALTER TABLE profiles DROP COLUMN role;
ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'affiliate'::user_role;
UPDATE profiles SET role = role_new;
ALTER TABLE profiles DROP COLUMN role_new;

-- Recreate storage policies with new role checks
CREATE POLICY "Admin users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admin users can update images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);

CREATE POLICY "Admin users can delete images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'images' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin')
  )
);

-- Create affiliate_invites table
CREATE TABLE affiliate_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'expired'))
);

-- Enable RLS
ALTER TABLE affiliate_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for affiliate_invites
CREATE POLICY "Super admins can manage affiliate invites"
  ON affiliate_invites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'::user_role
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_affiliate_invites_email ON affiliate_invites(email);
CREATE INDEX idx_affiliate_invites_token ON affiliate_invites(token);
CREATE INDEX idx_affiliate_invites_status ON affiliate_invites(status);

-- Update existing admin to super_admin
UPDATE profiles 
SET role = 'super_admin'::user_role 
WHERE email = 'dudesonwill@gmail.com';