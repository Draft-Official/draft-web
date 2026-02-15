import type { Database } from '@/shared/types/database.types';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import {
  CostType,
  GENDER_VALUES,
  MATCH_FORMAT_VALUES,
} from '@/shared/config/match-constants';
import type {
  CostTypeValue,
  GenderValue,
  MatchFormatValue,
} from '@/shared/config/match-constants';
import type {
  MatchCreateBootstrapDTO,
  MatchCreatePrefillDTO,
  MatchCreateTeamOptionDTO,
  MatchCreateUserDTO,
  RecentMatchListItemDTO,
  LocationData,
} from '../model/types';

type UserRow = Database['public']['Tables']['users']['Row'];
type TeamRow = Database['public']['Tables']['teams']['Row'];
type GymRow = Database['public']['Tables']['gyms']['Row'];
type MatchRow = Database['public']['Tables']['matches']['Row'];

type TeamWithRoleRow = TeamRow & {
  role?: MatchCreateTeamOptionDTO['role'];
  home_gym_name?: string | null;
};

type MatchWithGymTeamRow = MatchRow & {
  gym?: GymRow | null;
  team?: Pick<TeamRow, 'id' | 'name'> | null;
};

const MATCH_FORMAT_SET = new Set<string>(MATCH_FORMAT_VALUES);
const GENDER_SET = new Set<string>(GENDER_VALUES);
const COST_TYPE_SET = new Set<string>(Object.values(CostType));

function toMatchFormatValue(value: string | null): MatchFormatValue | null {
  if (!value || !MATCH_FORMAT_SET.has(value)) return null;
  return value as MatchFormatValue;
}

function toGenderValue(value: string | null): GenderValue | null {
  if (!value || !GENDER_SET.has(value)) return null;
  return value as GenderValue;
}

function toCostTypeValue(value: string | null): CostTypeValue | null {
  if (!value || !COST_TYPE_SET.has(value)) return null;
  return value as CostTypeValue;
}

function formatDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day} (${weekday})`;
}

function formatPriceLabel(amount: number | null, costType: CostTypeValue | null): string {
  if (costType === 'FREE') return '무료';
  if (costType === 'BEVERAGE' && amount) return `음료 ${amount}병`;
  if (!amount) return '무료';
  return `${amount.toLocaleString()}원`;
}

export function toMatchCreateUserDTO(user: UserRow | null): MatchCreateUserDTO | null {
  if (!user) return null;
  return {
    id: user.id,
    phone: user.phone,
    accountInfo: (user.account_info as AccountInfo | null) ?? null,
    operationInfo: (user.operation_info as OperationInfo | null) ?? null,
  };
}

export function toMatchCreateTeamOptionsDTO(teams: TeamWithRoleRow[]): MatchCreateTeamOptionDTO[] {
  return teams.map((team) => ({
    id: team.id,
    name: team.name,
    role: team.role ?? 'MEMBER',
    homeGymName: team.home_gym_name ?? null,
    accountInfo: (team.account_info as AccountInfo | null) ?? null,
    operationInfo: (team.operation_info as OperationInfo | null) ?? null,
  }));
}

export function toMatchCreateBootstrapDTO(user: UserRow | null, teams: TeamWithRoleRow[]): MatchCreateBootstrapDTO {
  return {
    user: toMatchCreateUserDTO(user),
    teams: toMatchCreateTeamOptionsDTO(teams),
  };
}

export function toMatchCreatePrefillDTO(match: MatchWithGymTeamRow): MatchCreatePrefillDTO {
  const operationInfo = (match.operation_info as OperationInfo | null) ?? null;

  return {
    matchId: match.id,
    startTimeISO: match.start_time,
    endTimeISO: match.end_time,
    teamId: match.team_id,
    teamName: match.team?.name ?? null,
    manualTeamName: match.manual_team_name,
    gymName: match.gym?.name ?? '장소 미정',
    gymAddress: match.gym?.address ?? '',
    gymLatitude: match.gym?.latitude ?? 0,
    gymLongitude: match.gym?.longitude ?? 0,
    kakaoPlaceId: match.gym?.kakao_place_id ?? null,
    matchFormat: toMatchFormatValue(match.match_format),
    genderRule: toGenderValue(match.gender_rule),
    costType: toCostTypeValue(match.cost_type),
    costAmount: match.cost_amount,
    providesBeverage: match.provides_beverage ?? false,
    accountInfo: (match.account_info as AccountInfo | null) ?? null,
    operationInfo,
    recruitmentSetup: (match.recruitment_setup as MatchCreatePrefillDTO['recruitmentSetup']) ?? null,
    levelRange: (match.level_range as MatchCreatePrefillDTO['levelRange']) ?? null,
    ageRange: (match.age_range as MatchCreatePrefillDTO['ageRange']) ?? null,
    matchRule: (match.match_rule as MatchCreatePrefillDTO['matchRule']) ?? null,
    notice: operationInfo?.notice ?? null,
  };
}

export function toRecentMatchListItemDTO(match: MatchWithGymTeamRow): RecentMatchListItemDTO {
  const prefill = toMatchCreatePrefillDTO(match);
  const isTeamHost = !!prefill.teamId;
  const hostLabel = isTeamHost ? prefill.teamName || '팀' : '개인';

  return {
    ...prefill,
    dateLabel: formatDateLabel(match.start_time),
    priceLabel: formatPriceLabel(prefill.costAmount, prefill.costType),
    hostLabel,
    gymLabel: prefill.gymName,
    isTeamHost,
  };
}

export function toLocationDataFromPrefill(prefill: MatchCreatePrefillDTO): LocationData {
  return {
    address: prefill.gymAddress,
    buildingName: prefill.gymName,
    x: prefill.gymLongitude ? String(prefill.gymLongitude) : undefined,
    y: prefill.gymLatitude ? String(prefill.gymLatitude) : undefined,
    kakaoPlaceId: prefill.kakaoPlaceId ?? undefined,
  };
}
