import { getSupabaseClient } from './supabase/client';
import { SupabaseError, handleSupabaseError } from './supabase/error';
import type { Database } from '../types/supabase';

export {
  getSupabaseClient,
  SupabaseError,
  handleSupabaseError
};

export type { Database };