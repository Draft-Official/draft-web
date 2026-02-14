/**
 * Team Info React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService, teamRowToEntity } from '@/entities/team';
import { teamKeys } from '../keys';
import { toMyTeamListItemDTO, toTeamInfoDTO } from '../../lib';
import type { TeamInfoDTO, MyTeamListItemDTO } from '../../model/types';

/**
 * 팀 ID로 팀 정보 조회
 */
export function useTeam(teamId: string | null | undefined) {
  return useQuery({
    queryKey: teamKeys.detail(teamId || ''),
    queryFn: async (): Promise<TeamInfoDTO | null> => {
      if (!teamId) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getTeam(teamId);
      if (!row) return null;
      return toTeamInfoDTO(teamRowToEntity(row));
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
    queryFn: async (): Promise<TeamInfoDTO | null> => {
      if (!code) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getTeamByCode(code);
      if (!row) return null;
      return toTeamInfoDTO(teamRowToEntity(row), {
        homeGymName: row.gyms?.name ?? null,
      });
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
    queryFn: async (): Promise<MyTeamListItemDTO[]> => {
      if (!userId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getMyTeams(userId);
      return rows.map((row) =>
        toMyTeamListItemDTO(teamRowToEntity(row), row.role, {
          homeGymName: row.home_gym_name,
        })
      );
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
