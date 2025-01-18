-- Add webhook_url column to sent_emails
ALTER TABLE sent_emails
ADD COLUMN IF NOT EXISTS webhook_url text;

-- Add index for webhook processing
CREATE INDEX IF NOT EXISTS idx_sent_emails_status 
ON sent_emails(status) 
WHERE status = 'pending';