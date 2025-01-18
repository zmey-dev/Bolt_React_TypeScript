import { useState, useEffect } from 'react';
import { getSupabaseClient, resetSupabaseClient } from '../lib/supabase/client';
import { ENV } from '../lib/env';

export function useSupabase() {
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    let mounted = true;
    let retryTimeout: NodeJS.Timeout;

    const initSupabase = async () => {
      try {
        if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
          throw new Error('Please click "Connect to Supabase" to set up your connection.');
        }

        const supabase = await getSupabaseClient();
        
        if (!supabase && mounted && retryCount < MAX_RETRIES) {
          // Reset client and retry after delay
          resetSupabaseClient();
          retryTimeout = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000 * Math.pow(2, retryCount)); // Exponential backoff
          return;
        }

        if (!supabase) {
          throw new Error('Failed to initialize Supabase client after multiple retries.');
        }

        if (mounted) {
          setInitialized(true);
          setError(null);
          setRetryCount(0);
        }
      } catch (err) {
        console.error('Supabase initialization error:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Supabase'));
          setInitialized(false);
        }
      }
    };

    initSupabase();

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
    };
  }, [retryCount]);

  return { initialized, error };
}