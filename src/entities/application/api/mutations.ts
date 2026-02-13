/**
 * Application Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from './application-service';
import type { ParticipantInfo, ApplicationStatus } from '@/shared/types/database.types';
import type { CancelOptions } from './application-service';
import { applicationKeys } from './keys';
import { matchKeys } from '@/entities/match';

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
      queryClient.invalidateQueries({ queryKey: matchKeys.all }); // 경기 목록 갱신
      toast.success('경기 신청이 완료되었습니다');
    },
  });
}

/**
 * 신청 상태 업데이트 (호스트용)
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.updateApplicationStatus(applicationId, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청 상태가 변경되었습니다');
    },
  });
}

/**
 * 신청 승인 (호스트용)
 */
export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.approveApplication(applicationId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 승인되었습니다');
    },
  });
}

/**
 * 신청 확정 (호스트용)
 */
export function useConfirmApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.confirmApplication(applicationId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 확정되었습니다');
    },
  });
}

/**
 * 신청 거절 (호스트용)
 */
export function useRejectApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId }: { applicationId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.rejectApplication(applicationId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 거절되었습니다');
    },
  });
}

/**
 * 신청 취소 (게스트용 - 자기 취소)
 */
export function useCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, options }: { applicationId: string; options?: CancelOptions }) => {
      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(applicationId, {
        cancelType: options?.cancelType || 'USER_REQUEST',
        canceledBy: options?.canceledBy || 'GUEST',
        cancelReason: options?.cancelReason,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 취소되었습니다');
    },
  });
}

/**
 * 신청 취소 (호스트용)
 */
export function useHostCancelApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ applicationId, reason }: { applicationId: string; reason?: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.cancelApplication(applicationId, {
        cancelType: 'USER_REQUEST',
        canceledBy: 'HOST',
        cancelReason: reason,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.byMatch(data.match_id) });
      queryClient.invalidateQueries({ queryKey: applicationKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.match_id) });
      toast.success('신청이 취소되었습니다');
    },
  });
}
