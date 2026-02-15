import type {
  CourtSizeValue,
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';

export interface MatchCreateLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  kakaoPlaceId: string;
}

export interface PositionRecruitment {
  type: 'position';
  guard: number;
  forward: number;
  center: number;
  bigman: number;
  isFlexBigman: boolean;
}

export interface AnyRecruitment {
  type: 'any';
  count: number;
}

export type MatchCreateRecruitment = PositionRecruitment | AnyRecruitment;

export interface MatchCreateAgeRange {
  min: number;
  max: number | null;
}

export interface MatchCreateRules {
  quarterTime?: number;
  quarterCount?: number;
  fullGames?: number;
  referee?: RefereeTypeValue;
}

export interface MatchCreateFacilities {
  parking?: string;
  parkingDetail?: string;
  water: boolean;
  acHeat: boolean;
  shower: boolean;
  courtSize?: CourtSizeValue;
  ball: boolean;
  beverage: boolean;
}

export interface MatchCreateFormData {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: MatchCreateLocation;
  recruitment: MatchCreateRecruitment;
  level: number | string;
  levelMin?: number;
  levelMax?: number;
  matchFormat: MatchFormatValue;
  ageRange?: MatchCreateAgeRange;
  gender: GenderValue;
  gameFormat?: PlayStyleValue;
  rules?: MatchCreateRules;
  isFlexBigman: boolean;
  requirements: string[];
  facilities?: MatchCreateFacilities;
  costInputType: 'money' | 'beverage';
  fee?: string;
  contactType: 'PHONE' | 'KAKAO_OPEN_CHAT';
  contactContent?: string;
  phoneNumber?: string;
  price: number;
  accountHolder: string;
  accountNumber: string;
  bank: string;
  refundPolicy: string;
  notice?: string;
  selectedTeamId?: string | null;
  manualTeamName?: string;
}
