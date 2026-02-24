import type {
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';
import type { LocationData, MatchCreatePrefillDTO } from '@/features/match-create/model/types';

interface MatchCreatePrefillLocationData {
  locationInfo: LocationData;
  gymName: string;
}

interface MatchCreatePrefillTimeData {
  startTime: string;
  duration: string;
}

interface MatchCreatePrefillPricingData {
  fee: string;
  feeType: 'cost' | 'beverage';
  hasBeverage: boolean;
}

interface MatchCreatePrefillAccountData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

interface MatchCreatePrefillContactData {
  contactType: 'PHONE' | 'KAKAO_OPEN_CHAT';
  phoneNumber: string;
  kakaoLink: string;
}

interface MatchCreatePrefillHostData {
  selectedHost: string;
  manualTeamName: string;
}

interface MatchCreatePrefillRecruitmentData {
  isPositionMode: boolean;
  positions: {
    guard: number;
    forward: number;
    center: number;
    bigman: number;
  };
  isFlexBigman: boolean;
  totalCount: number;
}

interface MatchCreatePrefillSpecsData {
  matchFormat: MatchFormatValue;
  gender: GenderValue;
  level: number;
  levelMin: number;
  levelMax: number;
  ageRange: MatchCreatePrefillDTO['ageRange'];
}

interface MatchCreatePrefillGameFormatData {
  gameFormatType: PlayStyleValue | null;
  ruleMinutes: string;
  ruleQuarters: string;
  ruleGames: string;
  refereeType: RefereeTypeValue | null;
}

export interface MatchCreatePrefillFormData {
  location: MatchCreatePrefillLocationData | null;
  timeInfo: MatchCreatePrefillTimeData | null;
  pricing: MatchCreatePrefillPricingData;
  account: MatchCreatePrefillAccountData;
  contact: MatchCreatePrefillContactData | null;
  host: MatchCreatePrefillHostData;
  notice: string;
  recruitment: MatchCreatePrefillRecruitmentData;
  specs: MatchCreatePrefillSpecsData;
  gameFormat: MatchCreatePrefillGameFormatData | null;
}

function mapLocation(match: MatchCreatePrefillDTO): MatchCreatePrefillLocationData {
  return {
    locationInfo: {
      address: match.gymAddress,
      buildingName: match.gymName,
      placeUrl: '',
      x: String(match.gymLongitude),
      y: String(match.gymLatitude),
      kakaoPlaceId: match.kakaoPlaceId || '',
    },
    gymName: match.gymName,
  };
}

function roundToHalfHour(date: Date): { hour: number; minute: number } {
  const hour = date.getHours();
  const minute = date.getMinutes();
  // Round to nearest 30min
  const rounded = Math.round(minute / 30) * 30;
  if (rounded === 60) {
    return { hour: (hour + 1) % 24, minute: 0 };
  }
  return { hour, minute: rounded };
}

function mapTimeInfo(match: MatchCreatePrefillDTO): MatchCreatePrefillTimeData | null {
  if (!match.startTimeISO || !match.endTimeISO) return null;

  const startDate = new Date(match.startTimeISO);
  const endDate = new Date(match.endTimeISO);

  const { hour, minute } = roundToHalfHour(startDate);
  const startTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = Math.round(durationMs / (1000 * 60 * 30)) / 2; // Round to nearest 0.5h

  return {
    startTime,
    duration: String(durationHours),
  };
}

function mapPricing(match: MatchCreatePrefillDTO): MatchCreatePrefillPricingData {
  return {
    fee: String(match.costAmount || 0),
    feeType: match.costType === 'BEVERAGE' ? 'beverage' : 'cost',
    hasBeverage: match.providesBeverage || false,
  };
}

function mapAccount(match: MatchCreatePrefillDTO): MatchCreatePrefillAccountData {
  return {
    bankName: match.accountInfo?.bank || '',
    accountNumber: match.accountInfo?.number || '',
    accountHolder: match.accountInfo?.holder || '',
  };
}

function mapContact(match: MatchCreatePrefillDTO): MatchCreatePrefillContactData | null {
  const operationInfo = match.operationInfo;
  if (!operationInfo?.type) return null;

  return {
    contactType: operationInfo.type,
    phoneNumber: operationInfo.type === 'PHONE' ? operationInfo.phone || '' : '',
    kakaoLink: operationInfo.type === 'KAKAO_OPEN_CHAT' ? operationInfo.url || '' : '',
  };
}

function mapHost(match: MatchCreatePrefillDTO): MatchCreatePrefillHostData {
  return {
    selectedHost: match.teamId || 'me',
    manualTeamName: match.manualTeamName || '',
  };
}

function mapRecruitment(match: MatchCreatePrefillDTO): MatchCreatePrefillRecruitmentData {
  const recruitment = match.recruitmentSetup;

  if (recruitment?.type === 'POSITION') {
    const positions = recruitment.positions || {};
    return {
      isPositionMode: true,
      positions: {
        guard: positions.G?.max || 0,
        forward: positions.F?.max || 0,
        center: positions.C?.max || 0,
        bigman: positions.B?.max || 0,
      },
      isFlexBigman: (positions.B?.max || 0) > 0,
      totalCount: 1,
    };
  }

  return {
    isPositionMode: false,
    positions: { guard: 0, forward: 0, center: 0, bigman: 0 },
    isFlexBigman: false,
    totalCount: recruitment?.type === 'ANY' ? recruitment.max_count : 1,
  };
}

function mapSpecs(match: MatchCreatePrefillDTO): MatchCreatePrefillSpecsData {
  const levelRange = match.levelRange;
  const levelMin = levelRange?.min ?? 4;
  const levelMax = levelRange?.max ?? 4;

  return {
    matchFormat: match.matchFormat || 'FIVE_ON_FIVE',
    gender: match.genderRule || 'MALE',
    level: levelMin,
    levelMin,
    levelMax,
    ageRange: match.ageRange,
  };
}

function mapGameFormat(match: MatchCreatePrefillDTO): MatchCreatePrefillGameFormatData | null {
  const matchRule = match.matchRule;
  if (!matchRule) return null;

  return {
    gameFormatType: matchRule.play_style || null,
    ruleMinutes: matchRule.quarter_rule ? String(matchRule.quarter_rule.minutes_per_quarter || 8) : '',
    ruleQuarters: matchRule.quarter_rule ? String(matchRule.quarter_rule.quarter_count || 4) : '',
    ruleGames: matchRule.quarter_rule ? String(matchRule.quarter_rule.game_count || 2) : '',
    refereeType: matchRule.referee_type || null,
  };
}

export function toMatchCreatePrefillFormData(match: MatchCreatePrefillDTO): MatchCreatePrefillFormData {
  return {
    location: mapLocation(match),
    timeInfo: mapTimeInfo(match),
    pricing: mapPricing(match),
    account: mapAccount(match),
    contact: mapContact(match),
    host: mapHost(match),
    notice: match.notice || '',
    recruitment: mapRecruitment(match),
    specs: mapSpecs(match),
    gameFormat: mapGameFormat(match),
  };
}
