'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { QrCode, Mail, Lock, Zap, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { signIn, user, isDemoMode } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.replace('/scan');
    }
  }, [user, router]);

  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/scan');
    } catch {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn('staff@event.com', 'demo-password');
      router.replace('/scan');
    } catch (err) {
      console.error(err);
      setError('Demo sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-gray-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white mb-4 shadow-xl shadow-indigo-600/25 border border-white/10">
            <QrCode className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Badge Scanner</h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Staff Access Portal</p>

          {isDemoMode && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Demo Mode Active (20 Attendees Ready)</span>
            </div>
          )}
        </div>

        {/* Login form card */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-900 rounded-3xl border border-white/10 p-6 sm:p-7 shadow-2xl flex flex-col gap-4"
        >
          {error && (
            <div className="rounded-2xl bg-rose-500/10 border border-rose-500/25 p-3.5 flex items-start gap-2.5 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>Email Address</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="staff@event.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Password</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition text-sm shadow-lg shadow-indigo-950/50 min-h-[44px] mt-1"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
          </button>

          {isDemoMode && (
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 active:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition min-h-[44px]"
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>One-Click Demo Staff Login</span>
              </button>
              <p className="text-[11px] text-slate-500 text-center">
                Signs in as <code className="text-slate-400 font-mono">staff@event.com</code>
              </p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
