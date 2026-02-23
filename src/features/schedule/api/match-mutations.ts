/**
 * Match Mutation Hooks
 * 경기 상태/설정 변경용 React Query hooks
 */
import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { matchKeys } from '@/entities/match';
import { useAuth } from '@/shared/session';
import { matchManagementKeys } from './keys';
import type { RecruitmentSetup, Json, Database } from '@/shared/types/database.types';

function removeCanceledMatchFromHomeInfiniteCache(
  queryClient: QueryClient,
  canceledMatchId: string
) {
  queryClient.setQueriesData(
    { queryKey: matchKeys.listInfinite() },
    (oldData: unknown) => {
      if (!oldData || typeof oldData !== 'object' || !('pages' in oldData)) {
        return oldData;
      }

      const cached = oldData as {
        pages: Array<Record<string, unknown> & { matches?: Array<{ matchId?: string }> }>;
        pageParams?: unknown[];
      };

      const nextPages = cached.pages.map((page) => {
        if (!Array.isArray(page.matches)) return page;

        const nextMatches = page.matches.filter(
          (match) => match.matchId !== canceledMatchId
        );

        if (nextMatches.length === page.matches.length) return page;

        return {
          ...page,
          matches: nextMatches,
        };
      });

      return {
        ...cached,
        pages: nextPages,
      };
    }
  );
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
        queryKey: matchManagementKeys.matchDetails(),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.listInfinite(),
      });

      if (variables.status === 'CANCELED') {
        removeCanceledMatchFromHomeInfiniteCache(queryClient, variables.matchId);
      }

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

      // DB에서 기존 recruitment_setup을 읽어 RPC가 관리하던 current 값 보존
      const { data: matchRow } = await supabase
        .from('matches')
        .select('recruitment_setup')
        .eq('id', matchId)
        .single();

      const existing = matchRow?.recruitment_setup as RecruitmentSetup | null;

      let updatedSetup: RecruitmentSetup;

      if (recruitmentSetup.type === 'ANY') {
        let currentCount: number;
        if (existing?.type === 'ANY') {
          // 같은 모드 → current_count 그대로 보존
          currentCount = existing.current_count ?? 0;
        } else if (existing?.type === 'POSITION' && existing.positions) {
          // 포지션별 → 포지션 무관 전환 → 기존 position current 합산
          currentCount = Object.values(existing.positions).reduce(
            (sum, pos) => sum + (pos?.current || 0),
            0
          );
        } else {
          currentCount = 0;
        }
        updatedSetup = { ...recruitmentSetup, current_count: currentCount };
      } else {
        if (existing?.type === 'POSITION' && existing.positions) {
          // 같은 모드 → 포지션별 current 그대로 보존 (새 포지션엔 0)
          updatedSetup = {
            ...recruitmentSetup,
            positions: Object.fromEntries(
              Object.entries(recruitmentSetup.positions ?? {}).map(([pos, quota]) => [
                pos,
                { ...quota, current: existing.positions![pos]?.current ?? 0 },
              ])
            ),
          };
        } else {
          // 포지션 무관 → 포지션별 전환 → 포지션 미상이므로 0 (불가피)
          updatedSetup = recruitmentSetup;
        }
      }

      const { data, error } = await supabase
        .from('matches')
        .update({ recruitment_setup: updatedSetup as unknown as Json })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
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
 * 2. 경기 상태를 CANCELED로 변경
 * 3. 취소 공지 발송 (실패해도 취소는 유지)
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

      // 2. 경기 상태를 CANCELED로 변경
      const { error: matchError } = await supabase
        .from('matches')
        .update({ status: 'CANCELED' })
        .eq('id', matchId);

      if (matchError) throw matchError;

      // 3. 취소 공지 발송 (실패해도 경기 취소는 유지)
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

      if (announcementError) {
        console.error('Cancel match announcement error:', announcementError);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.matchDetails(),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.applicants(variables.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: matchKeys.listInfinite(),
      });
      removeCanceledMatchFromHomeInfiniteCache(queryClient, variables.matchId);
      toast.success('경기가 취소되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Cancel match flow error:', error);
      toast.error(`경기 취소 실패: ${error.message}`);
    },
  });
}
