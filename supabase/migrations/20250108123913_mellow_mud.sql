-- Enable HTTP extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Create a simpler notification function using webhook_queue
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into webhook_queue instead of direct HTTP call
  INSERT INTO webhook_queue (
    webhook_url,
    payload,
    status
  ) VALUES (
    'https://hook.us1.make.com/4to1rkyub3iebnd5rn3pqq2ngbncg14f',
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
    ),
    'pending'
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