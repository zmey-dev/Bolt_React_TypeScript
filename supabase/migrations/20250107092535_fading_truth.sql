-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_quote_notification ON quote_requests;
DROP FUNCTION IF EXISTS create_quote_notification();

-- Create simplified notification function
CREATE OR REPLACE FUNCTION create_quote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into webhook_queue with flat JSON structure
  INSERT INTO webhook_queue (
    webhook_url,
    payload,
    status
  ) VALUES (
    'https://hooks.zapier.com/hooks/catch/21230099/2z670it/',
    jsonb_build_object(
      'id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'phone', COALESCE(NEW.phone, ''),
      'timeline', NEW.timeline,
      'budget', NEW.budget,
      'notes', COALESCE(NEW.notes, ''),
      'status', NEW.status,
      'created_at', NEW.created_at
    ),
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();