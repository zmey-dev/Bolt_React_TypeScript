-- Drop trigger first
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;

-- Now we can safely drop the function
DROP FUNCTION IF EXISTS notify_quote_request();

-- Remove old webhook related tables
DROP TABLE IF EXISTS webhook_queue;
DROP TABLE IF EXISTS app_settings;

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error text
);

-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can insert notifications"
  ON email_notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create function to queue quote request notifications
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue email notification
  INSERT INTO email_notifications (
    recipient_email,
    subject,
    content
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
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create new trigger
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();