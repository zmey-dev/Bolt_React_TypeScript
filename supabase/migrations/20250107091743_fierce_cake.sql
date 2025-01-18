-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can insert webhooks" ON webhook_queue;

-- Enable RLS
ALTER TABLE webhook_queue ENABLE ROW LEVEL SECURITY;

-- Allow inserts from any authenticated or public user
CREATE POLICY "Allow all inserts to webhook_queue"
  ON webhook_queue
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to view and manage webhooks
CREATE POLICY "Admins can manage webhooks"
  ON webhook_queue
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add next_retry_at column if it doesn't exist
ALTER TABLE webhook_queue 
ADD COLUMN IF NOT EXISTS next_retry_at timestamptz DEFAULT now();