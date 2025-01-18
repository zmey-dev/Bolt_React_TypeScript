-- Drop existing trigger and function
DROP TRIGGER IF EXISTS create_quote_notification ON quote_requests;
DROP FUNCTION IF EXISTS create_quote_notification();

-- Create simplified notification function that sends directly to Zapier
CREATE OR REPLACE FUNCTION create_quote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert directly into webhook_queue
  INSERT INTO webhook_queue (
    webhook_url,
    payload
  ) VALUES (
    'https://hooks.zapier.com/hooks/catch/21230099/2z670it/',
    jsonb_build_object(
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
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();

-- Drop all existing policies on webhook_queue
DROP POLICY IF EXISTS "Allow all inserts to webhook_queue" ON webhook_queue;
DROP POLICY IF EXISTS "Admins can manage webhooks" ON webhook_queue;

-- Create simple policy that allows all operations
CREATE POLICY "Allow all webhook operations"
  ON webhook_queue
  FOR ALL 
  TO public
  USING (true)
  WITH CHECK (true);