-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage email templates" ON email_templates;
DROP POLICY IF EXISTS "Admins can manage sent emails" ON sent_emails;
DROP POLICY IF EXISTS "Anyone can insert sent emails" ON sent_emails;

-- Create table for email templates if it doesn't exist
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Only admins can manage templates
CREATE POLICY "Admins can manage email templates"
  ON email_templates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create table for sent emails if it doesn't exist
CREATE TABLE IF NOT EXISTS sent_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code_id uuid REFERENCES access_codes(id) ON DELETE SET NULL,
  recipient_email text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  sent_by uuid REFERENCES auth.users(id),
  status text NOT NULL DEFAULT 'pending',
  error text
);

-- Enable RLS
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert and view sent emails
CREATE POLICY "Admins can manage sent emails"
  ON sent_emails
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Allow public to insert sent emails
CREATE POLICY "Anyone can insert sent emails"
  ON sent_emails
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add default email template if it doesn't exist
INSERT INTO email_templates (name, subject, body) VALUES (
  'access_code',
  'Your LightShowVault Access Code',
  E'Hello,\n\nHere''s your access code for LightShowVault: {{code}}\n\n{{description}}\n\n{{expiry}}\n\nVisit https://lightshowvault.com to use your code.\n\nBest regards,\nLightShowVault Team'
) ON CONFLICT (name) DO NOTHING;