-- Create webhook_queue table for reliable webhook delivery
CREATE TABLE IF NOT EXISTS webhook_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_url text NOT NULL,
  payload jsonb NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz,
  error text,
  retry_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

-- Allow public insert for triggers
CREATE POLICY "Anyone can insert webhooks"
  ON webhook_queue
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Update notification trigger to queue webhook
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

  -- Queue webhook
  INSERT INTO webhook_queue (webhook_url, payload)
  VALUES (
    'https://hooks.zapier.com/hooks/catch/21230099/2z670it/',
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

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS create_quote_notification ON quote_requests;
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();