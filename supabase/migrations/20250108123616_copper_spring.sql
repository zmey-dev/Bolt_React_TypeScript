-- Enable HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Update the notification function to use the correct HTTP function
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get webhook URL from settings
  SELECT value INTO webhook_url
  FROM app_settings
  WHERE key = 'make_webhook_url';

  -- Send webhook request to Make.com using http_post
  PERFORM
    extensions.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'quote_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'timeline', NEW.timeline,
        'budget', NEW.budget,
        'notes', NEW.notes,
        'created_at', NEW.created_at,
        'status', NEW.status
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