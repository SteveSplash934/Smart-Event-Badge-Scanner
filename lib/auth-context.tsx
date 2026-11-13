'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { isFirebaseConfigured } from '@/lib/attendees';

export interface AuthUser {
  uid: string;
  email: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_AUTH_KEY = 'badge_scanner_demo_user';
const DEMO_LOGOUT_KEY = 'badge_scanner_demo_logged_out';

const DEFAULT_DEMO_USER: AuthUser = {
  uid: 'demo-staff-uid-123',
  email: 'staff@event.com',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (!configured) {
      if (typeof window !== 'undefined') {
        try {
          const isLoggedOut = localStorage.getItem(DEMO_LOGOUT_KEY) === 'true';
          if (isLoggedOut) return null;
          const saved = localStorage.getItem(DEMO_AUTH_KEY);
          return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
        } catch {
          return DEFAULT_DEMO_USER;
        }
      }
      return DEFAULT_DEMO_USER;
    }
    return null;
  });

  const [loading, setLoading] = useState<boolean>(() => configured);
  const [isDemoMode] = useState<boolean>(() => !configured);

  useEffect(() => {
    if (!configured || !auth) {
      try {
        const isLoggedOut = localStorage.getItem(DEMO_LOGOUT_KEY) === 'true';
        if (isLoggedOut) {
          setUser(null);
        } else {
          const saved = localStorage.getItem(DEMO_AUTH_KEY);
          setUser(saved ? JSON.parse(saved) : DEFAULT_DEMO_USER);
        }
      } catch {
        setUser(DEFAULT_DEMO_USER);
      }
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = onAuthStateChanged(
        auth,
        (u) => {
          if (u) {
            setUser({ uid: u.uid, email: u.email });
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (error) => {
          console.warn('[AuthProvider] Auth state listener error:', error);
          setLoading(false);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('[AuthProvider] Failed to initialize auth listener:', err);
      setLoading(false);
    }
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    if (!configured || !auth) {
      const demoUser: AuthUser = {
        uid: 'demo-staff-uid-123',
        email: email || 'staff@event.com',
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(DEMO_LOGOUT_KEY);
        localStorage.setItem(DEMO_AUTH_KEY, JSON.stringify(demoUser));
      }
      return;
    }

    const cred = await signInWithEmailAndPassword(auth, email, password);
    setUser({ uid: cred.user.uid, email: cred.user.email });
  };

  const signOut = async () => {
    if (!configured || !auth) {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem(DEMO_LOGOUT_KEY, 'true');
        localStorage.removeItem(DEMO_AUTH_KEY);
      }
      return;
    }
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, isDemoMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
