'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ShieldAlert, LogIn } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-3 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-slate-400 text-sm">Validating credentials…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-gray-950 px-4">
        <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 sm:p-7 text-center max-w-sm w-full shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 mx-auto mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <p className="text-white font-bold text-lg mb-1">Staff Access Required</p>
          <p className="text-slate-400 text-xs sm:text-sm mb-5">
            You must be signed in with authorized staff credentials to operate the scanner.
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm transition text-center shadow-lg shadow-indigo-950/50 min-h-[44px]"
          >
            <LogIn className="w-4 h-4" />
            <span>Proceed to Login</span>
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
