/**
 * Match Create Query Hooks
 * 경기 생성 관련 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { matchKeys } from '@/entities/match';
import { useAuth } from '@/shared/session';
import { createAuthService } from '@/shared/api/auth-service';
import { createTeamService } from '@/entities/team';
import { createMatchService } from '@/entities/match';
import {
  toMatchCreateBootstrapDTO,
  toMatchCreatePrefillDTO,
  toRecentMatchListItemDTO,
} from './match-create-dto-mapper';
import type {
  MatchCreateBootstrapDTO,
  MatchCreatePrefillDTO,
  RecentMatchListItemDTO,
} from '@/features/match-create/model/types';

/**
 * 내가 주최한 최근 경기 목록 (최대 5개)
 * "최근 경기 불러오기" 기능에서 사용
 * @returns 최근 매치 DTO 목록
 */
export function useMyRecentMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchKeys.byHost(user?.id ?? ''),
    queryFn: async (): Promise<RecentMatchListItemDTO[]> => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          gym:gyms!gym_id (*),
          team:teams!team_id (id, name)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Failed to fetch recent matches:', error);
        throw error;
      }

      return (data ?? []).map(toRecentMatchListItemDTO);
    },
    enabled: !!user?.id,
  });
}

/**
 * 경기 생성 화면 초기 데이터
 * - 현재 사용자
 * - 내 팀 목록
 */
export function useMatchCreateBootstrap() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['match-create', 'bootstrap', user?.id ?? ''],
    queryFn: async (): Promise<MatchCreateBootstrapDTO> => {
      if (!user?.id) {
        return { user: null, teams: [] };
      }

      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      const teamService = createTeamService(supabase);

      const [profile, teams] = await Promise.all([
        authService.getCurrentProfile(),
        teamService.getMyTeams(user.id),
      ]);

      return toMatchCreateBootstrapDTO(profile, teams);
    },
    enabled: !!user?.id,
  });
}

/**
 * 수정 모드 프리필 데이터 조회
 */
export function useMatchEditPrefill(matchId: string | null) {
  return useQuery({
    queryKey: ['match-create', 'edit-prefill', matchId ?? ''],
    queryFn: async (): Promise<MatchCreatePrefillDTO | null> => {
      if (!matchId) return null;

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const data = await matchService.getMatchDetail(matchId);

      if (!data) return null;
      return toMatchCreatePrefillDTO(data);
    },
    enabled: !!matchId,
  });
}
