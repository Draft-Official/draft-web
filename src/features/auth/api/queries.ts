/**
 * Auth Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/features/auth/api/auth-api';
import { authKeys } from './keys';

/**
 * 프로필 조회
 * - staleTime: 5분 (프로필은 자주 변경되지 않음)
 * - gcTime: 24시간 (persist와 동일)
 */
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.profile(userId!),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      return authService.getProfile(userId!);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
    gcTime: 1000 * 60 * 60 * 24, // 24시간
  });
}
