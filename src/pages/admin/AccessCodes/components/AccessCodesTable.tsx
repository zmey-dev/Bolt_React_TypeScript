import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, Calendar, Hash, User, Trash2, Edit2, Activity, Mail } from 'lucide-react';
import { GenerateCodeModal } from './GenerateCodeModal';
import { ShareCodeModal } from './ShareCodeModal';
import type { AccessCode } from '../../../../types';

interface AccessCodesTableProps {
  codes: AccessCode[];
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
  onGenerateCode: (data: {
    description?: string;
    expiresAt?: string | null;
  }) => Promise<void>;
  onDeleteCode: (id: string) => void;
  onUpdateCode: (id: string, data: Partial<AccessCode>) => void;
}

export function AccessCodesTable({
  codes,
  loading,
  error,
  isGenerating,
  onGenerateCode,
  onDeleteCode,
  onUpdateCode
}: AccessCodesTableProps) {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AccessCode | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">Access Codes</h1>
        
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Generate New Code
        </button>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {codes.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No access codes generated yet</p>
          <p className="text-sm">Generate your first code to get started</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Code</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Description</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Created</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Usage</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Expires</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map(code => (
                <tr 
                  key={code.id}
                  className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-purple-400" />
                      <span className="font-mono text-white">{code.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {code.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-300">
                        {new Date(code.created_at).toLocaleDateString()}
                      </div>
                      {code.created_by && (
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <User className="w-3 h-3" />
                          {code.created_by}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      code.is_active 
                        ? 'bg-green-500/10 text-green-500' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                      {code.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <Activity className="w-3 h-3" />
                        Used {code.use_count || 0} times
                      </div>
                      {code.last_used_at && (
                        <div className="text-xs text-gray-400">
                          Last used: {new Date(code.last_used_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">
                    {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCode(code)}
                        className="p-2 hover:bg-purple-900/30 text-purple-400 hover:text-purple-300 rounded-lg transition-colors"
                        title="Share code via email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateCode(code.id, { is_active: !code.is_active })}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        title={code.is_active ? 'Deactivate' : 'Activate'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCode(code.id)}
                        className="p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <GenerateCodeModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={async (data) => {
          await onGenerateCode(data);
          setIsGenerateModalOpen(false);
        }}
        isGenerating={isGenerating}
      />

      <ShareCodeModal
        code={selectedCode}
        onClose={() => setSelectedCode(null)}
      />
    </div>
  );
}