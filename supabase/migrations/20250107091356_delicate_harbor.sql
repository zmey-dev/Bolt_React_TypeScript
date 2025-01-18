-- Drop existing policies
DROP POLICY IF EXISTS "Public can view own notifications" ON notifications;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert notifications (needed for the trigger)
CREATE POLICY "Anyone can insert notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (payload->>'email' = auth.email());

-- Allow admins to view all notifications
CREATE POLICY "Admins can view all notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );