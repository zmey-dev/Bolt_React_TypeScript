-- Store Zapier webhook URL in a secure settings table
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

-- Store the Zapier webhook URL
INSERT INTO app_settings (key, value, description) VALUES
('zapier_webhook_url', 'https://hooks.zapier.com/hooks/catch/21230099/2z6nagt/', 'Webhook URL for quote request notifications')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create function to send webhook notification
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get webhook URL from settings
  SELECT value INTO webhook_url
  FROM app_settings
  WHERE key = 'zapier_webhook_url';

  -- Send webhook request
  PERFORM
    net.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'recipient_email', 'admin@lightshowvault.com',
        'subject', 'New Quote Request',
        'body', format(
          'New quote request from %s (%s)%s%sTimeline: %s%sBudget: %s%s%s',
          NEW.name,
          NEW.email,
          CASE WHEN NEW.phone IS NOT NULL THEN E'\nPhone: ' || NEW.phone ELSE '' END,
          E'\n\n',
          NEW.timeline,
          E'\n',
          NEW.budget,
          CASE WHEN NEW.notes IS NOT NULL THEN E'\n\nNotes: ' || NEW.notes ELSE '' END,
          E'\n\nView in admin dashboard: https://lightshowvault.com/admin/quotes'
        )
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();