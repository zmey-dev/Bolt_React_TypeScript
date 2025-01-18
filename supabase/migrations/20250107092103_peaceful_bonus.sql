-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS create_quote_notification ON quote_requests;
DROP FUNCTION IF EXISTS create_quote_notification();

-- Create a simple notification function that sends data directly to Zapier
CREATE OR REPLACE FUNCTION create_quote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into webhook_queue with minimal data
  INSERT INTO webhook_queue (
    webhook_url,
    payload,
    status
  ) VALUES (
    'https://hooks.zapier.com/hooks/catch/21230099/2z670it/',
    row_to_json(NEW),  -- Send the entire quote request as JSON
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();