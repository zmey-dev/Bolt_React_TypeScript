-- Drop existing trigger
DROP TRIGGER IF EXISTS create_quote_notification ON quote_requests;
DROP FUNCTION IF EXISTS create_quote_notification();

-- Create improved notification function
CREATE OR REPLACE FUNCTION create_quote_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Queue webhook directly to Zapier
  INSERT INTO webhook_queue (
    webhook_url,
    payload,
    status,
    next_retry_at
  ) VALUES (
    'https://hooks.zapier.com/hooks/catch/21230099/2z670it/',
    jsonb_build_object(
      'quote_id', NEW.id,
      'name', NEW.name,
      'email', NEW.email,
      'phone', NEW.phone,
      'timeline', NEW.timeline,
      'budget', NEW.budget,
      'notes', NEW.notes,
      'created_at', NEW.created_at,
      'type', 'quote_request'
    ),
    'pending',
    now()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger
CREATE TRIGGER create_quote_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_quote_notification();

-- Add index for webhook processing
CREATE INDEX IF NOT EXISTS idx_webhook_queue_pending
ON webhook_queue(next_retry_at)
WHERE status = 'pending';