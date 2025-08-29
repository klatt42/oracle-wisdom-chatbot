'use client';

import { useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

interface OracleLoginProps {
  onLogin: () => void;
}

export function OracleLogin({ onLogin }: OracleLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call to verify password
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password === 'hormozi2025' || password === process.env.NEXT_PUBLIC_ORACLE_PASSWORD) {
        onLogin();
      } else {
        setError('The Oracle denies your entry. Check your credentials.');
      }
    } catch {
      setError('Connection to the Oracle failed. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="oracle-card w-full max-w-md p-8 relative">
        {/* Oracle Header */}
        <div className="text-center mb-8">
          <div className="oracle-glow mb-4">
            <Sparkles className="w-16 h-16 mx-auto text-yellow-400" />
          </div>
          <h1 className="oracle-title text-4xl mb-2">
            ORACLE
          </h1>
          <p className="oracle-text text-lg opacity-90">
            Alex Hormozi Wisdom Portal
          </p>
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent mx-auto mt-4"></div>
        </div>

        {/* Access Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block oracle-text text-sm font-medium mb-2">
              Enter the Sacred Key
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="oracle-input w-full px-4 py-3 text-lg focus:ring-0"
                placeholder="Password required for wisdom access"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 oracle-text opacity-70 hover:opacity-100 transition-opacity"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="oracle-button w-full py-3 px-6 text-lg font-semibold disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                Consulting the Oracle...
              </div>
            ) : (
              'Enter the Oracle'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="oracle-text text-xs opacity-60">
            Protected access to Alex Hormozi&apos;s business wisdom
          </p>
          <p className="oracle-text text-xs opacity-40 mt-1">
            BizInsiderPro Oracle System
          </p>
        </div>

        {/* Mystical Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-transparent to-yellow-400 opacity-20 blur-sm -z-10 rounded-xl"></div>
      </div>
    </div>
  );
}