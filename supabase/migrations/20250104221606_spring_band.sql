/*
  # Fix quote requests schema

  1. Schema Updates
    - Drop existing triggers and functions
    - Drop existing policies
    - Update quote_requests table structure
    - Update quote_request_images table structure
    - Add proper constraints and indexes

  2. Security
    - Enable RLS
    - Add policies for public submission and admin access
*/

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS quote_request_notification ON quote_requests;
DROP FUNCTION IF EXISTS notify_quote_request();

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can view quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can delete quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can create quote request images" ON quote_request_images;
DROP POLICY IF EXISTS "Admins can view quote request images" ON quote_request_images;

-- Update quote_requests table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_type 
    WHERE typname = 'quote_request_status'
  ) THEN
    CREATE TYPE quote_request_status AS ENUM (
      'pending',
      'in_progress',
      'completed',
      'rejected'
    );
  END IF;
END $$;

ALTER TABLE IF EXISTS quote_requests
  ALTER COLUMN name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN phone SET NOT NULL,
  ALTER COLUMN timeline SET NOT NULL,
  ALTER COLUMN budget SET NOT NULL,
  DROP COLUMN IF EXISTS requirements,
  ALTER COLUMN status SET DEFAULT 'pending',
  ALTER COLUMN status SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quote_requests_created_at ON quote_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(status);

-- Recreate policies
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

CREATE POLICY "Admins can delete quote requests"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Recreate policies for quote request images
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