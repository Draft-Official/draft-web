/**
 * Team Membership React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMemberKeys, teamKeys } from '../keys';
import {
  createJoinRequest,
  approveJoinRequest,
  rejectJoinRequest,
  updateMemberRole,
  removeMember,
  leaveTeam,
  transferLeadership,
} from './api';
import { teamMemberRowToClient } from '../mapper';
import type { ClientTeamMember } from '../../model/types';
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
      const row = await createJoinRequest(supabase, teamId, userId);
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
      const row = await approveJoinRequest(supabase, membershipId);
      return teamMemberRowToClient(row);
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
      const row = await rejectJoinRequest(supabase, membershipId);
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
      const row = await updateMemberRole(supabase, membershipId, newRole);
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
      await removeMember(supabase, membershipId);
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
      await leaveTeam(supabase, teamId, userId);
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
      await transferLeadership(supabase, teamId, currentLeaderId, newLeaderId);
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
