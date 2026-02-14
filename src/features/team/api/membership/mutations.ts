/**
 * Team Membership React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMemberKeys, teamKeys } from '../keys';
import { createTeamService, teamMemberRowToClient } from '@/entities/team';
import type { ClientTeamMember } from '@/entities/team/model/types';
import type { TeamRoleValue } from '@/shared/config/team-constants';

/**
 * 팀 가입 신청
 */
export function useJoinTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      userId,
    }: {
      teamId: string;
      userId: string;
    }): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.createJoinRequest(teamId, userId);
      return teamMemberRowToClient(row);
    },
    onSuccess: (data, { teamId, userId }) => {
      // 멤버십 캐시 갱신
      queryClient.setQueryData(
        teamMemberKeys.myMembership(teamId, userId),
        data
      );
      // 대기자 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.pending(teamId),
      });
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
    }): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.approveJoinRequest(membershipId);
      const member = teamMemberRowToClient(row);

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
      teamId,
    }: {
      membershipId: string;
      teamId: string;
    }): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.rejectJoinRequest(membershipId);
      return teamMemberRowToClient(row);
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
      teamId,
      newRole,
    }: {
      membershipId: string;
      teamId: string;
      newRole: TeamRoleValue;
    }): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateMemberRole(membershipId, newRole);
      return teamMemberRowToClient(row);
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
    mutationFn: async ({
      membershipId,
      teamId,
      userId,
    }: {
      membershipId: string;
      teamId: string;
      userId: string;
    }): Promise<void> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      await service.removeMember(membershipId);
    },
    onSuccess: (_, { teamId, userId }) => {
      // 팀원 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      // 해당 사용자의 멤버십 제거
      queryClient.removeQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
      // 해당 사용자의 내 팀 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamKeys.myTeams(userId),
      });
    },
  });
}

/**
 * 팀 탈퇴
 */
export function useLeaveTeam() {
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
      await service.leaveTeam(teamId, userId);
    },
    onSuccess: (_, { teamId, userId }) => {
      // 팀원 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMemberKeys.byTeam(teamId),
      });
      // 멤버십 제거
      queryClient.removeQueries({
        queryKey: teamMemberKeys.myMembership(teamId, userId),
      });
      // 내 팀 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamKeys.myTeams(userId),
      });
    },
  });
}

/**
 * 가입 신청 승인 (간편 버전 - teamId 고정)
 */
export function useApproveJoinRequest(teamId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (membershipId: string): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.approveJoinRequest(membershipId);
      const member = teamMemberRowToClient(row);
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
    mutationFn: async (membershipId: string): Promise<ClientTeamMember> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.rejectJoinRequest(membershipId);
      return teamMemberRowToClient(row);
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
