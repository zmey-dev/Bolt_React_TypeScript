-- Enable HTTP extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Simplify the webhook notification to avoid HTTP extension complexities
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Instead of making HTTP calls directly, insert into a queue table
  INSERT INTO sent_emails (
    recipient_email,
    subject,
    body,
    status
  ) VALUES (
    'dudesonwill@gmail.com',
    'New Quote Request',
    format(
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