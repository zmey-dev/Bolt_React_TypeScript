-- Update the Zapier webhook URL
UPDATE app_settings 
SET value = 'https://hooks.zapier.com/hooks/catch/21230099/2z670it/'
WHERE key = 'zapier_webhook_url';