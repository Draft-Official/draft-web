/**
 * Auth Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createAuthService } from '@/services/auth';
import { authKeys } from './keys';

/**
 * 프로필 조회
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
  });
}
