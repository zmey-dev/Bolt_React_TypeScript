import React, { useState } from 'react';
import { Plus, Loader2, AlertCircle, Calendar, Hash, User, Trash2, Edit2, Activity, Mail, Building2, Users, KeyRound } from 'lucide-react';
import { GenerateCodeModal } from './GenerateCodeModal';
import { ShareCodeModal } from './ShareCodeModal';
import type { AccessCode } from '../../../../types';

interface AccessCodesTableProps {
  codes: AccessCode[];
  requests?: AccessCodeRequest[];
  loading: boolean;
  error: string | null;
  isGenerating: boolean;
  onGenerateCode: (data: {
    description?: string;
    expiresAt?: string | null;
  }) => Promise<void>;
  onDeleteCode: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onUpdateCode: (id: string, data: Partial<AccessCode>) => void;
}

interface AccessCodeRequest {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  project_type: string;
  estimated_budget: string;
  timeline: string;
  additional_info?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export function AccessCodesTable({
  codes,
  requests,
  loading,
  error,
  isGenerating,
  onGenerateCode,
  onDeleteCode,
  onDeleteRequest,
  onUpdateCode
}: AccessCodesTableProps) {
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<AccessCode | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AccessCodeRequest | null>(null);

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
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-6 h-6 text-yellow-400" />
          Access Codes
        </h1>
        
        {requests && requests.length > 0 && (
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400 px-4 py-2 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-medium">
              {requests.length} new access {requests.length === 1 ? 'request' : 'requests'}
            </span>
          </div>
        )}
        
        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-[#260000] px-6 py-3 rounded-lg transition-colors font-medium shadow-lg hover:shadow-yellow-400/25"
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
        <div className="text-center py-12 text-gray-400 rounded-lg border border-yellow-400 bg-[#260000]">
          <Hash className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No access codes generated yet</p>
          <p className="text-sm">Generate your first code to get started</p>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-400 overflow-hidden bg-[#260000]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-yellow-400">
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
                  className="border-b border-yellow-400/20 hover:bg-[#260000]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-yellow-400" />
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
                      code.status === 'active'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : code.status === 'expired'
                        ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {code.status === 'active' ? 'Active' : code.status === 'expired' ? 'Expired' : 'Inactive'}
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
                        className="p-2 hover:bg-yellow-400/10 text-yellow-400 hover:text-yellow-300 rounded-lg transition-colors"
                        title="Share code via email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onUpdateCode(code.id, { 
                          status: code.status === 'active' ? 'inactive' : 'active' 
                        })}
                        className="p-2 hover:bg-yellow-400/10 rounded-lg transition-colors"
                        title={code.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCode(code.id)}
                        className="p-2 hover:bg-red-900/20 text-red-400 hover:text-red-300 rounded-lg transition-colors"
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
      
      {requests && requests.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-yellow-400" />
            Access Code Requests
          </h2>
          <div className="rounded-lg border border-yellow-400 overflow-hidden bg-[#260000]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-yellow-400">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Company</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Project Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Budget</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Timeline</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Additional Info</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(request => (
                  <tr 
                    key={request.id}
                    className="border-b border-yellow-400/20 hover:bg-[#260000]/30 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-white">{request.company_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="text-white">{request.contact_name}</span>
                        </div>
                        <div className="text-sm text-gray-400">{request.email}</div>
                        {request.phone && (
                          <div className="text-sm text-gray-400">{request.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {request.project_type}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {request.estimated_budget}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {request.timeline}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs text-gray-300 group relative">
                        <div className="truncate">
                          {request.additional_info || '-'}
                        </div>
                        {request.additional_info && (
                          <div className="absolute left-0 top-full mt-2 p-3 bg-[#1f1f1f] border border-yellow-400 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 w-64">
                            {request.additional_info}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={request.status}
                        onChange={(e) => {
                          onUpdateCode(request.id, { status: e.target.value });
                        }}
                        className="bg-[#1f1f1f] text-white border border-yellow-400 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-yellow-400"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsGenerateModalOpen(true);
                            setSelectedRequest(request);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-[#260000] rounded-lg transition-colors text-sm font-medium"
                        >
                          <Plus className="w-4 h-4" />
                          Generate Code
                        </button>
                       <button
                         onClick={() => onDeleteRequest(request.id)}
                         className="p-2 hover:bg-red-900/30 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                         title="Delete request"
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
        </div>
      )}

      <GenerateCodeModal
        isOpen={isGenerateModalOpen}
        onClose={() => {
          setIsGenerateModalOpen(false);
          setSelectedRequest(null);
        }}
        selectedRequest={selectedRequest}
        onGenerate={onGenerateCode}
        isGenerating={isGenerating}
      />

      <ShareCodeModal
        code={selectedCode}
        onClose={() => setSelectedCode(null)}
      />
    </div>
  );
}