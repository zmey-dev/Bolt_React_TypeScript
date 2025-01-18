import { getSupabaseClient } from '../supabase';
import { validateCredentials } from './validation';
import { checkAdminRole } from './roles';
import { AUTH_ERRORS } from './errors';
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

    const adminCheck = await checkAdminRole();
    if (!adminCheck.success) {
      // Sign out if not admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: { message: AUTH_ERRORS.UNAUTHORIZED }
      };
    }

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