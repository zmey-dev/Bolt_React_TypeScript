import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '../../../../lib/supabase';
import { createAccessCode, deleteAccessCode, updateAccessCode, deleteAccessCodeRequest } from '../../../../lib/api/access-codes';
import type { AccessCode, AccessCodeRequest } from '../../../../types';
import { useAuth } from '../../../../hooks/useAuth';

export function useAccessCodes() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [requests, setRequests] = useState<AccessCodeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, isSuperAdmin } = useAuth();

  const loadCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      // Start with base query
      const query = supabase
        .from('access_codes')
        .select('*');

      // If not super admin, only show own access codes
      if (!isSuperAdmin && user?.id) {
        query.eq('created_by_id', user.id);
      }
      
      // Add ordering
      query.order('created_at', { ascending: false });

      const { data, error: codesError } = await query;

      if (codesError) throw codesError;
      setCodes(data || []);
    } catch (err) {
      setError('Failed to load access codes');
      console.error('Error loading access codes:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, isSuperAdmin]);

  useEffect(() => {
    loadCodes();
  }, [loadCodes]);

  const handleGenerateCode = async (data: {
    code?: string;
    description?: string;
    expiresAt?: string | null;
  }) => {
    try {
      setIsGenerating(true);
      setError(null);
      
      // Create the access code with affiliate ID
      const code = await createAccessCode({
        code: data.code,
        description: data.description,
        expiresAt: data.expiresAt,
        created_by_id: user?.id
      });
      
      // Add to the list
      setCodes(prev => [code, ...prev]);
      
      // Return success
      return true;
    } catch (err) {
      setError('Failed to generate access code');
      console.error('Error generating code:', err);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access code?')) return;

    try {
      setError(null);
      await deleteAccessCode(id);
      setCodes(prev => prev.filter(code => code.id !== id));
    } catch (err) {
      setError('Failed to delete access code');
      console.error('Error deleting code:', err);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access code request?')) return;

    try {
      setError(null);
      await deleteAccessCodeRequest(id);
      setRequests(prev => prev.filter(request => request.id !== id));
    } catch (err) {
      setError('Failed to delete access code request');
      console.error('Error deleting request:', err);
    }
  };

  const handleUpdateCode = async (id: string, data: Partial<AccessCode | AccessCodeRequest>) => {
    try {
      setError(null);
      const supabase = getSupabaseClient();
      if (!supabase) throw new Error('Supabase client not initialized');

      // Handle access code request status updates
      if ('status' in data && typeof data.status === 'string') {
        const { error } = await supabase
          .from('access_code_requests')
          .update({ status: data.status })
          .eq('id', id);

        if (error) throw error;
        
        // Update requests state
        setRequests(prev => prev.map(request => 
          request.id === id ? { ...request, status: data.status as string } : request
        ));
      } else {
        // Handle regular access code updates
        await updateAccessCode(id, data as Partial<AccessCode>);
        setCodes(prev => prev.map(code => 
          code.id === id ? { ...code, ...data } : code
        ));
      }
    } catch (err) {
      setError('Failed to update access code');
      console.error('Error updating code:', err);
    }
  };

  return {
    codes,
    requests,
    loading,
    error,
    isGenerating,
    handleGenerateCode,
    handleDeleteCode,
    handleDeleteRequest,
    handleUpdateCode
  };
}