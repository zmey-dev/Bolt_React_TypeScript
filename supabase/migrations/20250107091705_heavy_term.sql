-- Drop existing policy first
DROP POLICY IF EXISTS "Anyone can insert webhooks" ON webhook_queue;

-- Create function to process webhook queue
CREATE OR REPLACE FUNCTION process_webhook_queue() 
RETURNS void AS $$
DECLARE 
  item RECORD;
BEGIN
  -- Process each pending webhook
  FOR item IN 
    SELECT * FROM webhook_queue 
    WHERE status = 'pending' 
    AND retry_count < 3
    AND next_retry_at <= now()
    ORDER BY created_at ASC
    LIMIT 10
    FOR UPDATE SKIP LOCKED
  LOOP
    BEGIN
      -- Update status to processing
      UPDATE webhook_queue 
      SET status = 'processing'
      WHERE id = item.id;

      -- Notify about webhook
      PERFORM pg_notify(
        'webhook_queue',
        jsonb_build_object(
          'id', item.id,
          'url', item.webhook_url,
          'payload', item.payload
        )::text
      );

      -- Mark as sent
      UPDATE webhook_queue 
      SET 
        status = 'sent',
        processed_at = now()
      WHERE id = item.id;

    EXCEPTION WHEN OTHERS THEN
      -- Handle failure
      UPDATE webhook_queue 
      SET 
        status = 'failed',
        error = SQLERRM,
        retry_count = retry_count + 1,
        next_retry_at = now() + (retry_count + 1) * interval '5 minutes'
      WHERE id = item.id;
    END;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION process_webhook_queue TO authenticated;