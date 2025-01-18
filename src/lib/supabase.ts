import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';
import type { Database } from '../types/supabase';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase configuration');
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient<Database>(
        ENV.SUPABASE_URL,
        ENV.SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: false
          }
        }
      );
    } catch (error) {
      console.error('Failed to create Supabase client:', error);
      return null;
    }
  }

  return supabaseInstance;
}