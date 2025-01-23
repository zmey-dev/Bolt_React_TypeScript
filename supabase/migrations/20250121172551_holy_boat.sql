/*
  # Add status column to access_codes table

  1. Changes
    - Add status column to access_codes table
    - Add status enum type
    - Add default value for status
    - Add index for status column
*/

-- Create status enum type
CREATE TYPE access_code_status AS ENUM ('active', 'inactive', 'expired');

-- Add status column to access_codes table
ALTER TABLE access_codes
ADD COLUMN IF NOT EXISTS status access_code_status NOT NULL DEFAULT 'active';

-- Add index for status column
CREATE INDEX IF NOT EXISTS idx_access_codes_status 
ON access_codes(status);

-- Update existing records
UPDATE access_codes
SET status = CASE 
  WHEN is_active = false THEN 'inactive'::access_code_status
  WHEN expires_at IS NOT NULL AND expires_at < now() THEN 'expired'::access_code_status
  ELSE 'active'::access_code_status
END;