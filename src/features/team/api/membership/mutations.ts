/**
 * Team Membership React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMemberKeys, teamKeys } from '../keys';
import { createTeamService, teamMemberRowToEntity } from '@/entities/team';
import { toTeamMembershipDTO } from '../../lib';
import { rollbackSnapshot } from '@/shared/lib/query-cache-rollback';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from '@/shared/lib/optimistic/operation-tracker';
import type { MyTeamListItemDTO, TeamMemberListItemDTO, TeamMembershipDTO } from '../../model/types';
import type { TeamRoleValue } from '@/shared/config/team-constants';

/**
 * 팀 가입 신청
 */
export function useJoinTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-membership'],
    onMutate: async ({ teamId, userId }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-membership', teamId, userId)
      );
      const myMembershipKey = teamMemberKeys.myMembership(teamId, userId);
      const pendingMembersKey = teamMemberKeys.pending(teamId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: myMembershipKey }),
        queryClient.cancelQueries({ queryKey: pendingMembersKey }),
      ]);

      const previousMyMembership = queryClient.getQueryData<TeamMembershipDTO | null>(myMembershipKey);
      const previousPendingMembers = queryClient.getQueryData<TeamMemberListItemDTO[]>(pendingMembersKey);

      const optimisticMembership: TeamMembershipDTO = {
        id: previousMyMembership?.id ?? `optimistic-membership-${teamId}-${userId}`,
        teamId,
        userId,
        role: previousMyMembership?.role ?? 'MEMBER',
        status: 'PENDING',
        joinedAt: previousMyMembership?.joinedAt ?? null,
        user: previousMyMembership?.user,
      };

      queryClient.setQueryData(myMembershipKey, optimisticMembership);

      return {
        optimisticToken,
        myMembershipKey,
        pendingMembersKey,
        previousMyMembership,
        previousPendingMembers,
      };
    },
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.createJoinRequest(teamId, userId);
      return toTeamMembershipDTO(teamMemberRowToEntity(row));
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.myMembershipKey, context.previousMyMembership);
      rollbackSnapshot(queryClient, context.pendingMembersKey, context.previousPendingMembers);
    },
    onSuccess: (data, { teamId, userId }) => {
      // 멤버십 캐시 갱신
      queryClient.setQueryData(
        teamMemberKeys.myMembership(teamId, userId),
        data
      );
    },
    onSettled: (_data, _error, { teamId, userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.pending(teamId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}

/**
 * 가입 신청 승인
 * - 승인 후 진행 중인 경기들에 대해 투표(application) 생성
 */
export function useApproveJoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      teamId,
    }: {
      membershipId: string;
      teamId: string;
    }): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.approveJoinRequest(membershipId);
      const member = toTeamMembershipDTO(teamMemberRowToEntity(row));

      // 새 팀원에게 진행 중인 경기들의 투표 생성
      await service.createVotesForNewMember(teamId, member.userId);

      return member;
    },
    onSuccess: (data, { teamId }) => {
      // 대기자 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.pending(teamId),
      });
      // 팀원 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      // 해당 사용자의 멤버십 갱신
      queryClient.setQueryData(
        teamMemberKeys.myMembership(teamId, data.userId),
        data
      );
    },
  });
}

/**
 * 가입 신청 거절
 */
export function useRejectJoin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
    }: {
      membershipId: string;
      teamId: string;
    }): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.rejectJoinRequest(membershipId);
      return toTeamMembershipDTO(teamMemberRowToEntity(row));
    },
    onSuccess: (_, { teamId }) => {
      // 대기자 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.pending(teamId),
      });
    },
  });
}

/**
 * 팀원 역할 변경
 */
export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      membershipId,
      newRole,
    }: {
      membershipId: string;
      teamId: string;
      newRole: TeamRoleValue;
    }): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateMemberRole(membershipId, newRole);
      return toTeamMembershipDTO(teamMemberRowToEntity(row));
    },
    onSuccess: (data, { teamId }) => {
      // 팀원 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      // 해당 사용자의 멤버십 갱신
      queryClient.setQueryData(
        teamMemberKeys.myMembership(teamId, data.userId),
        data
      );
    },
  });
}

/**
 * 팀원 강퇴
 */
export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-membership'],
    onMutate: async ({ membershipId, teamId, userId }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-membership-user', userId)
      );
      const teamMembersKey = teamMemberKeys.byTeam(teamId);
      const myMembershipKey = teamMemberKeys.myMembership(teamId, userId);
      const myTeamsKey = teamKeys.myTeams(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: teamMembersKey }),
        queryClient.cancelQueries({ queryKey: myMembershipKey }),
        queryClient.cancelQueries({ queryKey: myTeamsKey }),
      ]);

      const previousTeamMembers = queryClient.getQueryData<TeamMemberListItemDTO[]>(teamMembersKey);
      const previousMyMembership = queryClient.getQueryData<TeamMembershipDTO | null>(myMembershipKey);
      const previousMyTeams = queryClient.getQueryData<MyTeamListItemDTO[]>(myTeamsKey);

      queryClient.setQueryData<TeamMemberListItemDTO[]>(teamMembersKey, (old) =>
        old?.filter((member) => member.id !== membershipId)
      );
      queryClient.removeQueries({ queryKey: myMembershipKey, exact: true });
      queryClient.setQueryData<MyTeamListItemDTO[]>(myTeamsKey, (old) =>
        old?.filter((team) => team.id !== teamId)
      );

      return {
        optimisticToken,
        teamMembersKey,
        myMembershipKey,
        myTeamsKey,
        previousTeamMembers,
        previousMyMembership,
        previousMyTeams,
      };
    },
    mutationFn: async ({
      membershipId,
    }: {
      membershipId: string;
      teamId: string;
      userId: string;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.removeMember(membershipId);
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.teamMembersKey, context.previousTeamMembers);
      rollbackSnapshot(queryClient, context.myMembershipKey, context.previousMyMembership);
      rollbackSnapshot(queryClient, context.myTeamsKey, context.previousMyTeams);
    },
    onSuccess: (_, { teamId, userId }) => {
      // 해당 사용자의 멤버십 제거
      queryClient.removeQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
    },
    onSettled: (_data, _error, { teamId, userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.myTeams(userId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}

/**
 * 팀 탈퇴
 */
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-membership'],
    onMutate: async ({ teamId, userId }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-membership-user', userId)
      );
      const teamMembersKey = teamMemberKeys.byTeam(teamId);
      const myMembershipKey = teamMemberKeys.myMembership(teamId, userId);
      const myTeamsKey = teamKeys.myTeams(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: teamMembersKey }),
        queryClient.cancelQueries({ queryKey: myMembershipKey }),
        queryClient.cancelQueries({ queryKey: myTeamsKey }),
      ]);

      const previousTeamMembers = queryClient.getQueryData<TeamMemberListItemDTO[]>(teamMembersKey);
      const previousMyMembership = queryClient.getQueryData<TeamMembershipDTO | null>(myMembershipKey);
      const previousMyTeams = queryClient.getQueryData<MyTeamListItemDTO[]>(myTeamsKey);

      queryClient.setQueryData<TeamMemberListItemDTO[]>(teamMembersKey, (old) =>
        old?.filter((member) => member.userId !== userId)
      );
      queryClient.removeQueries({ queryKey: myMembershipKey, exact: true });
      queryClient.setQueryData<MyTeamListItemDTO[]>(myTeamsKey, (old) =>
        old?.filter((team) => team.id !== teamId)
      );

      return {
        optimisticToken,
        teamMembersKey,
        myMembershipKey,
        myTeamsKey,
        previousTeamMembers,
        previousMyMembership,
        previousMyTeams,
      };
    },
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.leaveTeam(teamId, userId);
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.teamMembersKey, context.previousTeamMembers);
      rollbackSnapshot(queryClient, context.myMembershipKey, context.previousMyMembership);
      rollbackSnapshot(queryClient, context.myTeamsKey, context.previousMyTeams);
    },
    onSuccess: (_, { teamId, userId }) => {
      // 멤버십 제거
      queryClient.removeQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
    },
    onSettled: (_data, _error, { teamId, userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: teamKeys.myTeams(userId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}

/**
 * 가입 신청 승인 (간편 버전 - teamId 고정)
 */
export function useApproveJoinRequest(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.approveJoinRequest(membershipId);
      const member = toTeamMembershipDTO(teamMemberRowToEntity(row));
      await service.createVotesForNewMember(teamId, member.userId);
      return member;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.pending(teamId) });
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.byTeam(teamId) });
    },
  });
}

/**
 * 가입 신청 거절 (간편 버전 - teamId 고정)
 */
export function useRejectJoinRequest(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string): Promise<TeamMembershipDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.rejectJoinRequest(membershipId);
      return toTeamMembershipDTO(teamMemberRowToEntity(row));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamMemberKeys.pending(teamId) });
    },
  });
}

/**
 * 팀장 권한 이전
 */
export function useTransferLeadership() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      currentLeaderId,
      newLeaderId,
    }: {
      teamId: string;
      currentLeaderId: string;
      newLeaderId: string;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.transferLeadership(teamId, currentLeaderId, newLeaderId);
    },
    onSuccess: (_, { teamId, currentLeaderId, newLeaderId }) => {
      // 팀원 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      // 양쪽 멤버십 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.myMembership(teamId, currentLeaderId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.myMembership(teamId, newLeaderId),
      });
    },
  });
}
