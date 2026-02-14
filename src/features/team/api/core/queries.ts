/**
 * Team Core React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService, teamRowToClient } from '@/entities/team';
import { teamKeys } from '../keys';
import type { ClientTeam, TeamListItem } from '../../model/types';
import type { RegularDayValue } from '@/shared/config/team-constants';

/**
 * 팀 ID로 팀 정보 조회
 */
export function useTeam(teamId: string | null | undefined) {
  return useQuery({
    queryKey: teamKeys.detail(teamId || ''),
    queryFn: async (): Promise<ClientTeam | null> => {
      if (!teamId) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getTeam(teamId);
      return row ? teamRowToClient(row) : null;
    },
    enabled: !!teamId,
  });
}

/**
 * 팀 코드로 팀 정보 조회 (homeGymName 포함)
 */
export function useTeamByCode(code: string | null | undefined) {
  return useQuery({
    queryKey: teamKeys.detailByCode(code || ''),
    queryFn: async (): Promise<(ClientTeam & { homeGymName: string | null }) | null> => {
      if (!code) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getTeamByCode(code);
      if (!row) return null;
      return {
        ...teamRowToClient(row),
        homeGymName: row.gyms?.name ?? null,
      };
    },
    enabled: !!code,
  });
}

/**
 * 현재 사용자가 속한 팀 목록 조회
 */
export function useMyTeams(userId: string | null | undefined) {
  return useQuery({
    queryKey: teamKeys.myTeams(userId || ''),
    queryFn: async (): Promise<TeamListItem[]> => {
      if (!userId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getMyTeams(userId);
      return rows.map((row) => ({
        id: row.id,
        code: row.code || '',
        name: row.name,
        logoUrl: row.logo_url,
        role: row.role,
        regularDay: row.regular_day as RegularDayValue | null,
        regularTime: row.regular_start_time?.slice(0, 5) ?? null,
        homeGymName: row.home_gym_name,
      }));
    },
    enabled: !!userId,
  });
}

/**
 * 팀 코드 중복 체크
 */
export function useCheckTeamCode(code: string | null | undefined) {
  return useQuery({
    queryKey: teamKeys.codeCheck(code || ''),
    queryFn: async (): Promise<boolean> => {
      if (!code || code.length < 3) return false;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      return service.checkTeamCodeExists(code);
    },
    enabled: !!code && code.length >= 3,
    staleTime: 1000 * 10, // 10초 동안 캐시
  });
}
