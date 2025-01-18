import { useState, useEffect, useCallback } from 'react';
import { getAccessCodes, createAccessCode, deleteAccessCode, updateAccessCode } from '../../../../lib/api/access-codes';
import type { AccessCode } from '../../../../types';

export function useAccessCodes() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccessCodes();
      setCodes(data);
    } catch (err) {
      setError('Failed to load access codes');
      console.error('Error loading access codes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

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
      const code = await createAccessCode({
        code: data.code,
        description: data.description,
        expiresAt: data.expiresAt
      });
      setCodes(prev => [code, ...prev]);
    } catch (err) {
      setError('Failed to generate access code');
      console.error('Error generating code:', err);
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

  const handleUpdateCode = async (id: string, data: Partial<AccessCode>) => {
    try {
      setError(null);
      await updateAccessCode(id, data);
      setCodes(prev => prev.map(code => 
        code.id === id ? { ...code, ...data } : code
      ));
    } catch (err) {
      setError('Failed to update access code');
      console.error('Error updating code:', err);
    }
  };

  return {
    codes,
    loading,
    error,
    isGenerating,
    handleGenerateCode,
    handleDeleteCode,
    handleUpdateCode
  };
}