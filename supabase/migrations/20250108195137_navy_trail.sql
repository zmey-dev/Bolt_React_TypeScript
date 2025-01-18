-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create notification function with correct Edge Function URL
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function with the correct URL
  PERFORM
    net.http_post(
      'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification',
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('supabase.auth.token')::text
      ),
      jsonb_build_object(
        'quote_id', NEW.id,
        'name', NEW.name,
        'email', NEW.email,
        'phone', NEW.phone,
        'timeline', NEW.timeline,
        'budget', NEW.budget,
        'notes', NEW.notes,
        'created_at', NEW.created_at
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