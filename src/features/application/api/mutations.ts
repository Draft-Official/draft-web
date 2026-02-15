/**
 * Application Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/entities/application';
import { matchKeys } from '@/entities/match';
import type { CreateApplicationDTO } from '../model/types';
import { applicationKeys } from './keys';

/**
 * 경기 신청 생성
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, userId, participants, teamId }: CreateApplicationDTO) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.createApplicationV2(matchId, userId, participants, teamId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.byUser(data.user_id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() }); // 홈탭 경기 목록 갱신
      toast.success('경기 신청이 완료되었습니다');
    },
    // onError는 글로벌 mutationCache에서 처리
  });
}

/**
 * 신청 취소 (게스트용 - 자기 취소)
 */
export function useCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(applicationId, {
        cancelType: 'USER_REQUEST',
        canceledBy: 'GUEST',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 취소되었습니다');
    },
    // onError는 글로벌 mutationCache에서 처리
  });
}
