/**
 * Auth Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/services/auth';
import type { ProfileUpdate } from '@/shared/types/database.types';
import { authKeys } from './keys';

/**
 * 프로필 업데이트
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: ProfileUpdate }) => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.updateProfile(userId, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: authKeys.profile(data.id) });
      toast.success('프로필이 업데이트되었습니다');
    },
  });
}

/**
 * Kakao 로그인
 */
export function useSignInWithKakao() {
  return useMutation({
    mutationFn: async (redirectTo?: string) => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.signInWithKakao(redirectTo);
    },
  });
}

/**
 * Google 로그인
 */
export function useSignInWithGoogle() {
  return useMutation({
    mutationFn: async (redirectTo?: string) => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.signInWithGoogle(redirectTo);
    },
  });
}

/**
 * 이메일 로그인
 */
export function useSignInWithEmail() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.signInWithEmail(email, password);
    },
    onSuccess: () => {
      toast.success('로그인되었습니다');
    },
  });
}

/**
 * 로그아웃
 */
export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.signOut();
    },
    onSuccess: () => {
      queryClient.clear();
      toast.success('로그아웃되었습니다');
    },
  });
}
