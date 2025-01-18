-- Add phone column to quote_requests table
ALTER TABLE quote_requests
ADD COLUMN IF NOT EXISTS phone text;

-- Drop requirements column
ALTER TABLE quote_requests
DROP COLUMN IF EXISTS requirements;