import { getSupabaseClient } from '../supabase';
import { validateCredentials } from './validation';
import { checkAdminRole } from './roles';
import { AUTH_ERRORS } from './errors';
import { TABLES } from '../constants';
import type { AuthResponse } from './types';
import { validateEnv } from '../env';

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  // Validate environment variables first
  try {
    validateEnv();
  } catch (error) {
    return {
      success: false,
      error: { message: AUTH_ERRORS.NO_CONNECTION }
    };
  }

  const validationError = validateCredentials(email, password);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { 
      success: false, 
      error: { message: AUTH_ERRORS.NO_CONNECTION }
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: { message: AUTH_ERRORS.INVALID_CREDENTIALS }
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: { message: AUTH_ERRORS.INVALID_CREDENTIALS }
      };
    }

    console.log('Auth: User signed in successfully, checking profile...');

    const { data: profile } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('Auth: Profile data:', profile);

    // Check for both admin and super_admin roles
    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      console.log('Auth: User does not have admin privileges');
      // Sign out if not admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: { message: AUTH_ERRORS.UNAUTHORIZED }
      };
    }

    console.log('Auth: Admin access granted');
    return { success: true };
  } catch (error) {
    console.error('Auth error:', error);
    return {
      success: false,
      error: { 
        message: error instanceof Error ? error.message : AUTH_ERRORS.UNKNOWN
      }
    };
  }
}

export async function signOut(): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  try {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  } catch (error) {
    console.error('Sign out error:', error);
  }
}