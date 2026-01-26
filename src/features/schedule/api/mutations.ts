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
import type { RecruitmentSetup, Json } from '@/shared/types/database.types';

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
 * 입금 확인 (→ CONFIRMED)
 * 신청 확정 시 recruitment_setup의 current 값도 업데이트
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

      // 1. 신청 정보 조회 (participants_info 포함)
      const application = await applicationService.getApplicationById(applicationId);

      // 2. 경기 정보 조회 (recruitment_setup 포함)
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select('recruitment_setup')
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // 3. recruitment_setup의 current 값 업데이트
      const recruitmentSetup = match.recruitment_setup as RecruitmentSetup;

      if (recruitmentSetup && application.participants_info) {
        const participantsInfo = application.participants_info as Array<{ position?: string }>;

        if (recruitmentSetup.type === 'POSITION' && recruitmentSetup.positions) {
          // 포지션별로 current 증가
          participantsInfo.forEach((participant) => {
            const pos = participant.position as 'G' | 'F' | 'C' | 'B';
            if (pos && recruitmentSetup.positions?.[pos]) {
              recruitmentSetup.positions[pos].current += 1;
            }
          });
        } else if (recruitmentSetup.type === 'ANY') {
          // ANY 타입: max_count는 유지, current_count 증가 (또는 별도 필드 사용)
          // 참가자 수만큼 증가
          const addCount = participantsInfo.length;
          if (!recruitmentSetup.current_count) {
            recruitmentSetup.current_count = 0;
          }
          recruitmentSetup.current_count += addCount;
        }

        // 4. 경기 recruitment_setup 업데이트
        const { error: updateError } = await supabase
          .from('matches')
          .update({ recruitment_setup: recruitmentSetup as unknown as Json })
          .eq('id', matchId);

        if (updateError) {
          console.error('Failed to update recruitment_setup:', updateError);
          // 에러가 나도 신청 확정은 진행
        }
      }

      // 5. 신청 상태 확정
      return applicationService.confirmApplication(applicationId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      // 모든 사용자의 참여 목록 갱신 (게스트 탭)
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      // 홈탭 경기 목록 갱신 (빈자리 반영)
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
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
 * 참가 취소 (확정된 게스트 취소 → CANCELED)
 * 취소 시 recruitment_setup의 current 값도 감소
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

      // 1. 신청 정보 조회 (participants_info 포함, 확정 상태인지 확인)
      const application = await applicationService.getApplicationById(applicationId);

      // 확정된 신청만 current 값 감소 처리
      if (application.status === 'CONFIRMED') {
        // 2. 경기 정보 조회
        const { data: match, error: matchError } = await supabase
          .from('matches')
          .select('recruitment_setup')
          .eq('id', matchId)
          .single();

        if (!matchError && match) {
          // 3. recruitment_setup의 current 값 감소
          const recruitmentSetup = match.recruitment_setup as RecruitmentSetup;

          if (recruitmentSetup && application.participants_info) {
            const participantsInfo = application.participants_info as Array<{ position?: string }>;

            if (recruitmentSetup.type === 'POSITION' && recruitmentSetup.positions) {
              participantsInfo.forEach((participant) => {
                const pos = participant.position as 'G' | 'F' | 'C' | 'B';
                if (pos && recruitmentSetup.positions?.[pos] && recruitmentSetup.positions[pos].current > 0) {
                  recruitmentSetup.positions[pos].current -= 1;
                }
              });
            } else if (recruitmentSetup.type === 'ANY' && recruitmentSetup.current_count) {
              const subtractCount = participantsInfo.length;
              recruitmentSetup.current_count = Math.max(0, recruitmentSetup.current_count - subtractCount);
            }

            // 4. 경기 recruitment_setup 업데이트
            await supabase
              .from('matches')
              .update({ recruitment_setup: recruitmentSetup as unknown as Json })
              .eq('id', matchId);
          }
        }
      }

      // 5. 신청 취소 처리
      return applicationService.cancelApplication(applicationId, reason);
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
      toast.error('참가를 취소했습니다.');
    },
    onError: (error: Error) => {
      console.error('Cancel participation error:', error);
      toast.error(`취소 실패: ${error.message}`);
    },
  });
}

/**
 * 경기 상태 변경
 * RECRUITING (모집 중) → CLOSED (모집 마감) → CONFIRMED (경기 확정)
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
      status: 'RECRUITING' | 'CLOSED' | 'CONFIRMED';
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

      const messageMap: Record<string, string> = {
        CLOSED: '모집을 마감했습니다.',
        RECRUITING: '추가 모집을 시작했습니다.',
        CONFIRMED: '경기가 확정되었습니다.',
      };
      toast.success(messageMap[variables.status]);
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
        .update({ recruitment_setup: recruitmentSetup as unknown as Json })
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
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('모집 인원이 수정되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Update recruitment setup error:', error);
      toast.error(`수정 실패: ${error.message}`);
    },
  });
}
