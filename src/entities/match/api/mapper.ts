/**
 * Match Mapper
 * DB row를 entity 타입으로 변환
 */

import type { Match as MatchRow } from '@/shared/types/database.types';
import type {
  MatchTypeValue,
  MatchFormatValue,
  CostTypeValue,
  GenderValue,
  MatchStatusValue,
} from '@/shared/config/match-constants';
import type {
  LevelRange,
  AgeRange,
  RecruitmentSetup,
  MatchRule,
  AccountInfo,
  OperationInfo,
} from '@/shared/types/jsonb.types';
import type { Match as MatchEntity } from '../model/types';

/**
 * Match DB row를 entity 타입으로 변환
 */
export function matchRowToEntity(row: MatchRow): MatchEntity {
  return {
    id: row.id,
    shortId: row.short_id,
    hostId: row.host_id,
    teamId: row.team_id,
    gymId: row.gym_id,
    startTime: row.start_time,
    endTime: row.end_time,
    matchType: row.match_type as MatchTypeValue,
    matchFormat: row.match_format as MatchFormatValue,
    costType: row.cost_type as CostTypeValue,
    costAmount: row.cost_amount,
    genderRule: row.gender_rule as GenderValue,
    manualTeamName: row.manual_team_name,
    status: row.status as MatchStatusValue | null,
    levelRange: (row.level_range as unknown as LevelRange) ?? null,
    ageRange: (row.age_range as unknown as AgeRange) ?? null,
    recruitmentSetup: row.recruitment_setup as unknown as RecruitmentSetup,
    confirmedParticipantCount: row.confirmed_participant_count ?? 0,
    matchRule: (row.match_rule as unknown as MatchRule) ?? null,
    accountInfo: (row.account_info as unknown as AccountInfo) ?? null,
    operationInfo: (row.operation_info as unknown as OperationInfo) ?? null,
    requirements: row.requirements,
    providesBeverage: row.provides_beverage,
    createdAt: row.created_at,
  };
}
