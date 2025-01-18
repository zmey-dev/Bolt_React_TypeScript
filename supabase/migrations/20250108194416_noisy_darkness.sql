-- Drop any remaining references to webhook_queue
DROP TABLE IF EXISTS webhook_queue;

-- Drop existing policies first
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON email_notifications;

-- Ensure quote_requests table exists
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  timeline text NOT NULL,
  budget text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ensure quote_request_images table exists
CREATE TABLE IF NOT EXISTS quote_request_images (
  quote_request_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE,
  image_id uuid REFERENCES gallery_images(id),
  notes text,
  url text,
  PRIMARY KEY (quote_request_id, image_id)
);

-- Ensure email_notifications table exists
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  sent_at timestamptz,
  error text
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Recreate policies
CREATE POLICY "Anyone can create quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can create quote request images"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can insert notifications"
  ON email_notifications
  FOR INSERT
  TO public
  WITH CHECK (true);