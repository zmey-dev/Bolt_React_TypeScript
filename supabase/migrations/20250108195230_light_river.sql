-- Drop any remaining references to webhook_queue
DROP TABLE IF EXISTS webhook_queue CASCADE;
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;

-- Recreate quote_requests table
DROP TABLE IF EXISTS quote_requests CASCADE;
CREATE TABLE quote_requests (
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

-- Recreate quote_request_images table
DROP TABLE IF EXISTS quote_request_images CASCADE;
CREATE TABLE quote_request_images (
  quote_request_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE,
  image_id uuid REFERENCES gallery_images(id),
  notes text,
  url text,
  PRIMARY KEY (quote_request_id, image_id)
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_request_images ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create notification function using Edge Function
CREATE OR REPLACE FUNCTION notify_quote_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the Edge Function
  PERFORM
    net.http_post(
      'https://jpvvgmvvdfsiruthfkhb.supabase.co/functions/v1/send-quote-notification',
      jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', current_setting('supabase.auth.token', true)::text
      ),
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
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent quote request from being created
  RAISE WARNING 'Failed to send notification: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for notifications
CREATE TRIGGER quote_request_notification
  AFTER INSERT ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_quote_request();