-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create notification function with JWT auth
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  jwt_token text;
BEGIN
  -- Get JWT token from auth.jwt() function
  SELECT auth.jwt() INTO jwt_token;

  -- Call the Edge Function with JWT auth
  PERFORM
    net.http_post(
      url := 'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', jwt_token)
      ),
      body := jsonb_build_object(
        'record', row_to_json(NEW)
      )::text
    );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent quote request from being created
  RAISE WARNING 'Failed to send notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();