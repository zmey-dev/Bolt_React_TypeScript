-- Drop existing trigger and function
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error text,
  retry_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow public to view their own notifications
CREATE POLICY "Public can view own notifications" ON notifications
  FOR SELECT TO public
  USING (payload->>'email' = auth.email());

-- Create notification function
CREATE OR REPLACE FUNCTION create_quote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification
  INSERT INTO notifications (type, payload)
  VALUES (
    'quote_request',
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
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();