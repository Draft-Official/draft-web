import type {
  CourtSizeValue,
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';
import { COURT_SIZE_DEFAULT } from '@/shared/config/match-constants';
import type { MatchCreateFormData } from '@/features/match-create/model/form-data.types';
import type {
  MatchCreateContactType,
  MatchCreateSubmitFormValues,
} from '@/features/match-create/model/submit-form.types';
import { convertSelectedAgesToRange } from '@/features/match-create/lib/age-range';
import type { SelectedLocationForSubmit } from './types';

interface BuildPayloadInput {
  form: MatchCreateSubmitFormValues;
  selectedDate: string;
  locationData: SelectedLocationForSubmit;
  feeType: 'cost' | 'beverage';
  isPositionMode: boolean;
  isFlexBigman: boolean;
  positions: {
    guard: number;
    forward: number;
    center: number;
    bigman: number;
  };
  totalCount: number;
  matchFormat: MatchFormatValue;
  gameFormatType: PlayStyleValue | undefined;
  isGameFormatSelected: boolean;
  levelMin: number;
  levelMax: number;
  gender: GenderValue;
  selectedAges: string[];
  isRulesSelected: boolean;
  ruleMinutes: string;
  ruleQuarters: string;
  ruleGames: string;
  refereeType: RefereeTypeValue | undefined;
  isRefereeSelected: boolean;
  parkingCost: string;
  parkingDetail: string;
  hasWater: boolean;
  hasAcHeat: boolean;
  hasShower: boolean;
  courtSize: CourtSizeValue | '';
  hasBall: boolean;
  hasBeverage: boolean;
  opsHost: string;
  normalizedContactType: MatchCreateContactType;
  opsContactContent: string;
}

function calculateEndTime(startTime: string, duration: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const totalMinutes = startHour * 60 + startMin + (parseFloat(duration) * 60);
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMin = totalMinutes % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
}

export function buildMatchCreatePayload({
  form,
  selectedDate,
  locationData,
  feeType,
  isPositionMode,
  isFlexBigman,
  positions,
  totalCount,
  matchFormat,
  gameFormatType,
  isGameFormatSelected,
  levelMin,
  levelMax,
  gender,
  selectedAges,
  isRulesSelected,
  ruleMinutes,
  ruleQuarters,
  ruleGames,
  refereeType,
  isRefereeSelected,
  parkingCost,
  parkingDetail,
  hasWater,
  hasAcHeat,
  hasShower,
  courtSize,
  hasBall,
  hasBeverage,
  opsHost,
  normalizedContactType,
  opsContactContent,
}: BuildPayloadInput): MatchCreateFormData {
  const startTime = form.startTime || '19:00';
  const duration = form.duration || '2';
  const endTime = calculateEndTime(startTime, duration);

  return {
    title: form.title || '농구 경기',
    date: selectedDate,
    startTime,
    endTime,
    location: {
      name: locationData.buildingName || locationData.address,
      address: locationData.address,
      latitude: parseFloat(locationData.y),
      longitude: parseFloat(locationData.x),
      kakaoPlaceId: locationData.kakaoPlaceId,
    },
    recruitment: isPositionMode
      ? {
          type: 'position',
          guard: positions.guard,
          forward: positions.forward,
          center: positions.center,
          bigman: positions.bigman,
          isFlexBigman,
        }
      : {
          type: 'any',
          count: totalCount,
        },
    matchFormat,
    gameFormat: isGameFormatSelected ? gameFormatType : undefined,
    level: levelMin,
    levelMin,
    levelMax,
    gender,
    ageRange: convertSelectedAgesToRange(selectedAges),
    rules: {
      quarterTime: isRulesSelected && ruleMinutes ? Number(ruleMinutes) : undefined,
      quarterCount: isRulesSelected && ruleQuarters ? Number(ruleQuarters) : undefined,
      fullGames: isRulesSelected && ruleGames ? Number(ruleGames) : undefined,
      referee: isRefereeSelected ? refereeType : undefined,
    },
    facilities: {
      parking: parkingCost,
      parkingDetail: parkingDetail || undefined,
      water: hasWater,
      acHeat: hasAcHeat,
      shower: hasShower,
      courtSize: courtSize || COURT_SIZE_DEFAULT,
      ball: hasBall,
      beverage: hasBeverage,
    },
    isFlexBigman: isPositionMode ? isFlexBigman : false,
    requirements: [],
    costInputType: feeType === 'cost' ? 'money' : 'beverage',
    contactType: normalizedContactType,
    contactContent: opsContactContent,
    price: Number(form.fee || 0),
    bank: form.bankName || '',
    accountNumber: form.accountNumber || '',
    accountHolder: form.accountHolder || '예금주',
    refundPolicy: form.refundPolicy || '환불 규정...',
    notice: form.description,
    selectedTeamId: opsHost === 'me' ? null : opsHost,
    manualTeamName: opsHost === 'me' ? (form.manualTeamName || '') : '',
  };
}
