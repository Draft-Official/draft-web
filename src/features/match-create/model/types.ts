/**
 * Match Create Feature Types
 */
import type { MatchFormatValue, GenderValue, CostTypeValue } from '@/shared/config/match-constants';
import type { TeamRoleValue } from '@/shared/config/team-constants';
import type {
  AccountInfo,
  OperationInfo,
  MatchRule,
  RecruitmentSetup,
  LevelRange,
  AgeRange,
} from '@/shared/types/jsonb.types';

export type { LocationData } from '@/shared/types/location.types';

export interface MatchCreateUserDTO {
  id: string;
  phone: string | null;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
}

export interface MatchCreateTeamOptionDTO {
  id: string;
  name: string;
  role: TeamRoleValue;
  homeGymName: string | null;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
}

export interface MatchCreateBootstrapDTO {
  user: MatchCreateUserDTO | null;
  teams: MatchCreateTeamOptionDTO[];
}

export interface MatchCreateDefaultsSaveDTO {
  userId: string;
  selectedHost: 'me' | string;
  accountInfo: {
    bank: string;
    number: string;
    holder: string;
  };
  contactInfo: {
    type: 'PHONE' | 'KAKAO_OPEN_CHAT';
    content: string;
  };
  hostNotice: string;
}

export interface MatchCreatePrefillDTO {
  matchId: string;
  startTimeISO: string;
  endTimeISO: string;
  teamId: string | null;
  teamName: string | null;
  manualTeamName: string | null;
  gymName: string;
  gymAddress: string;
  gymLatitude: number;
  gymLongitude: number;
  kakaoPlaceId: string | null;
  matchFormat: MatchFormatValue | null;
  genderRule: GenderValue | null;
  costType: CostTypeValue | null;
  costAmount: number | null;
  providesBeverage: boolean;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
  recruitmentSetup: RecruitmentSetup | null;
  levelRange: LevelRange | null;
  ageRange: AgeRange | null;
  matchRule: MatchRule | null;
  notice: string | null;
}

export interface RecentMatchListItemDTO extends MatchCreatePrefillDTO {
  dateLabel: string;
  timeLabel: string;
  priceLabel: string;
  hostLabel: string;
  typeLabel: string;
  gymLabel: string;
  isTeamHost: boolean;
}
