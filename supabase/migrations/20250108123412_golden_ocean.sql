-- Add Make.com webhook URL to app settings
INSERT INTO app_settings (key, value, description)
VALUES (
  'make_webhook_url',
  'YOUR_MAKE_WEBHOOK_URL',
  'Webhook URL for Make.com integration to handle quote request notifications'
) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Update the notification function to use Make.com webhook
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get webhook URL from settings
  SELECT value INTO webhook_url
  FROM app_settings
  WHERE key = 'make_webhook_url';

  -- Send webhook request to Make.com
  PERFORM
    extensions.http_request(
      'POST',
      webhook_url,
      ARRAY[extensions.http_header('Content-Type', 'application/json')],
      jsonb_build_object(
        'quote_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'timeline', NEW.timeline,
        'budget', NEW.budget,
        'notes', NEW.notes,
        'created_at', NEW.created_at,
        'status', NEW.status
      )::text
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;