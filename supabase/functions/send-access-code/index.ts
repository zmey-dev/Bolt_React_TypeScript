import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    const { accessCodeId, recipientEmail, customMessage } = await req.json()

    // Get access code details
    const { data: accessCode, error: accessCodeError } = await supabase
      .from('access_codes')
      .select('*')
      .eq('id', accessCodeId)
      .single()

    if (accessCodeError || !accessCode) {
      throw new Error('Access code not found')
    }

    // Prepare email content
    const body = customMessage || `Hello,

Here's your access code for LightShowVault: ${accessCode.code}

${accessCode.description || ''}

${accessCode.expires_at 
  ? `This code expires on ${new Date(accessCode.expires_at).toLocaleDateString()}`
  : 'This code never expires'}

Visit https://lightshowvault.com to use your code.

Best regards,
LightShowVault Team`

    // Send email using Resend
    const { data: emailResponse, error: sendError } = await resend.emails.send({
      from: 'LightShowVault <noreply@lightshowvault.com>',
      to: recipientEmail,
      subject: 'Your LightShowVault Access Code',
      text: body
    })

    if (sendError) throw sendError

    // Update email status
    await supabase
      .from('sent_emails')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        body
      })
      .eq('access_code_id', accessCodeId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})