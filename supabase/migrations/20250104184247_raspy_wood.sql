/*
  # Quote Requests System

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `timeline` (text)
      - `budget` (text)
      - `requirements` (text)
      - `notes` (text)
      - `status` (text) - 'pending', 'in_progress', 'completed', 'rejected'
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quote_request_images`
      - `quote_request_id` (uuid, foreign key)
      - `image_id` (uuid, foreign key)

  2. Security
    - Enable RLS on both tables
    - Public can create quote requests
    - Only admins can view and manage quote requests
*/

-- Create enum for quote request status
CREATE TYPE quote_request_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'rejected'
);

-- Create quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  timeline text NOT NULL,
  budget text NOT NULL,
  requirements text,
  notes text,
  status quote_request_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quote request images junction table
CREATE TABLE IF NOT EXISTS quote_request_images (
  quote_request_id uuid REFERENCES quote_requests(id) ON DELETE CASCADE,
  image_id uuid REFERENCES gallery_images(id) ON DELETE CASCADE,
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

CREATE POLICY "Admins can view quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update quote requests"
  ON quote_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies for quote request images
CREATE POLICY "Anyone can create quote request images"
  ON quote_request_images
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view quote request images"
  ON quote_request_images
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();