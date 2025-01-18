import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@1.0.0'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async () => {
  try {
    // Get pending notifications
    const { data: notifications, error } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .limit(10)

    if (error) throw error

    // Process each notification
    for (const notification of notifications || []) {
      try {
        await resend.emails.send({
          from: 'LightShowVault <noreply@lightshowvault.com>',
          to: notification.recipient_email,
          subject: notification.subject,
          text: notification.content
        })

        // Update notification status
        await supabase
          .from('email_notifications')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', notification.id)
      } catch (err) {
        // Log error and update notification
        await supabase
          .from('email_notifications')
          .update({ 
            status: 'failed',
            error: err.message
          })
          .eq('id', notification.id)
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})