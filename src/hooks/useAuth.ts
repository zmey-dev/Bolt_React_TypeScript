import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../lib/supabase';
import { TABLES } from '../lib/constants';
import type { AdminUser } from '../types';

export function useAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Get initial session and check admin status
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setUser(null);
          setIsAdmin(false);
          return;
        }

        const { data: profile } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUser(session.user as AdminUser);
        setIsAdmin(profile?.role === 'admin');
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      if (session?.user) {
        const { data: profile } = await supabase
          .from(TABLES.PROFILES)
          .select('role')
          .eq('id', session.user.id)
          .single();

        setUser(session.user as AdminUser);
        setIsAdmin(profile?.role === 'admin');
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, isAdmin, loading };
}