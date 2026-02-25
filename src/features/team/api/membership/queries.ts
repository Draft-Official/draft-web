/**
 * Team Membership React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import {
  createTeamService,
  teamMemberRowToEntity,
  type TeamMemberWithUserRow,
} from '@/entities/team';
import { teamMemberKeys } from '../keys';
import { toTeamMembershipDTO } from '../../lib';
import type { TeamMemberListItemDTO, TeamMembershipDTO } from '../../model/types';

type UserMetadataInput = {
  height?: unknown;
  weight?: unknown;
} | null;

function toNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function mapTeamMemberWithUserRow(row: TeamMemberWithUserRow): TeamMemberListItemDTO {
  const metadata = (row.users?.metadata ?? null) as UserMetadataInput;
  const member = teamMemberRowToEntity(row);
  const user = row.users
    ? {
        id: row.users.id,
        nickname: row.users.nickname,
        avatarUrl: row.users.avatar_url,
        positions: row.users.positions,
        height: toNullableNumber(metadata?.height),
        weight: toNullableNumber(metadata?.weight),
      }
    : undefined;

  return toTeamMembershipDTO(member, user);
}

/**
 * 팀원 목록 조회 (활성 팀원만)
 */
export function useTeamMembers(teamId: string | null | undefined) {
  return useQuery({
    queryKey: teamMemberKeys.byTeam(teamId || ''),
    queryFn: async (): Promise<TeamMemberListItemDTO[]> => {
      if (!teamId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getTeamMembers(teamId);
      return rows.map(mapTeamMemberWithUserRow);
    },
    enabled: !!teamId,
  });
}

/**
 * 가입 대기자 목록 조회
 */
export function usePendingMembers(teamId: string | null | undefined) {
  return useQuery({
    queryKey: teamMemberKeys.pending(teamId || ''),
    queryFn: async (): Promise<TeamMemberListItemDTO[]> => {
      if (!teamId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getPendingMembers(teamId);
      return rows.map(mapTeamMemberWithUserRow);
    },
    enabled: !!teamId,
  });
}

/**
 * 현재 사용자의 특정 팀 멤버십 조회
 */
export function useMyMembership(
  teamId: string | null | undefined,
  userId: string | null | undefined
) {
  return useQuery({
    queryKey: teamMemberKeys.myMembership(teamId || '', userId || ''),
    queryFn: async (): Promise<TeamMembershipDTO | null> => {
      if (!teamId || !userId) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getMembership(teamId, userId);
      return row ? toTeamMembershipDTO(teamMemberRowToEntity(row)) : null;
    },
    enabled: !!teamId && !!userId,
  });
}

/**
 * 팀원 수 조회
 */
export function useTeamMemberCount(teamId: string | null | undefined) {
  return useQuery({
    queryKey: [...teamMemberKeys.byTeam(teamId || ''), 'count'],
    queryFn: async (): Promise<number> => {
      if (!teamId) return 0;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      return service.getTeamMemberCount(teamId);
    },
    enabled: !!teamId,
  });
}
