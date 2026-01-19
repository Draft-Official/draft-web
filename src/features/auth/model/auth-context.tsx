'use client';

/**
 * Auth Context Provider
 * 전역 인증 상태 관리
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient, getSupabaseAuthClient, isSupabaseConfigured } from '@/lib/supabase/client';
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
  const isSessionFound = React.useRef(false);

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
      // 로그아웃도 AuthClient 사용
      const supabase = getSupabaseAuthClient();
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

    // 인증 상태는 AuthClient (PKCE) 사용
    const supabase = getSupabaseAuthClient();

    // 현재 세션 확인 (타임아웃 포함)
    const initAuth = async () => {
      try {
        // 5초 타임아웃 설정
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
          
          // Non-blocking profile load
          loadProfile(currentUser.id).catch(err => {
             console.error('[Auth] Background profile load failed:', err);
          });
        }
      } catch (error: any) {
        console.error('Failed to init auth:', error);
        
        // Race condition fix: If onAuthStateChange already set the user, don't overwrite with unauthenticated
        // We use a functional update or ref check usually, but here checking existing User state inside useEffect closure might differ.
        // However, we can check supabase.auth.getSession() or similar?
        // Simpler: If we are already 'authenticated' by event, skip.
        // But 'status' state variable in catch block is from closure? No, setStatus is stable.
        
        // Better: Check the actual current User state via a ref or just don't setUnauthenticated if error is Timeout but we have user?
        // Let's rely on the fact that if we have a user in the context state, we shouldn't force logout.
        // Wait, 'user' in the closure is stale (initial null).
        // We can use a ref to track if we found a user.
        
        // Alternative: Just ignore timeout if it's a timeout? 
        // If timeout happens, we assume we might be offline or slow, but if onAuthStateChange fired, we are good.
        // Let's check `supabase.auth.getSession()` synchronously? No it's async.
        
        // NOTE: If invalid token causing timeout, we might want to logout.
        // But here we have a valid User ID shown in UI.
        
        if (error.message === 'Auth timeout') {
            console.warn('[Auth] Timeout ignored because we might have processed session via event listener.');
            
            // If we already have a session from event listener, DO NOT overwrite
            if (isSessionFound.current) {
                console.log('[Auth] Keeping authenticated state from event listener');
                return;
            }

            // Double check session
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
                console.log('[Auth] Recovered from timeout using session check');
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
        if (error.message === 'Auth timeout') {
          const retryKey = 'auth_timeout_retry';
          const retries = parseInt(sessionStorage.getItem(retryKey) || '0', 10);

          if (retries < 2) {
            console.warn('[Auth] Timeout detected. Attempting auto-recovery...');
            sessionStorage.setItem(retryKey, (retries + 1).toString());

            // 1. Try generic sign out
            try { await supabase.auth.signOut(); } catch { /* ignore */ }

            // 2. Clear known persistence
            localStorage.clear(); // Clear all execution context
            
            // 3. Clear visible cookies
            document.cookie.split(";").forEach(function(c) { 
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });

            // 4. Force Reload
            window.location.reload();
            return;
          } else {
             console.error('[Auth] Auto-recovery failed. Manual clearance required.');
             sessionStorage.removeItem(retryKey); // Reset for next manual attempt
          }
        }
      }
    };

    initAuth();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setStatus('authenticated');
          isSessionFound.current = true;
          loadProfile(session.user.id).catch(console.error);
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
