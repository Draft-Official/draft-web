/**
 * Team Info React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService, teamRowToEntity } from '@/entities/team';
import { gymKeys } from '@/entities/gym';
import { teamKeys, teamMemberKeys } from '../keys';
import { toTeamInfoDTO } from '../../lib';
import { rollbackSnapshot } from '@/shared/lib/query-cache-rollback';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from '@/shared/lib/optimistic/operation-tracker';
import type { CreateTeamInput, UpdateTeamInput, TeamInfoDTO, MyTeamListItemDTO } from '../../model/types';

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
    }): Promise<TeamInfoDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const team = await service.createTeam(userId, input);
      return toTeamInfoDTO(teamRowToEntity(team));
    },
    onSuccess: (data, { userId }) => {
      // 내 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(userId) });
      // 팀 생성 시 홈구장 정보가 반영되었을 수 있으므로 gym 캐시 무효화
      queryClient.invalidateQueries({ queryKey: gymKeys.all });
      if (data.homeGymId) {
        queryClient.invalidateQueries({ queryKey: gymKeys.detail(data.homeGymId) });
      }
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
      previousCode?: string | null;
    }): Promise<TeamInfoDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateTeam(teamId, input);
      return toTeamInfoDTO(teamRowToEntity(row), { homeGymName: row.gyms?.name ?? null });
    },
    onSuccess: (data, { previousCode }) => {
      queryClient.setQueryData(teamKeys.detail(data.id), data);
      if (data.code) {
        queryClient.setQueryData(teamKeys.detailByCode(data.code), data);
      }
      if (previousCode && previousCode !== data.code) {
        queryClient.removeQueries({ queryKey: teamKeys.detailByCode(previousCode), exact: true });
      }
      // 팀 목록 갱신
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      // 팀 수정 시 홈구장 변경/연동 가능성 반영
      queryClient.invalidateQueries({ queryKey: gymKeys.all });
      if (data.homeGymId) {
        queryClient.invalidateQueries({ queryKey: gymKeys.detail(data.homeGymId) });
      }
    },
  });
}

/**
 * 팀 삭제
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-info'],
    onMutate: async ({ teamId, userId, teamCode }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-delete-user', userId)
      );
      const teamDetailKey = teamKeys.detail(teamId);
      const teamMembersKey = teamMemberKeys.byTeam(teamId);
      const myTeamsKey = teamKeys.myTeams(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: teamDetailKey }),
        queryClient.cancelQueries({ queryKey: teamMembersKey }),
        queryClient.cancelQueries({ queryKey: myTeamsKey }),
      ]);

      const previousTeamDetail = queryClient.getQueryData<TeamInfoDTO | null>(teamDetailKey);
      const previousTeamMembers = queryClient.getQueryData(teamMembersKey);
      const previousMyTeams = queryClient.getQueryData<MyTeamListItemDTO[]>(myTeamsKey);

      const resolvedCode = teamCode ?? previousTeamDetail?.code ?? null;
      const detailByCodeKey = resolvedCode
        ? teamKeys.detailByCode(resolvedCode)
        : undefined;
      const previousTeamByCode = detailByCodeKey
        ? queryClient.getQueryData<TeamInfoDTO | null>(detailByCodeKey)
        : undefined;

      queryClient.removeQueries({ queryKey: teamDetailKey, exact: true });
      if (detailByCodeKey) {
        queryClient.removeQueries({ queryKey: detailByCodeKey, exact: true });
      }
      queryClient.removeQueries({ queryKey: teamMembersKey, exact: true });
      queryClient.setQueryData<MyTeamListItemDTO[]>(myTeamsKey, (old) =>
        old?.filter((team) => team.id !== teamId)
      );

      return {
        optimisticToken,
        teamDetailKey,
        detailByCodeKey,
        teamMembersKey,
        myTeamsKey,
        previousTeamDetail,
        previousTeamByCode,
        previousTeamMembers,
        previousMyTeams,
      };
    },
    mutationFn: async ({
      teamId,
    }: {
      teamId: string;
      userId: string;
      teamCode?: string | null;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.deleteTeam(teamId);
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.teamDetailKey, context.previousTeamDetail);
      rollbackSnapshot(queryClient, context.teamMembersKey, context.previousTeamMembers);
      rollbackSnapshot(queryClient, context.myTeamsKey, context.previousMyTeams);

      if (context.detailByCodeKey) {
        rollbackSnapshot(queryClient, context.detailByCodeKey, context.previousTeamByCode);
      }
    },
    onSuccess: (_, { teamId }, context) => {
      // 캐시에서 제거
      queryClient.removeQueries({ queryKey: teamKeys.detail(teamId) });
      if (context?.detailByCodeKey) {
        queryClient.removeQueries({ queryKey: context.detailByCodeKey, exact: true });
      }
      // 팀원 관련 캐시 무효화
      queryClient.removeQueries({ queryKey: teamMemberKeys.byTeam(teamId) });
    },
    onSettled: (_data, _error, { teamId, userId }, context) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.myTeams(userId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(teamId) });
      if (context?.detailByCodeKey) {
        queryClient.invalidateQueries({ queryKey: context.detailByCodeKey, exact: true });
      }
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.byTeam(teamId) });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}
