-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create notification function that uses Edge Function
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  edge_function_url text;
  anon_key text;
BEGIN
  -- Get the Edge Function URL and anon key from settings
  edge_function_url := 'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification';
  anon_key := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdnZnbXZ2ZGZzaXJ1dGhma2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTUwODcsImV4cCI6MjA1MTU3MTA4N30.bsdZxCYzphOuj4SQAaXehIg0oKj1tRwaJcck6YSOsKw';

  -- Call the Edge Function with proper authorization
  PERFORM
    net.http_post(
      edge_function_url,
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', anon_key),
        'x-client-info', 'lightshow-vault'
      ),
      jsonb_build_object(
        'record', jsonb_build_object(
          'id', NEW.id,
          'name', NEW.name,
          'email', NEW.email,
          'phone', NEW.phone,
          'timeline', NEW.timeline,
          'budget', NEW.budget,
          'notes', NEW.notes,
          'created_at', NEW.created_at,
          'status', NEW.status
        )
      )
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