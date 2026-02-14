'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseAuthClient, getSupabaseBrowserClient, isSupabaseConfigured } from '@/shared/api/supabase/client';
import type { Profile } from '@/shared/types/database.types';
import type { AuthContextValue, AuthStatus } from './types';
import { useCacheRestored } from '@/shared/lib/cache-restored-context';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function getProfileQueryKey(userId: string) {
  return ['auth', 'profile', userId] as const;
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const isSessionFound = React.useRef(false);
  const queryClient = useQueryClient();
  const isCacheRestored = useCacheRestored();

  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }

    try {
      const queryKey = getProfileQueryKey(userId);
      const existingData = queryClient.getQueryData(queryKey);
      if (existingData) {
        setProfile(existingData as Profile);
        return;
      }

      const profileData = await queryClient.fetchQuery({
        queryKey,
        queryFn: () => fetchProfile(userId),
        staleTime: 1000 * 60 * 5,
      });
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    }
  }, [queryClient]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      queryClient.removeQueries({ queryKey: getProfileQueryKey(user.id) });
      await loadProfile(user.id);
    }
  }, [user, loadProfile, queryClient]);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      queryClient.clear();
      return;
    }

    try {
      const supabase = getSupabaseAuthClient();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      queryClient.clear();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }, [queryClient]);

  useEffect(() => {
    if (!isCacheRestored) return;
    if (user && !profile) {
      loadProfile(user.id).catch(console.error);
    }
  }, [isCacheRestored, user, profile, loadProfile]);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setStatus('unauthenticated');
      return;
    }

    const supabase = getSupabaseAuthClient();

    const initAuth = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth timeout')), 5000)
        );

        const authPromise = supabase.auth.getUser();
        const { data: { user: currentUser } } = await Promise.race([
          authPromise,
          timeoutPromise,
        ]) as Awaited<typeof authPromise>;

        if (currentUser) {
          setUser(currentUser);
          setStatus('authenticated');
          isSessionFound.current = true;
        } else if (!isSessionFound.current) {
          setStatus('unauthenticated');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : '';

        if (errorMessage === 'Auth timeout') {
          if (isSessionFound.current) return;

          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser(data.session.user);
            setStatus('authenticated');
            isSessionFound.current = true;
            return;
          }
        }

        if (!isSessionFound.current) {
          setStatus('unauthenticated');
        }

        if (errorMessage === 'Auth timeout') {
          const retryKey = 'auth_timeout_retry';
          const retries = parseInt(sessionStorage.getItem(retryKey) || '0', 10);

          if (retries < 2) {
            sessionStorage.setItem(retryKey, (retries + 1).toString());
            try { await supabase.auth.signOut(); } catch { /* ignore */ }
            localStorage.clear();
            document.cookie.split(';').forEach((c) => {
              document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
            });
            window.location.reload();
            return;
          } else {
            sessionStorage.removeItem(retryKey);
          }
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setStatus('authenticated');
          isSessionFound.current = true;
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    const handleAuthError = () => {
      console.warn('Auth error detected');
    };

    window.addEventListener('auth:error', handleAuthError);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth:error', handleAuthError);
    };
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    signOut,
    refreshProfile,
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
