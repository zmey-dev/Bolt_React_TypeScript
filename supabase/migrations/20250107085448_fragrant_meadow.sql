-- Create function to send access code email notification
CREATE OR REPLACE FUNCTION notify_access_code_email()
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
        'recipient_email', NEW.recipient_email,
        'subject', NEW.subject,
        'body', NEW.body,
        'access_code_id', NEW.access_code_id
      )
    );

  -- Update email status
  UPDATE sent_emails
  SET status = 'sent',
     sent_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for access code emails
DROP TRIGGER IF EXISTS access_code_email_notification ON sent_emails;
CREATE TRIGGER access_code_email_notification
  AFTER INSERT ON sent_emails
  FOR EACH ROW
  EXECUTE FUNCTION notify_access_code_email();