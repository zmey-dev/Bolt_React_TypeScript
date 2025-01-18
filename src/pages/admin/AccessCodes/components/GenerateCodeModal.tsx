import React, { useState } from 'react';
import { Loader2, X, Dice6 } from 'lucide-react';

interface GenerateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: {
    code?: string;
    description?: string;
    expiresAt?: string | null;
  }) => Promise<void>;
  isGenerating: boolean;
}

export function GenerateCodeModal({ 
  isOpen, 
  onClose, 
  onGenerate,
  isGenerating 
}: GenerateCodeModalProps) {
  const [description, setDescription] = useState('');
  const [durationType, setDurationType] = useState<'unlimited' | 'days' | 'custom'>('unlimited');
  const [days, setDays] = useState('7');
  const [expirationDate, setExpirationDate] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [useCustomCode, setUseCustomCode] = useState(false);

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

    await onGenerate({
      code: useCustomCode ? customCode : undefined,
      description: description || undefined,
      expiresAt
    });

    // Reset form
    setDescription('');
    setDurationType('unlimited');
    setDays('7');
    setExpirationDate('');
    setCustomCode('');
    setUseCustomCode(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-md bg-gray-900 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Generate Access Code</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
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
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500 font-mono text-center tracking-wider"
                  maxLength={6}
                  pattern="\d{6}"
                />
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
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
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Duration
              </label>
              <select
                value={durationType}
                onChange={(e) => setDurationType(e.target.value as 'unlimited' | 'days' | 'custom')}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
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
                    className="w-24 bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
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
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating || (useCustomCode && customCode.length !== 6)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Code'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}