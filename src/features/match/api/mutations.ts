/**
 * Match Mutation Hooks
 * 매치 생성/수정/삭제용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createMatchService, matchCreateFormToInsert } from '@/services/match';
import { matchKeys } from './keys';

interface CreateMatchInput {
  title: string;
  location: { name: string; address: string };
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  recruitment: {
    type: 'position' | 'any';
    guard?: number;
    forward?: number;
    center?: number;
    total?: number;
  };
  notice?: string;
  hostId: string;
}

/**
 * 매치 생성
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      // Form Data -> DB Insert 변환
      const insertData = matchCreateFormToInsert(input, input.hostId);
      return matchService.createMatch(insertData);
    },
    onSuccess: (data) => {
      // 캐시 무효화
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.byHost(data.host_id) });
      toast.success('경기가 생성되었습니다');
    },
  });
}

/**
 * 매치 상태 업데이트
 */
export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, status }: { matchId: string; status: string }) => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      return matchService.updateMatchStatus(matchId, status);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.byHost(data.host_id) });
      toast.success('경기 상태가 변경되었습니다');
    },
  });
}

/**
 * 매치 삭제
 */
export function useDeleteMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, hostId }: { matchId: string; hostId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      await matchService.deleteMatch(matchId);
      return { matchId, hostId };
    },
    onSuccess: ({ matchId, hostId }) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.byHost(hostId) });
      queryClient.removeQueries({ queryKey: matchKeys.detail(matchId) });
      toast.success('경기가 삭제되었습니다');
    },
  });
}
