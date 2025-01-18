import { getSupabaseClient } from './supabase';
import { ERRORS, TABLES } from './constants';
import { validateEnv } from './env';

export async function signIn(email: string, password: string) {
  validateEnv();
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    throw new Error(ERRORS.CONFIG);
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Sign in error:', error);
    throw error;
  }

  return data;
}

export async function checkAdminRole(): Promise<boolean> {
  validateEnv();
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return false;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from(TABLES.PROFILES)
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return false;
    }

    return profile?.role === 'admin';
  } catch (error) {
    console.error('Admin role check error:', error);
    return false;
  }
}