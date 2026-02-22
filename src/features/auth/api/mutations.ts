/**
 * Auth Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/shared/api/auth-service';

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
