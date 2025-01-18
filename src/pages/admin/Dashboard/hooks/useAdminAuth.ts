import { useEffect } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { getSupabaseClient } from '../../../../lib/supabase';
import { TABLES } from '../../../../lib/constants';

export function useAdminAuth(navigate: NavigateFunction) {
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        navigate('/admin/login');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      const { data: profile } = await supabase
        .from(TABLES.PROFILES)
        .select('role')
        .single();

      if (profile?.role !== 'admin') {
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  return { loading: false };
}