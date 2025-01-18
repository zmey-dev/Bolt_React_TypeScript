import React, { useState } from 'react';
import { X, Mail, Copy, Check, Loader2 } from 'lucide-react';
import { sendAccessCodeEmail } from '../../../../lib/api/email';
import type { AccessCode } from '../../../../types';

interface ShareCodeModalProps {
  code: AccessCode | null;
  onClose: () => void;
}

export function ShareCodeModal({ code, onClose }: ShareCodeModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!code) return null;

  const defaultMessage = `Here's your access code for LightShowVault: ${code.code}\n\n` +
    `${code.description ? `Note: ${code.description}\n\n` : ''}` +
    `${code.expires_at ? `This code expires on ${new Date(code.expires_at).toLocaleDateString()}\n\n` : ''}` +
    'Visit https://lightshowvault.com to use your code.';

  const handleSendEmail = async () => {
    try {
      setSending(true);
      setError(null);
      await sendAccessCodeEmail(code.id, email, message || undefined);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to send email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message || defaultMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        <div className="relative w-full max-w-md bg-gray-900 rounded-lg shadow-xl">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Share Access Code</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-200 text-sm">
                Email sent successfully!
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Message (Optional)
              </label>
              <div className="relative">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={defaultMessage}
                  rows={6}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleCopyMessage}
                  className="absolute top-2 right-2 p-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  title="Copy message"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
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
                onClick={handleSendEmail}
                disabled={!email || sending}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}