import React, { useState, useEffect } from 'react';
import { Loader2, X, Dice6, Hash } from 'lucide-react';

interface GenerateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRequest?: AccessCodeRequest | null;
  onGenerate: (data: {
    description?: string;
    expiresAt?: string | null;
  }) => Promise<void>;
  isGenerating: boolean;
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

export function GenerateCodeModal({ 
  isOpen, 
  onClose, 
  selectedRequest,
  onGenerate,
  isGenerating,
}: GenerateCodeModalProps) {
  const [description, setDescription] = useState('');
  const [durationType, setDurationType] = useState<'unlimited' | 'days' | 'custom'>('unlimited');
  const [days, setDays] = useState('7');
  const [expirationDate, setExpirationDate] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setDurationType('unlimited');
      setDays('7');
      setExpirationDate('');
      setCustomCode('');
      setUseCustomCode(false);
      
      // If we have a selected request, pre-fill the description
      if (selectedRequest) {
        setDescription(
          `Access code for ${selectedRequest.company_name} - ${selectedRequest.project_type} project`
        );
      }
    }
  }, [isOpen, selectedRequest]);

  const generateRandomCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setCustomCode(code);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let expiresAt: string | null = null;
    
    if (durationType === 'days') {
      const date = new Date();
      date.setDate(date.getDate() + parseInt(days));
      expiresAt = date.toISOString();
    } else if (durationType === 'custom') {
      expiresAt = expirationDate;
    }

    const success = await onGenerate({
      code: useCustomCode ? customCode : undefined,
      description: description || undefined,
      expiresAt
    });

    if (success) {
      // Reset form
      setDescription('');
      setDurationType('unlimited');
      setDays('7');
      setExpirationDate('');
      setCustomCode('');
      setUseCustomCode(false);
      
      // Close modal
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-[#260000] rounded-lg shadow-xl border border-yellow-400/20">
          <div className="flex items-center justify-between p-4 border-b border-yellow-400/20">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Generate Access Code</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#3b0000] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Access Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setCustomCode(value);
                    setUseCustomCode(true);
                  }}
                  placeholder="Enter 6-digit code"
                  className="flex-1 bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors font-mono text-center tracking-wider"
                  maxLength={6}
                  pattern="\d{6}"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 bg-[#1f1f1f] hover:bg-[#3b0000] text-white rounded-lg transition-colors flex items-center gap-2 border border-yellow-400/20"
                >
                  <Dice6 className="w-4 h-4" />
                  Random
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Who is this code for?"
                className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Duration
              </label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as 'unlimited' | 'days' | 'custom')}
                className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
              >
                <option value="unlimited">Never expires</option>
                <option value="days">Expires in days</option>
                <option value="custom">Custom expiration date</option>
              </select>

              {durationType === 'days' && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    min="1"
                    max="365"
                    className="w-24 bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                    required
                  />
                  <span className="flex items-center text-gray-400">days</span>
                </div>
              )}

              {durationType === 'custom' && (
                <div className="mt-2">
                  <input
                    type="datetime-local"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-3 py-2 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#3b0000] text-white rounded-lg transition-colors border border-yellow-400/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || (useCustomCode && customCode.length !== 6)}
                className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] px-4 py-2 rounded-lg transition-colors font-medium shadow-lg hover:shadow-yellow-400/25"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#260000]" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Hash className="w-4 h-4 text-[#260000]" />
                    Generate Code
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}