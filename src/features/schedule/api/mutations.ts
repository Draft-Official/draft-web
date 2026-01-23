/**
 * Match Management Mutation Hooks
 * 경기 관리 데이터 변경용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/features/application/api/application-api';
import { useAuth } from '@/features/auth';
import { matchManagementKeys } from './keys';
import { matchKeys } from '@/shared/api/keys';
import type { RecruitmentSetup } from '@/shared/types/database.types';

/**
 * 신청 승인 (PENDING → approved_at 설정, 입금대기 상태)
 */
export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      matchId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();

      // approved_at 설정 (status는 PENDING 유지)
      const { data, error } = await supabase
        .from('applications')
        .update({
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      toast.success('신청을 승인했습니다. 입금 안내가 발송됩니다.');
    },
    onError: (error: Error) => {
      console.error('Approve application error:', error);
      toast.error(`승인 실패: ${error.message}`);
    },
  });
}

/**
 * 입금 확인 (→ CONFIRMED)
 */
export function useConfirmPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      matchId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      return applicationService.confirmApplication(applicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      toast.success('입금이 확인되었습니다. 참가가 확정되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Confirm payment error:', error);
      toast.error(`입금 확인 실패: ${error.message}`);
    },
  });
}

/**
 * 신청 거절 (→ REJECTED)
 */
export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      matchId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      return applicationService.rejectApplication(applicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      toast.error('신청을 거절했습니다.');
    },
    onError: (error: Error) => {
      console.error('Reject application error:', error);
      toast.error(`거절 실패: ${error.message}`);
    },
  });
}

/**
 * 참가 취소 (확정된 게스트 취소 → CANCELED)
 */
export function useCancelParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      matchId,
      reason,
    }: {
      applicationId: string;
      matchId: string;
      reason?: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      return applicationService.cancelApplication(applicationId, reason);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      toast.error('참가를 취소했습니다.');
    },
    onError: (error: Error) => {
      console.error('Cancel participation error:', error);
      toast.error(`취소 실패: ${error.message}`);
    },
  });
}

/**
 * 모집 상태 변경 (RECRUITING ↔ CLOSED)
 */
export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      matchId,
      status,
    }: {
      matchId: string;
      status: 'RECRUITING' | 'CLOSED';
    }) => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.hostedMatches(user?.id ?? ''),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });

      const message =
        variables.status === 'CLOSED' ? '모집을 마감했습니다.' : '추가 모집을 시작했습니다.';
      toast.success(message);
    },
    onError: (error: Error) => {
      console.error('Update match status error:', error);
      toast.error(`상태 변경 실패: ${error.message}`);
    },
  });
}

/**
 * 모집 인원 수정
 */
export function useUpdateRecruitmentSetup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      recruitmentSetup,
    }: {
      matchId: string;
      recruitmentSetup: RecruitmentSetup;
    }) => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('matches')
        .update({ recruitment_setup: recruitmentSetup })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      toast.success('모집 인원이 수정되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Update recruitment setup error:', error);
      toast.error(`수정 실패: ${error.message}`);
    },
  });
}
