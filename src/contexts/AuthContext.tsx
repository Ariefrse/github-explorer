import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  canUseWithoutAuth: boolean;
  showAuthPrompt: boolean;
  startUsageTimer: () => void;
  resetUsageTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USAGE_TIME_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isAuthenticated = !!user;
  const canUseWithoutAuth = !sessionStartTime ||
    (Date.now() - sessionStartTime < USAGE_TIME_LIMIT);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        if (!supabase) {
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          if (event === 'SIGNED_IN') {
            setSessionStartTime(null);
            setShowAuthPrompt(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, []);

  useEffect(() => {
    // Check if user has been using the app for more than 5 minutes without auth
    if (!isAuthenticated && sessionStartTime && !showAuthPrompt) {
      const timer = setTimeout(() => {
        if (Date.now() - sessionStartTime >= USAGE_TIME_LIMIT) {
          setShowAuthPrompt(true);
        }
      }, USAGE_TIME_LIMIT - (Date.now() - sessionStartTime));

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, sessionStartTime, showAuthPrompt]);

  const signInWithGoogle = async () => {
    if (!supabase) {
      console.error('Supabase not configured');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Error signing in with Google:', error);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const signOut = async () => {
    if (!supabase) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const startUsageTimer = () => {
    if (!isAuthenticated && !sessionStartTime) {
      setSessionStartTime(Date.now());
    }
  };

  const resetUsageTimer = () => {
    setSessionStartTime(null);
    setShowAuthPrompt(false);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated,
    signInWithGoogle,
    signOut,
    canUseWithoutAuth,
    showAuthPrompt,
    startUsageTimer,
    resetUsageTimer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}