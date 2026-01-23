/**
 * Application Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/services/application';
import type { ParticipantInfo } from '@/shared/types/database.types';
import { applicationKeys } from './keys';
import { matchKeys } from '@/features/match/api/keys';

interface CreateApplicationInput {
  matchId: string;
  userId: string;
  participantsInfo: ParticipantInfo[];
  teamId?: string | null;
}

/**
 * 경기 신청 생성
 */
export function useCreateApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, userId, participantsInfo, teamId }: CreateApplicationInput) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.createApplicationV2(matchId, userId, participantsInfo, teamId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.byUser(data.user_id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('경기 신청이 완료되었습니다');
    },
    // onError는 글로벌 mutationCache에서 처리
  });
}

/**
 * 신청 취소 (사용자용)
 */
export function useCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(applicationId, reason);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 취소되었습니다');
    },
    // onError는 글로벌 mutationCache에서 처리
  });
}
