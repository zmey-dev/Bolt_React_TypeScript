import { createClient } from '@supabase/supabase-js';
import { ENV } from '../env';
import type { Database } from '../../types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let initializationAttempts = 0;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1000;

export async function getSupabaseClient() {
  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we've exceeded max attempts
  if (initializationAttempts >= MAX_ATTEMPTS) {
    console.error('Failed to initialize Supabase client after multiple attempts');
    return null;
  }

  try {
    // Validate environment variables
    if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration. Please click "Connect to Supabase" to set up your connection.');
    }

    // Create client with proper configuration
    supabaseInstance = createClient<Database>(
      ENV.SUPABASE_URL,
      ENV.SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false
        },
        db: {
          schema: 'public'
        }
      }
    );

    // Test the connection
    const { error } = await supabaseInstance.from('gallery_types').select('count');
    if (error) {
      throw error;
    }

    return supabaseInstance;
  } catch (error) {
    console.error('Supabase initialization error:', error);
    initializationAttempts++;
    
    // Retry after delay
    if (initializationAttempts < MAX_ATTEMPTS) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * initializationAttempts));
      return getSupabaseClient();
    }
    
    supabaseInstance = null;
    return null;
  }
}

export function resetSupabaseClient() {
  supabaseInstance = null;
  initializationAttempts = 0;
}