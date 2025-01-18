-- Enable the HTTP extension
CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";

-- Update the notify_quote_request function to use extensions.http_post
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get webhook URL from settings
  SELECT value INTO webhook_url
  FROM app_settings
  WHERE key = 'zapier_webhook_url';

  -- Send webhook request using extensions.http_post
  PERFORM
    extensions.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'recipient_email', 'dudesonwill@gmail.com',
        'subject', 'New Quote Request',
        'body', format(
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
        )
      )::jsonb
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the notify_access_code_email function to use extensions.http_post
CREATE OR REPLACE FUNCTION notify_access_code_email()
RETURNS TRIGGER AS $$
DECLARE
  webhook_url text;
BEGIN
  -- Get webhook URL from settings
  SELECT value INTO webhook_url
  FROM app_settings
  WHERE key = 'zapier_webhook_url';

  -- Send webhook request using extensions.http_post
  PERFORM
    extensions.http_post(
      url := webhook_url,
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object(
        'recipient_email', NEW.recipient_email,
        'subject', NEW.subject,
        'body', NEW.body,
        'access_code_id', NEW.access_code_id
      )::jsonb
    );

  -- Update email status
  UPDATE sent_emails
  SET status = 'sent',
     sent_at = now()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;