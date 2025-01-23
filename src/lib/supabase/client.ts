import { createClient } from '@supabase/supabase-js';
import { ENV } from '../env';
import type { Database } from '../../types/supabase';
import { SupabaseError } from './error';

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;
let initializationAttempts = 0;
const MAX_ATTEMPTS = 3;
const INITIAL_BACKOFF = 1000;
const MAX_BACKOFF = 10000;

export function getSupabaseClient() {
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    throw new SupabaseError('Missing Supabase configuration. Please check your environment variables.');
  }
  
  // Return existing instance if available and connected
  if (supabaseInstance) {
    return supabaseInstance;
  }

  // Check if we've exceeded max attempts
  if (initializationAttempts >= MAX_ATTEMPTS) {
    throw new SupabaseError('Failed to initialize Supabase client after multiple attempts.');
  }

  try {

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
        global: {
          headers: {
            'x-client-info': 'lightshow-vault'
          },
          fetch: (...args) => {
            // Add retry logic to fetch
            const fetchWithRetry = async (attempt = 0) => {
              try {
                const response = await fetch(...args);
                if (!response.ok && attempt < 3) {
                  throw new Error('Request failed');
                }
                return response;
              } catch (err) {
                if (attempt < 3) {
                  await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                  return fetchWithRetry(attempt + 1);
                }
                throw err;
              }
            };
            return fetchWithRetry();
          }
        },
        db: {
          schema: 'public'
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      }
    );
    
    initializationAttempts = 0;
    return supabaseInstance;
  } catch (error) {
    initializationAttempts++;
    supabaseInstance = null;
    throw new SupabaseError('Failed to initialize Supabase client', error);
  }
}

export function resetSupabaseClient() {
  supabaseInstance = null;
  initializationAttempts = 0;
}