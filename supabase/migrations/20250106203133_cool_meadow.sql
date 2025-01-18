-- Drop and recreate the sent_emails policies
DROP POLICY IF EXISTS "Anyone can insert sent emails" ON sent_emails;
DROP POLICY IF EXISTS "Admins can manage sent emails" ON sent_emails;

-- Create more permissive policies
CREATE POLICY "Public can insert sent emails"
  ON sent_emails
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Public can view own sent emails"
  ON sent_emails
  FOR SELECT
  TO public
  USING (true);

-- Update the from email to use a verified Resend domain
UPDATE email_templates
SET body = E'Hello,\n\nHere''s your access code for LightShowVault: {{code}}\n\n{{description}}\n\n{{expiry}}\n\nVisit https://lightshowvault.com to use your code.\n\nBest regards,\nLightShowVault Team'
WHERE name = 'access_code';