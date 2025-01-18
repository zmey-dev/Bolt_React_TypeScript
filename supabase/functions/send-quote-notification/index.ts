import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import * as log from "https://deno.land/std@0.168.0/log/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from './resend.ts';

// Configure logger
await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG"),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console"],
    },
  },
});

const logger = log.getLogger();
const ADMIN_EMAIL = 'dudesonwill@gmail.com';

logger.info('Initializing Edge Function');
logger.info(`Admin email: ${ADMIN_EMAIL}`);

const resendKey = Deno.env.get('RESEND_API_KEY');
logger.info(`Resend API key present: ${!!resendKey}`);

const resend = new Resend(resendKey);

// Initialize Supabase client
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  logger.info(`${req.method} ${req.url}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const headers = Object.fromEntries(req.headers.entries());
    logger.debug('Request headers:', headers);

    // Get JWT token from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.error('Missing or invalid auth header:', authHeader);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing or invalid authorization header' 
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Verify JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      logger.error('JWT verification failed:', authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid JWT token' 
        }),
        { 
          status: 401, 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const body = await req.json();
    logger.debug('Request body:', body);

    const { record } = body;
    if (!record) {
      throw new Error('Missing record in request body');
    }

    const emailText = `
New Quote Request Details:

Name: ${record.name}
Email: ${record.email}
Phone: ${record.phone || 'Not provided'}
Timeline: ${record.timeline}
Budget: ${record.budget}
Notes: ${record.notes || 'None'}

View request: https://lightshowvault.com/admin/quotes
`;
    logger.debug('Email content:', emailText);

    logger.info(`Sending email to ${ADMIN_EMAIL}`);
    const { data, error: sendError } = await resend.emails().send({
      from: 'LightShowVault <notifications@lightshowvault.com>',
      to: ADMIN_EMAIL,
      subject: `New Quote Request from ${record.name}`,
      text: emailText
    });

    if (sendError) {
      logger.error('Resend API error:', sendError);
      throw new Error(sendError.message || 'Failed to send email');
    }

    logger.info('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  } catch (error) {
    logger.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        }
      }
    );
  }
});