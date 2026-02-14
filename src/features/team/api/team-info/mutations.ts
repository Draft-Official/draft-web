/**
 * Team Info React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService, teamRowToEntity } from '@/entities/team';
import { teamKeys, teamMemberKeys } from '../keys';
import type { CreateTeamInput, UpdateTeamInput, Team } from '../../model/types';

/**
 * 팀 생성
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: CreateTeamInput;
    }): Promise<Team> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const team = await service.createTeam(userId, input);
      return teamRowToEntity(team);
    },
    onSuccess: (data, { userId }) => {
      // 내 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(userId) });
      // 생성된 팀 캐시에 추가
      queryClient.setQueryData(teamKeys.detail(data.id), data);
      if (data.code) {
        queryClient.setQueryData(teamKeys.detailByCode(data.code), data);
      }
    },
  });
}

/**
 * 팀 정보 수정
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      input,
    }: {
      teamId: string;
      input: UpdateTeamInput;
    }): Promise<Team> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateTeam(teamId, input);
      return teamRowToEntity(row);
    },
    onSuccess: (data) => {
      // 팀 상세 캐시 갱신
      queryClient.setQueryData(teamKeys.detail(data.id), data);
      if (data.code) {
        queryClient.setQueryData(teamKeys.detailByCode(data.code), data);
      }
      // 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

/**
 * 팀 삭제
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.deleteTeam(teamId);
    },
    onSuccess: (_, { teamId, userId }) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: teamKeys.detail(teamId) });
      // 내 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(userId) });
      // 팀원 관련 캐시 무효화
      queryClient.removeQueries({ queryKey: teamMemberKeys.byTeam(teamId) });
    },
  });
}
