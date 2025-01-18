import { getSupabaseClient } from '../supabase';
import { TABLES } from '../constants';
import { AUTH_ERRORS } from './errors';
import type { AuthResponse } from './types';

export async function checkAdminRole(): Promise<AuthResponse> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return { 
      success: false, 
      error: { message: AUTH_ERRORS.NO_CONNECTION }
    };
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return { 
        success: false,
        error: { message: AUTH_ERRORS.UNAUTHORIZED }
      };
    }

    const { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return {
        success: false,
        error: { message: AUTH_ERRORS.UNAUTHORIZED }
      };
    }

    if (!profile || profile.role !== 'admin') {
      return {
        success: false,
        error: { message: AUTH_ERRORS.UNAUTHORIZED }
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Admin check error:', error);
    return {
      success: false,
      error: { 
        message: error instanceof Error ? error.message : AUTH_ERRORS.UNKNOWN
      }
    };
  }
}