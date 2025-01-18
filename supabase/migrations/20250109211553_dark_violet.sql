-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create notification function with debug logging
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
DECLARE
  response_status integer;
  response_body text;
BEGIN
  -- Log the start of the function
  RAISE NOTICE 'notify_quote_request started for quote ID: %', NEW.id;

  -- Log the request details
  RAISE NOTICE 'Making HTTP request with payload: %', jsonb_build_object(
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
  );

  -- Call the Edge Function with proper authorization and capture response
  SELECT
    status,
    content::text
  INTO
    response_status,
    response_body
  FROM
    net.http_post(
      'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', format('Bearer %s', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwdnZnbXZ2ZGZzaXJ1dGhma2hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU5OTUwODcsImV4cCI6MjA1MTU3MTA4N30.bsdZxCYzphOuj4SQAaXehIg0oKj1tRwaJcck6YSOsKw'),
        'x-client-info', 'supabase-trigger'
      ),
      body := jsonb_build_object(
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

  -- Log the response
  RAISE NOTICE 'HTTP response status: %, body: %', response_status, response_body;

  -- Return the new record
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log detailed error information
  RAISE WARNING 'Failed to send notification for quote ID %: %, SQLSTATE: %', 
    NEW.id, 
    SQLERRM,
    SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();

-- Log that migration completed
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: Quote notification trigger updated with debug logging';
END $$;