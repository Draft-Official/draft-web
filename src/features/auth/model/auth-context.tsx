'use client';

/**
 * Auth Context Provider
 * 전역 인증 상태 관리
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { createAuthService } from '@/services/auth';
import type { Profile } from '@/shared/types/database.types';
import type { AuthContextValue, AuthStatus } from './types';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // 프로필 로드
  const loadProfile = useCallback(async (userId: string) => {
    // Supabase 미설정 시 스킵
    if (!isSupabaseConfigured()) {
      setProfile(null);
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      const profileData = await authService.getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setProfile(null);
    }
  }, []);

  // 프로필 새로고침
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  // 로그아웃
  const signOut = useCallback(async () => {
    // Supabase 미설정 시 로컬 상태만 클리어
    if (!isSupabaseConfigured()) {
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setStatus('unauthenticated');
    } catch (error) {
      console.error('Failed to sign out:', error);
      throw error;
    }
  }, []);

  // 초기 세션 로드 및 인증 상태 변경 리스너
  useEffect(() => {
    // Supabase 미설정 시 unauthenticated로 설정하고 종료
    if (!isSupabaseConfigured()) {
      console.warn('[Auth] Supabase가 설정되지 않았습니다. 인증 기능이 비활성화됩니다.');
      setStatus('unauthenticated');
      return;
    }

    const supabase = getSupabaseBrowserClient();

    // 현재 세션 확인
    const initAuth = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        if (currentUser) {
          setUser(currentUser);
          await loadProfile(currentUser.id);
          setStatus('authenticated');
        } else {
          setStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Failed to init auth:', error);
        setStatus('unauthenticated');
      }
    };

    initAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadProfile(session.user.id);
          setStatus('authenticated');
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setStatus('unauthenticated');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
      }
    );

    // auth:error 이벤트 리스너 (React Query에서 발생)
    const handleAuthError = () => {
      // 인증 에러 발생 시 처리 (예: 로그인 페이지로 리다이렉트)
      console.warn('Auth error detected');
    };

    window.addEventListener('auth:error', handleAuthError);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth:error', handleAuthError);
    };
  }, [loadProfile]);

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

/**
 * Auth Context 훅
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
