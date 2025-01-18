import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, Calendar, Hash, User, Trash2 } from 'lucide-react';
import { getAccessCodes, createAccessCode, deleteAccessCode } from '../../lib/api/access-codes';
import type { AccessCode } from '../../types';

export function AccessCodeManager() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadAccessCodes();
  }, []);

  const loadAccessCodes = async () => {
    try {
      setLoading(true);
      const data = await getAccessCodes();
      setCodes(data);
    } catch (err) {
      setError('Failed to load access codes');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCode = async () => {
    try {
      setIsGenerating(true);
      setError(null);
      const code = await createAccessCode();
      setCodes(prev => [...prev, code]);
    } catch (err) {
      setError('Failed to generate access code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this access code?')) return;

    try {
      await deleteAccessCode(id);
      setCodes(prev => prev.filter(code => code.id !== id));
    } catch (err) {
      setError('Failed to delete access code');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Access Codes</h2>
        <button
          onClick={handleGenerateCode}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Generate Code
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="space-y-4">
        {codes.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No access codes generated yet</p>
        ) : (
          codes.map(code => (
            <div
              key={code.id}
              className="bg-gray-800 rounded-lg p-4 flex items-center justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-purple-400" />
                  <span className="font-mono text-white">{code.code}</span>
                </div>
                {code.description && (
                  <p className="text-sm text-gray-400">{code.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(code.created_at).toLocaleDateString()}
                  </div>
                  {code.created_by && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {code.created_by}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDeleteCode(code.id)}
                className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}