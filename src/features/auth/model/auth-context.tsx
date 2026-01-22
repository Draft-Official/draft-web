'use client';

/**
 * Auth Context Provider
 * 전역 인증 상태 관리
 *
 * React Query의 persist cache를 활용하여 새로고침 시 프로필 API 호출 최소화
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient, getSupabaseAuthClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { createAuthService } from '@/services/auth';
import type { Profile } from '@/shared/types/database.types';
import type { AuthContextValue, AuthStatus } from './types';
import { authKeys } from '../api/keys';
import { useCacheRestored } from '@/shared/lib/cache-restored-context';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const isSessionFound = React.useRef(false);
  const queryClient = useQueryClient();
  const isCacheRestored = useCacheRestored();

  // 프로필 로드 (React Query 캐시 활용)
  const loadProfile = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }

    try {
      // 캐시 먼저 확인
      const existingData = queryClient.getQueryData(authKeys.profile(userId));
      if (existingData) {
        setProfile(existingData as Profile);
        return;
      }

      // 캐시에 없을 때만 fetch
      const profileData = await queryClient.fetchQuery({
        queryKey: authKeys.profile(userId),
        queryFn: async () => {
          const supabase = getSupabaseBrowserClient();
          const authService = createAuthService(supabase);
          return authService.getProfile(userId);
        },
        staleTime: 1000 * 60 * 5, // 5분
      });
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    }
  }, [queryClient]);

  // 프로필 새로고침 (캐시 삭제 후 다시 fetch)
  const refreshProfile = useCallback(async () => {
    if (user) {
      queryClient.removeQueries({ queryKey: authKeys.profile(user.id) });
      await loadProfile(user.id);
    }
  }, [user, loadProfile, queryClient]);

  // 로그아웃
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
      const authService = createAuthService(supabase);
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      queryClient.clear();
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }, [queryClient]);

  // persist 복원 완료 후 프로필 로드
  useEffect(() => {
    if (!isCacheRestored) return;

    if (user && !profile) {
      loadProfile(user.id).catch(console.error);
    }
  }, [isCacheRestored, user, profile, loadProfile]);

  // 초기 세션 로드 및 인증 상태 변경 리스너
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

        // Auto-recovery for stuck state
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
