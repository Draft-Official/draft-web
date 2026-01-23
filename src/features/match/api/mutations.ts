/**
 * Match Mutation Hooks
 * 매치 생성/수정/삭제용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from './match-api';
import { matchKeys } from './keys';
import { MatchCreateFormData } from '@/features/match/create/model/schema';
import { useAuth } from '@/features/auth/model/auth-context';

/**
 * 매치 생성
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: MatchCreateFormData) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다');
      }
      const hostId = user.id;

      console.log('[useCreateMatch] hostId:', hostId);
      console.log('[useCreateMatch] input:', input);

      const supabase = getSupabaseBrowserClient();
      console.log('[useCreateMatch] supabase client created');

      const matchService = createMatchService(supabase);
      console.log('[useCreateMatch] matchService created, calling createMatchV3...');

      try {
        const result = await matchService.createMatchV3(hostId, input);
        console.log('[useCreateMatch] createMatchV3 result:', result);
        return result;
      } catch (err) {
        console.error('[useCreateMatch] createMatchV3 error:', err);
        throw err;
      }
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
