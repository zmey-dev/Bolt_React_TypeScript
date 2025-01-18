-- Create settings for SendGrid
INSERT INTO app_settings (key, value, description) VALUES
('sendgrid_api_key', '', 'SendGrid API key for sending emails'),
('admin_email', 'dudesonwill@gmail.com', 'Admin email for notifications')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Create function to send email via SendGrid
CREATE OR REPLACE FUNCTION send_email(
  to_email text,
  subject text,
  content text
) RETURNS void AS $$
DECLARE
  api_key text;
BEGIN
  -- Get SendGrid API key from settings
  SELECT value INTO api_key FROM app_settings WHERE key = 'sendgrid_api_key';
  
  -- Send email using SendGrid API
  PERFORM net.http_post(
    'https://api.sendgrid.com/v3/mail/send',
    jsonb_build_object(
      'personalizations', jsonb_build_array(
        jsonb_build_object(
          'to', jsonb_build_array(jsonb_build_object('email', to_email))
        )
      ),
      'from', jsonb_build_object('email', 'noreply@lightshowvault.com'),
      'subject', subject,
      'content', jsonb_build_array(
        jsonb_build_object(
          'type', 'text/plain',
          'value', content
        )
      )
    )::text,
    ARRAY[
      net.http_header('Authorization', 'Bearer ' || api_key),
      net.http_header('Content-Type', 'application/json')
    ]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update quote notification function to use SendGrid
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  admin_email text;
BEGIN
  -- Get admin email from settings
  SELECT value INTO admin_email FROM app_settings WHERE key = 'admin_email';
  
  -- Send email notification
  PERFORM send_email(
    admin_email,
    'New Quote Request from ' || NEW.name,
    format(
      'Quote Request Details:%s%s' ||
      'Name: %s%s' ||
      'Email: %s%s' ||
      'Phone: %s%s' ||
      'Timeline: %s%s' ||
      'Budget: %s%s' ||
      'Notes: %s%s%s' ||
      'View request: https://lightshowvault.com/admin/quotes',
      E'\n', E'\n',
      NEW.name, E'\n',
      NEW.email, E'\n',
      COALESCE(NEW.phone, 'Not provided'), E'\n',
      NEW.timeline, E'\n',
      NEW.budget, E'\n',
      COALESCE(NEW.notes, 'None'), E'\n', E'\n'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;