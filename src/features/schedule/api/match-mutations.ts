/**
 * Match Mutation Hooks
 * 경기 상태/설정 변경용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import { matchManagementKeys } from './keys';
import { matchKeys } from '@/shared/api/keys';
import type { RecruitmentSetup, Json, Database } from '@/shared/types/database.types';

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
      status: 'RECRUITING' | 'CLOSED' | 'CONFIRMED' | 'CANCELED';
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
        CANCELED: '경기가 취소되었습니다.',
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

/**
 * 경기 취소 일괄 처리
 * 1. 모든 활성 신청(PENDING, CONFIRMED)을 CANCELED로 변경
 * 2. 취소 공지 발송
 * 3. 경기 상태를 CANCELED로 변경
 */
export function useCancelMatchFlow() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      matchId,
      message,
    }: {
      matchId: string;
      message: string;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const now = new Date().toISOString();

      // 1. 모든 활성 신청(PENDING, CONFIRMED)을 CANCELED로 변경
      const { error: cancelAppsError } = await supabase
        .from('applications')
        .update({
          status: 'CANCELED' as Database['public']['Enums']['application_status'],
          canceled_by: 'HOST',
          updated_at: now,
        })
        .eq('match_id', matchId)
        .in('status', ['PENDING', 'CONFIRMED']);

      if (cancelAppsError) throw cancelAppsError;

      // 2. 취소 공지 발송
      const fullMessage =
        message +
        '\n\n[환불 안내] 입금하신 참가비는 호스트가 1시간 이내에 환불할 예정입니다. 1시간이 지나도 환불받지 못한 경우, 고객센터를 통해 문의해 주세요.';

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;
      const { error: announcementError } = await supabaseAny
        .from('announcements')
        .insert({
          author_id: user?.id,
          target_type: 'MATCH',
          target_id: matchId,
          message: fullMessage,
        });

      if (announcementError) throw announcementError;

      // 3. 경기 상태를 CANCELED로 변경
      const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'CANCELED' })
        .eq('id', matchId);

      if (matchError) throw matchError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetail(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });
      toast.success('경기가 취소되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Cancel match flow error:', error);
      toast.error(`경기 취소 실패: ${error.message}`);
    },
  });
}
