import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Zap } from 'lucide-react';
import { signIn } from '../../lib/auth/session';
import { AUTH_ERRORS } from '../../lib/auth/errors';

// Development credentials - REMOVE IN PRODUCTION
const DEV_CREDENTIALS = {
  email: 'dudesonwill@gmail.com',
  password: 'admin123'
};

export function AdminLogin() {
  const [email, setEmail] = useState(DEV_CREDENTIALS.email);
  const [password, setPassword] = useState(DEV_CREDENTIALS.password);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error?.message || AUTH_ERRORS.UNKNOWN);
      setLoading(false);
      return;
    }

    navigate('/admin/dashboard');
    setLoading(false);
  };

  // Quick login for development
  const handleQuickLogin = async () => {
    setLoading(true);
    setError(null);
    
    const result = await signIn(DEV_CREDENTIALS.email, DEV_CREDENTIALS.password);
    
    if (!result.success) {
      setError(result.error?.message || AUTH_ERRORS.UNKNOWN);
      setLoading(false);
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-900 p-8 rounded-lg shadow-2xl">
          <div className="flex justify-center mb-8">
            <KeyRound className="w-12 h-12 text-purple-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-white text-center mb-8">
            Admin Login
          </h1>

          {error && (
            <div className="mb-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          {/* Quick login button for development */}
          <button
            onClick={handleQuickLogin}
            disabled={loading}
            className="w-full bg-purple-600/50 hover:bg-purple-600 mb-6 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Quick Login (Dev Only)
          </button>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 text-white border-2 border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}