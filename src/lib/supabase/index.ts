import { getSupabaseClient, resetSupabaseClient } from './client';
import { SupabaseError, handleSupabaseError } from './error';
import type { Database } from '../../types/supabase';

export {
  getSupabaseClient,
  resetSupabaseClient,
  SupabaseError,
  handleSupabaseError
};

export type { Database };