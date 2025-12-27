'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { isValidEmail } from '@/lib/utils/validators';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await login({ email, password });
      // Login successful - AuthContext will handle redirect
    } catch (err: any) {
      // Show the actual error message from the API
      const errorMessage = err?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${darkMode ? 'bg-[#071219]' : 'bg-gray-50'}`}>
      {/* Background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-72 h-72 rounded-full blur-3xl transition-all ${
            darkMode ? "bg-[#2596be]/10" : "bg-[#2596be]/20"
          }`}
        />
        <div
          className={`absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl transition-all ${
            darkMode ? "bg-[#4EA8DE]/15" : "bg-[#4EA8DE]/25"
          }`}
        />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className={`p-8 rounded-2xl border backdrop-blur-2xl shadow-2xl ${
          darkMode ? 'bg-white/5 border-white/10' : 'bg-white/90 border-gray-200'
        }`}>
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-[#2596be]'}`}>
              Admin Portal
            </h1>
            <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sign in to access the admin panel
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`p-3 rounded-lg mb-4 ${
              darkMode ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                }`}
                placeholder="your@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  darkMode
                    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be]'
                }`}
                placeholder="••••••••"
              />
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-gray-300 text-[#2596be] focus:ring-[#2596be]"
              />
              <label
                htmlFor="remember"
                className={`ml-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2596be] text-white font-semibold rounded-lg shadow-lg hover:bg-[#1e7ca0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Info */}
          <div className={`mt-6 p-3 rounded-lg ${
            darkMode ? 'bg-[#2596be]/10 border border-[#2596be]/20' : 'bg-[#2596be]/5 border border-[#2596be]/10'
          }`}>
            <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <strong className={darkMode ? 'text-[#60DFFF]' : 'text-[#2596be]'}>Admin Access:</strong> Use your credentials to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
