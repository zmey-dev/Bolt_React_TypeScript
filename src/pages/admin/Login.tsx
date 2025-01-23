import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, LockKeyhole } from 'lucide-react';
import { signIn } from '../../lib/auth/session';
import { AUTH_ERRORS } from '../../lib/auth/errors';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Login: Attempting login for:', email);

    const result = await signIn(email, password);

    console.log('Login: Sign in result:', result);

    if (!result.success) {
      console.error('Login: Failed:', result.error);
      setError(result.error?.message || AUTH_ERRORS.UNKNOWN);
      setLoading(false);
      return;
    }

    console.log('Login: Success, navigating to dashboard');
    navigate('/admin/dashboard');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative text-white">
      <div className="fixed inset-0 bg-black/4 pointer-events-none z-20" />
      <div className="max-w-md w-full relative z-20">
        <div className="bg-[#260000] backdrop-blur-sm p-8 rounded-lg shadow-[0_0_50px_rgba(251,191,36,0.1)] border border-yellow-400 hover:border-yellow-500 transition-all duration-300 relative z-30">
          <div className="flex justify-center mb-8">
            <LockKeyhole className="w-12 h-12 text-yellow-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-white text-center mb-2 tracking-wide">
            Admin Login
          </h1>
          <p className="text-gray-300 text-center mb-8">
            Access the admin dashboard to manage your light show vault
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-900/30 border-2 border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#1f1f1f] text-white border-2 border-yellow-400/20 rounded-lg px-4 py-3 focus:outline-none focus:border-yellow-400/50 focus:ring-2 focus:ring-yellow-400/20 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-400/70 text-[#260000] font-medium py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-yellow-400/25 flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#260000]" />
                  Signing in...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5 text-[#260000]" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}