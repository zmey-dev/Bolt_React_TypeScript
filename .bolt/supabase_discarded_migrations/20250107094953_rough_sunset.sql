-- Create settings for Resend
CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings"
  ON app_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Store the Resend API key
INSERT INTO app_settings (key, value, description) VALUES
('resend_api_key', '', 'Resend API key for sending emails'),
('admin_email', 'dudesonwill@gmail.com', 'Admin email for notifications')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create function to send email via Resend
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Store the notification in sent_emails table
  INSERT INTO sent_emails (
    recipient_email,
    subject,
    body,
    status
  ) VALUES (
    'dudesonwill@gmail.com',
    'New Quote Request from ' || NEW.name,
    format(
      'Quote Request Details:%s%s' ||
      'Name: %s%s' ||
      'Email: %s%s' ||
      'Phone: %s%s' ||
      'Timeline: %s%s' ||
      'Budget: %s%s' ||
      'Notes: %s%s%s' ||
      'View request: https://lightshowvault.com/admin/quotes',
      E'\n', E'\n',
      NEW.name, E'\n',
      NEW.email, E'\n',
      COALESCE(NEW.phone, 'Not provided'), E'\n',
      NEW.timeline, E'\n',
      NEW.budget, E'\n',
      COALESCE(NEW.notes, 'None'), E'\n', E'\n'
    ),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;