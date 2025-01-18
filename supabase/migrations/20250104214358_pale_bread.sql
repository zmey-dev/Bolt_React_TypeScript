/*
  # Access Codes System

  1. New Tables
    - `access_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `description` (text)
      - `expires_at` (timestamptz, nullable)
      - `created_at` (timestamptz)
      - `created_by` (uuid, references profiles)
      - `is_active` (boolean)
      - `uses_remaining` (integer, nullable)
      - `last_used_at` (timestamptz, nullable)

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Create access_codes table
CREATE TABLE access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  is_active boolean DEFAULT true,
  uses_remaining integer,
  last_used_at timestamptz,
  
  -- Add constraint to ensure uses_remaining is positive
  CONSTRAINT positive_uses CHECK (uses_remaining IS NULL OR uses_remaining >= 0)
);

-- Enable RLS
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can validate access codes"
  ON access_codes
  FOR SELECT
  TO public
  USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > now())
    AND (uses_remaining IS NULL OR uses_remaining > 0)
  );

CREATE POLICY "Admins can manage access codes"
  ON access_codes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );