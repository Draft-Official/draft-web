/**
 * Match Mutation Hooks
 * 매치 생성/수정/삭제용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createMatchService } from '@/services/match/match.service';
import { matchKeys } from './keys';
import { MatchCreateFormData } from '../create/model/schema';
// ⚠️ 임시: OAuth 설정 후 아래 줄 복구
// import { useAuth } from '@/features/auth/model/auth-context';

/**
 * 매치 생성
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();
  // ⚠️ 임시: OAuth 설정 후 아래 줄 복구
  // const { user } = useAuth();

  // ⚠️ 임시 테스트용 UUID - OAuth 설정 후 삭제할 것
  // test@naver.com 유저의 UUID
  const TEST_USER_ID = 'd1011295-3375-41f4-83c7-9663dc00becf';

  return useMutation({
    mutationFn: async (input: MatchCreateFormData) => {
      // ⚠️ 임시: 테스트 UUID 강제 사용 (OAuth 설정 전까지)
      // TODO: OAuth 설정 후 아래 줄로 복구
      // const hostId = user?.id || TEST_USER_ID;
      const hostId = TEST_USER_ID;

      console.log('[useCreateMatch] hostId:', hostId);

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      return matchService.createMatch(hostId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('경기가 생성되었습니다');
    },
    onError: (error: any) => {
      // Supabase 에러는 다양한 형태로 올 수 있음
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error);
      console.error('Match creation error:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint,
      });
      toast.error(`경기 생성 실패: ${errorMessage}`);
    },
  });
}
