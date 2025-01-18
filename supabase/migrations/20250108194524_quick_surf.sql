-- Drop old webhook-related triggers and functions
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create new function to handle email notifications
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function directly using net.http_post
  PERFORM
    net.http_post(
      url := CONCAT(current_setting('app.settings.edge_function_base_url'), '/send-quote-notification'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.edge_function_key'))
      ),
      body := jsonb_build_object('record', row_to_json(NEW))
    );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent quote request from being created
  RAISE WARNING 'Failed to send notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();