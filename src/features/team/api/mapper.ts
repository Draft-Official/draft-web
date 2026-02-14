/**
 * Team Mapper
 * DB row를 entity 타입으로 변환
 */

import type { Team as TeamRow, TeamMember as TeamMemberRow, TeamFee as TeamFeeRow } from '@/shared/types/database.types';
import type { AccountInfo, OperationInfo, LevelRange, AgeRange } from '@/shared/types/jsonb.types';
import type {
  TeamRoleValue,
  TeamMemberStatusValue,
  RegularDayValue,
} from '@/shared/config/team-constants';
import type { Team as TeamEntity, TeamMember as TeamMemberEntity, TeamFee as TeamFeeEntity } from '../model/types';

/**
 * Team DB row를 entity 타입으로 변환
 */
export function teamRowToEntity(row: TeamRow): TeamEntity {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    shortIntro: row.short_intro,
    description: row.description,
    logoUrl: row.logo_url,
    regionDepth1: row.region_depth1,
    regionDepth2: row.region_depth2,
    homeGymId: row.home_gym_id,
    regularDay: row.regular_day as RegularDayValue | null,
    regularStartTime: row.regular_start_time ?? null,
    regularEndTime: row.regular_end_time ?? null,
    teamGender: row.team_gender,
    levelRange: (row.level_range as unknown as LevelRange) || null,
    ageRange: (row.age_range as unknown as AgeRange) || null,
    isRecruiting: row.is_recruiting ?? false,
    accountInfo: (row.account_info as unknown as AccountInfo) || null,
    operationInfo: (row.operation_info as unknown as OperationInfo) || null,
    createdAt: row.created_at,
  };
}

/**
 * TeamMember DB row를 entity 타입으로 변환
 */
export function teamMemberRowToEntity(
  row: TeamMemberRow & { users?: { id: string; nickname: string | null; avatar_url: string | null; positions: string[] | null } | null }
): TeamMemberEntity {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    role: (row.role as TeamRoleValue) || 'MEMBER',
    status: (row.status as TeamMemberStatusValue) || 'PENDING',
    joinedAt: row.joined_at,
    user: row.users
      ? {
          id: row.users.id,
          nickname: row.users.nickname,
          avatarUrl: row.users.avatar_url,
          positions: row.users.positions,
        }
      : undefined,
  };
}

/**
 * TeamFee DB row를 entity 타입으로 변환
 */
export function teamFeeRowToEntity(
  row: TeamFeeRow & { users?: { id: string; nickname: string | null; avatar_url: string | null } | null }
): TeamFeeEntity {
  return {
    id: row.id,
    teamId: row.team_id,
    userId: row.user_id,
    yearMonth: row.year_month,
    isPaid: row.is_paid,
    paidAt: row.paid_at,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    user: row.users
      ? {
          id: row.users.id,
          nickname: row.users.nickname,
          avatarUrl: row.users.avatar_url,
        }
      : undefined,
  };
}

/**
 * 지역 정보를 문자열로 변환
 */
export function formatRegion(regionDepth1: string | null, regionDepth2: string | null): string | null {
  if (!regionDepth1) return null;
  return regionDepth2 ? `${regionDepth1} ${regionDepth2}` : regionDepth1;
}

/**
 * 정기 운동 시간을 문자열로 변환
 */
export function formatRegularSchedule(
  regularDay: string | null,
  regularStartTime: string | null,
  regularEndTime?: string | null
): string | null {
  if (!regularDay) return null;

  const dayLabels: Record<string, string> = {
    MON: '월',
    TUE: '화',
    WED: '수',
    THU: '목',
    FRI: '금',
    SAT: '토',
    SUN: '일',
  };

  const day = dayLabels[regularDay] || regularDay;

  // 시작~종료 시간 포맷
  let timeStr = '';
  if (regularStartTime) {
    const start = regularStartTime.slice(0, 5);
    if (regularEndTime) {
      const end = regularEndTime.slice(0, 5);
      timeStr = ` ${start} ~ ${end}`;
    } else {
      timeStr = ` ${start}`;
    }
  }

  return `${day}요일${timeStr}`;
}
