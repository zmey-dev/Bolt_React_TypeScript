-- Update the notify_quote_request function to use admin email
CREATE OR REPLACE FUNCTION notify_quote_request()
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
      )
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;