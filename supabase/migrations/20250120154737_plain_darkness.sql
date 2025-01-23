-- Create email_notifications table if it doesn't exist
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

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Anyone can insert notifications" ON email_notifications;
DROP POLICY IF EXISTS "Public can insert notifications" ON email_notifications;
DROP POLICY IF EXISTS "Public can view own notifications" ON email_notifications;

-- Create policies with new unique names
CREATE POLICY "email_notifications_insert_20250120"
  ON email_notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "email_notifications_select_20250120"
  ON email_notifications
  FOR SELECT
  TO public
  USING (true);

-- Create function to handle email notifications
CREATE OR REPLACE FUNCTION process_email_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function
  PERFORM
    net.http_post(
      'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification',
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('supabase.anon_key')
      ),
      jsonb_build_object(
        'recipient_email', NEW.recipient_email,
        'subject', NEW.subject,
        'content', NEW.content
      )
    );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent notification from being created
  RAISE WARNING 'Failed to send notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS process_email_notification ON email_notifications;

-- Create trigger for notifications
CREATE TRIGGER process_email_notification
  AFTER INSERT ON email_notifications
  FOR EACH ROW
  EXECUTE FUNCTION process_email_notification();