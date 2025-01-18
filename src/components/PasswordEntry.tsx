import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Loader2 } from 'lucide-react';
import { validateAccessCode } from '../lib/api/access-codes';

interface PasswordEntryProps {
  onAccess: () => void;
}

export function PasswordEntry({ onAccess }: PasswordEntryProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const isValid = await validateAccessCode(code);
      if (isValid) {
        onAccess();
      } else {
        setError('Invalid access code');
      }
    } catch (err) {
      setError('Failed to validate access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-8">
            <KeyRound className="w-12 h-12 text-purple-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            LightShowVault
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors text-center font-mono text-lg tracking-wider"
                placeholder="Enter 6-digit code"
                maxLength={6}
                pattern="\d{6}"
                inputMode="numeric"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                'Enter Vault'
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}