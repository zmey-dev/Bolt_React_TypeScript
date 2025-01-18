-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create a simplified notification function that just stores the request
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Store the quote request notification
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
      'Notes: %s',
      E'\n', E'\n',
      NEW.name, E'\n',
      NEW.email, E'\n',
      COALESCE(NEW.phone, 'Not provided'), E'\n',
      NEW.timeline, E'\n',
      NEW.budget, E'\n',
      COALESCE(NEW.notes, 'None')
    ),
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