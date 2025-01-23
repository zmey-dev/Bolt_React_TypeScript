import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../supabase';
import { TABLES } from '../constants';
import type { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('Auth: Supabase client not initialized');
      return;
    }

    // Get initial session and check admin status
    const checkAuth = async () => {
      try {
        console.log('Auth: Checking initial session...');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log('Auth: No session found');
          setUser(null);
          setIsAdmin(false);
          setAuthError('No session found');
          return;
        }

        console.log('Auth: Session found for user:', session.user.email);

        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Auth: Error fetching profile:', profileError);
          setAuthError(`Profile error: ${profileError.message}`);
          return;
        }

        console.log('Auth: User profile:', profile);
        console.log('Auth: User role:', profile?.role);

        setUser(session.user as User);
        
        // Check for admin roles
        const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';
        console.log('Auth: Has admin role:', hasAdminRole);
        
        setIsAdmin(hasAdminRole);
        setIsSuperAdmin(profile?.role === 'super_admin');
        setAuthError(null);
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError(error instanceof Error ? error.message : 'Unknown error');
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth: State change event:', event);
      if (event === 'SIGNED_OUT') {
        console.log('Auth: User signed out');
        setUser(null);
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setLoading(false);
        setAuthError(null);
        return;
      }

      if (session?.user) {
        console.log('Auth: User signed in:', session.user.email);
        const { data: profile, error: profileError } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Auth: Error fetching profile after state change:', profileError);
          setAuthError(`Profile error: ${profileError.message}`);
          return;
        }

        console.log('Auth: User profile after state change:', profile);
        console.log('Auth: User role after state change:', profile?.role);

        setUser(session.user as User);
        
        // Check for admin roles
        const hasAdminRole = profile?.role === 'admin' || profile?.role === 'super_admin';
        console.log('Auth: Has admin role after state change:', hasAdminRole);
        
        setIsAdmin(hasAdminRole);
        setIsSuperAdmin(profile?.role === 'super_admin');
        setAuthError(null);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, isSuperAdmin, loading, authError };
}