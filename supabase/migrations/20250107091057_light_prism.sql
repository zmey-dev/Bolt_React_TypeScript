-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create a simplified notification function
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
    'New Quote Request',
    jsonb_build_object(
      'quote_id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'phone', NEW.phone,
      'timeline', NEW.timeline,
      'budget', NEW.budget,
      'notes', NEW.notes,
      'created_at', NEW.created_at
    )::text,
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();