-- Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Create a simpler notification function using net.http_post
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Send webhook request to Make.com
  PERFORM net.http_post(
    url := 'https://hook.us2.make.com/qe2wfg7txjldwfg522tf4ufu78y20ea2',
    headers := '{"Content-Type": "application/json"}',
    body := json_build_object(
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

-- Recreate trigger
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();