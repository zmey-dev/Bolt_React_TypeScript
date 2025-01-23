-- Create access_code_requests table
CREATE TABLE access_code_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  project_type text NOT NULL,
  estimated_budget text NOT NULL,
  timeline text NOT NULL,
  additional_info text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  notes text
);

-- Enable RLS
ALTER TABLE access_code_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can create access code requests"
  ON access_code_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view access code requests"
  ON access_code_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update access code requests"
  ON access_code_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_access_code_requests_status 
ON access_code_requests(status);

CREATE INDEX idx_access_code_requests_created_at 
ON access_code_requests(created_at DESC);