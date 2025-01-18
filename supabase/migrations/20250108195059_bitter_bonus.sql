-- Drop any remaining references to webhook_queue
DROP TABLE IF EXISTS webhook_queue CASCADE;
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;

-- Ensure quote_requests table exists with correct schema
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
  image_id uuid,
  notes text,
  url text,
  PRIMARY KEY (quote_request_id, image_id)
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;

-- Create policies (after dropping them)
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

-- Create simple notification function
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into email_notifications table instead of direct HTTP call
  INSERT INTO email_notifications (
    recipient_email,
    subject,
    content
  ) VALUES (
    'dudesonwill@gmail.com',
    'New Quote Request from ' || NEW.name,
    format(
      'Quote Request Details:%s%s' ||
      'Name: %s%s' ||
      'Email: %s%s' ||
      'Phone: %s%s' ||
      'Timeline: %s%s' ||
      'Budget: %s%s' ||
      'Notes: %s',
      E'\n', E'\n',
      NEW.name, E'\n',
      NEW.email, E'\n',
      COALESCE(NEW.phone, 'Not provided'), E'\n',
      NEW.timeline, E'\n',
      NEW.budget, E'\n',
      COALESCE(NEW.notes, 'None')
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notifications
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();