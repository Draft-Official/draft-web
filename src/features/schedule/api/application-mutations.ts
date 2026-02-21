/**
 * Application Mutation Hooks
 * 신청 관련 데이터 변경용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/entities/application';
import { matchKeys } from '@/entities/match';
import type { CancelOptions } from '@/entities/application';
import { matchManagementKeys } from './keys';

/**
 * 신청 승인 (PENDING → approved_at 설정, 입금대기 상태)
 */
export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
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
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('신청을 승인했습니다. 입금 안내가 발송됩니다.');
    },
    onError: (error: Error) => {
      console.error('Approve application error:', error);
      toast.error(`승인 실패: ${error.message}`);
    },
  });
}

/**
 * 게스트 송금 완료 알림 (상태 변경 없이 호스트에게 알림만 전송)
 * 게스트가 "송금 완료" 버튼을 누르면 호스트에게 알림 발송
 * 실제 확정은 호스트가 "입금확인" 버튼으로 처리
 */
export function useConfirmPaymentByGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();

      // 신청자(게스트) ID 조회
      const { data: app, error: appError } = await supabase
        .from('applications')
        .select('user_id, match:matches!match_id(host_id)')
        .eq('id', applicationId)
        .single();

      if (appError) throw appError;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hostId = (app.match as any)?.host_id;
      if (!hostId) throw new Error('호스트 정보를 찾을 수 없습니다.');

      // 호스트에게 알림만 전송 (상태 변경 X)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: notifError } = await (supabase as any)
        .from('notifications')
        .insert({
          user_id: hostId,
          type: 'GUEST_PAYMENT_CONFIRMED',
          reference_id: applicationId,
          reference_type: 'APPLICATION',
          match_id: matchId,
          actor_id: app.user_id,
        });

      if (notifError) throw notifError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      toast.success('호스트에게 송금 완료 알림을 보냈습니다.');
    },
    onError: (error: Error) => {
      console.error('Notify payment sent error:', error);
      toast.error(`알림 전송 실패: ${error.message}`);
    },
  });
}

/**
 * 호스트 입금 확인 (송금 완료 → CONFIRMED)
 * 호스트가 게스트의 입금을 확인하고 직접 확정 처리
 * 호스트에게 알림이 발송되지 않음
 */
export function useConfirmPaymentByHost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      // confirmedBy: 'HOST'로 알림 스킵
      return applicationService.confirmApplication(applicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      // 홈탭 경기 목록 갱신 (빈자리 반영)
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });
      toast.success('입금이 확인되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Confirm payment by host error:', error);
      toast.error(`입금 확인 실패: ${error.message}`);
    },
  });
}

/**
 * 호스트 입금 확인 (CONFIRMED 상태에서 payment_verified_at 설정)
 * 호스트 내부 관리용 - 게스트 상태에는 영향 없음
 */
export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('applications')
        .update({
          payment_verified_at: new Date().toISOString(),
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
      toast.success('입금이 확인되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Verify payment error:', error);
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
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      // 홈탭 경기 목록 갱신
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
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
 * 게스트 자가 취소 (게스트가 직접 신청 취소)
 * 대기 중 또는 입금대기 상태에서만 가능
 */
export function useCancelApplicationByGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
    }: {
      applicationId: string;
      matchId: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      return applicationService.cancelApplication(applicationId, {
        canceledBy: 'GUEST',
        cancelType: 'USER_REQUEST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.participatingMatches(''),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });
      toast.success('신청이 취소되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Cancel application by guest error:', error);
      toast.error(`취소 실패: ${error.message}`);
    },
  });
}

/**
 * 참가 취소 (확정된 게스트 취소 → CANCELED)
 * 취소 시 recruitment_setup의 current 값도 감소
 */
export function useCancelParticipation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      applicationId,
      cancelOptions,
    }: {
      applicationId: string;
      matchId: string;
      cancelOptions?: CancelOptions;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      // RPC cancel_application_with_count가 상태 변경 + recruitment_setup 갱신을 원자적으로 처리
      return applicationService.cancelApplication(applicationId, {
        canceledBy: 'HOST',
        ...cancelOptions,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      // 경기 관리 탭 전체 갱신
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      // 홈탭 경기 목록 갱신 (빈자리 반영)
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });

      const cancelType = variables.cancelOptions?.cancelType;
      if (cancelType === 'FRAUDULENT_PAYMENT') {
        toast.error('허위 송금으로 신고되었습니다. 운영진에게 통보됩니다.');
      } else {
        toast.error('참가를 취소했습니다.');
      }
    },
    onError: (error: Error) => {
      console.error('Cancel participation error:', error);
      toast.error(`취소 실패: ${error.message}`);
    },
  });
}
