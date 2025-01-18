# Edge Functions Deployment Guide

This guide covers the deployment and configuration of Supabase Edge Functions for the LightShowVault project.

## Environment Variables

### Required Variables

The following environment variables must be set in your Supabase project:

```bash
# Required for email notifications
RESEND_API_KEY=your_resend_api_key

# Required for authentication
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### How to Set Environment Variables

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Click on "Edge Functions"
4. Add each environment variable under "Config Vars"

## Function Configuration

### send-quote-notification

This function handles sending email notifications when new quote requests are submitted.

#### Configuration Steps

1. Deploy the function:
```bash
supabase functions deploy send-quote-notification
```

2. Enable HTTP requests:
   - Go to your Supabase dashboard
   - Navigate to Edge Functions
   - Find "send-quote-notification"
   - Enable "Invoke function via HTTP"

3. CORS Configuration:
   - The function includes built-in CORS headers
   - Allows requests from any origin (`*`)
   - Supports `POST` and `OPTIONS` methods
   - Allows required headers: `authorization`, `x-client-info`, `apikey`, `content-type`

## Testing Instructions

### Prerequisites
- Resend API key
- Supabase project URL and anon key
- cURL or similar HTTP client

### Test the Function

1. Test with cURL:
```bash
curl -X POST 'https://[PROJECT_REF].supabase.co/functions/v1/send-quote-notification' \
-H "Authorization: Bearer [ANON_KEY]" \
-H "Content-Type: application/json" \
--data '{
  "record": {
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "timeline": "1-2 months",
    "budget": "5k-10k",
    "notes": "Test request"
  }
}'
```

2. Expected Success Response:
```json
{
  "success": true
}
```

3. Common Error Responses:

Missing/Invalid Authorization:
```json
{
  "success": false,
  "error": "Missing or invalid authorization header"
}
```

Unauthorized:
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

Email Send Error:
```json
{
  "success": false,
  "error": "Failed to send email"
}
```

### Verify Email Delivery

1. Check your admin email (dudesonwill@gmail.com) for the notification
2. Verify the email contains:
   - Quote request details
   - Customer contact information
   - Timeline and budget information
   - Any provided notes
   - Link to admin dashboard

## Troubleshooting

1. Check Supabase Logs:
   - Go to your project dashboard
   - Navigate to Edge Functions
   - Select the function
   - Click on "Logs"

2. Common Issues:
   - Missing environment variables
   - Invalid Resend API key
   - Network connectivity issues
   - CORS configuration problems

3. Debug Steps:
   - Verify environment variables are set correctly
   - Check function logs for detailed error messages
   - Ensure the authorization token is valid
   - Test with minimal request payload first
   - Verify Resend API status at status.resend.com