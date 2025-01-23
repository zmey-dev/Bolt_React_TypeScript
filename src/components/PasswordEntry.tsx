import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Loader2, LockKeyhole, AlertCircle, HelpCircle, Sparkles } from 'lucide-react';
import { SnowfallBackground } from './SnowfallBackground';
import { validateAccessCode } from '../lib/api/access-codes';
import { AccessCodeRequestModal } from './AccessCodeRequestModal';

interface PasswordEntryProps {
  onAccess: () => void;
}

export function PasswordEntry({ onAccess }: PasswordEntryProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);

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
      className="min-h-screen flex items-center justify-center p-4 relative"
    >
      <div className="max-w-md w-full">
        {/* Updated Access Code Box */}
        <div className="relative bg-[#260000] p-8 rounded-lg shadow-[0_0_50px_rgba(251,191,36,0.1)] border border-yellow-400 hover:border-yellow-500 transition-all duration-300 z-30">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4">
              <LockKeyhole className="w-12 h-12 text-yellow-400" />
            </div>
            <div className="group flex items-center gap-3 text-2xl md:text-3xl font-bold text-white relative hover:text-yellow-400/90 transition-colors mt-2">
              <div className="relative">
                <Sparkles className="w-9 h-9 text-yellow-400 transition-all duration-300 group-hover:scale-110 group-hover:animate-[sparkle_1.5s_ease-in-out_infinite]" />
                <div className="absolute inset-0 bg-yellow-400/30 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
              </div>
              <span className="relative inline-flex gap-2 transition-all duration-300 group-hover:scale-105">
                <span className="relative">
                  Light Show
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </span>
                <span className="text-yellow-400 relative">
                  Vault
                  <div className="absolute inset-0 bg-yellow-400/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </span>
              </span>
            </div>
          </div>
          <p className="text-gray-300 text-center mb-8">
            Enter your access code to see our exclusive collection and get custom LED displays for your project!
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg text-red-200 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
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
                className="w-full bg-[#1f1f1f]/90 text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors text-center font-mono text-lg tracking-wider placeholder-gray-500"
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
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-400/25 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#260000]" />
                  Validating...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 text-[#260000]" />
                  Enter Vault
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-yellow-400/20 text-center">
            <button
              onClick={() => setShowRequestModal(true)}
              className="w-full sm:max-w-md mx-auto flex items-center justify-center gap-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white px-4 py-3 rounded-lg transition-colors border border-yellow-400/20 text-sm sm:text-base"
            >
              <HelpCircle className="w-5 h-5 text-yellow-400" />
              <span className="whitespace-nowrap">Don't have a code? Request one</span>
            </button>
          </div>
        </div>
      </div>
      <AccessCodeRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
      />
    </motion.div>
  );
}