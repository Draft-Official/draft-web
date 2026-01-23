import {
  MatchInsert,
  GymFacilities,
  MatchOptions,
  RecruitmentSetup,
} from '@/shared/types/database.types';
import { GymData } from '@/shared/api/gym-api';
import { MatchCreateFormData } from '@/features/match-create/model/schema';

// ==============================================
// 1. Gym Data Extraction
// ==============================================
export function extractGymDataV3(form: MatchCreateFormData): GymData {
  const formFacilities = form.facilities;

  // 빈 값이면 필드 자체를 제외 (undefined)
  const facilities: GymFacilities = {};

  // 값이 있을 때만 추가
  if (formFacilities?.ball !== undefined) {
    facilities.ball = formFacilities.ball;
  }
  if (formFacilities?.water !== undefined) {
    facilities.water_purifier = formFacilities.water;
  }
  if (formFacilities?.acHeat !== undefined) {
    facilities.air_conditioner = formFacilities.acHeat;
  }
  if (formFacilities?.shower !== undefined) {
    facilities.shower = formFacilities.shower; // boolean으로 단순화
  }

  // parking 처리: 빈 문자열이 아닐 때만
  if (formFacilities?.parking) {
    facilities.parking = true;
    facilities.parking_fee = formFacilities.parking === '0' ? '무료' : formFacilities.parking;
    if (formFacilities.parkingDetail) {
      facilities.parking_location = formFacilities.parkingDetail;
    }
  }

  // court_size_type 처리: 빈 문자열이 아닐 때만
  if (formFacilities?.courtSize) {
    const sizeMap: Record<string, 'REGULAR' | 'SHORT' | 'NARROW'> = {
      'regular': 'REGULAR',
      'short': 'SHORT',
      'narrow': 'NARROW'
    };
    facilities.court_size_type = sizeMap[formFacilities.courtSize];
  }

  return {
    name: form.location.name,
    address: form.location.address,
    latitude: form.location.latitude,
    longitude: form.location.longitude,
    kakaoPlaceId: form.location.kakaoPlaceId,
    facilities,
  };
}

// ==============================================
// 2. Match Data Transformation
// ==============================================

function toKSTISOString(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00+09:00`;
}

export function toMatchInsertDataV3(
  hostId: string,
  form: MatchCreateFormData,
  gymId: string
): MatchInsert {
  // A. Time
  const startTimeISO = toKSTISOString(form.date, form.startTime);
  const endTimeISO = toKSTISOString(form.date, form.endTime); // Form has explicit endTime

  // C. Cost Logic
  // costInputType으로 현금/음료 구분
  let costType = 'MONEY';
  let costAmount = 0;

  if (form.costInputType === 'beverage') {
    // 음료 내기: N병
    costType = 'BEVERAGE';
    costAmount = form.price; // 병 수
  } else if (form.price === 0) {
    // 현금 무료
    costType = 'FREE';
    costAmount = 0;
  } else {
    // 현금 유료
    costType = 'MONEY';
    costAmount = form.price;
  }

  // D. Recruitment Setup
  let recruitmentSetup: RecruitmentSetup;

  if (form.recruitment.type === 'any') {
    recruitmentSetup = {
      type: 'ANY',
      max_count: form.recruitment.count,
    };
  } else {
    // POSITION
    const { guard, forward, center, bigman = 0 } = form.recruitment;

    // isFlexBigman일 때: F/C를 0으로 하고 bigman 값 사용
    // 아닐 때: F/C 각각 사용, bigman은 0
    const actualForward = form.isFlexBigman ? 0 : forward;
    const actualCenter = form.isFlexBigman ? 0 : center;
    const actualBigman = form.isFlexBigman ? bigman : 0;

    const maxTotal = guard + actualForward + actualCenter + actualBigman;

    recruitmentSetup = {
      type: 'POSITION',
      max_total: maxTotal,
      positions: {
        G: { max: guard, current: 0 },
        F: { max: actualForward, current: 0 },
        C: { max: actualCenter, current: 0 },
        B: { max: actualBigman, current: 0 }, // 빅맨 통합
      },
    };
  }

  // E. Match Options
  // Map GameFormat string -> DB Enum
  const gameFormatMap: Record<string, 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE' | 'PRACTICE'> = {
    internal_2: 'INTERNAL_2WAY',
    internal_3: 'INTERNAL_3WAY',
    exchange: 'EXCHANGE',
    practice: 'PRACTICE',
  };

  const rules = form.rules || {};

  // referee: 'self' | 'member' | 'pro' -> map to DB UPPER CASE if needed?
  // DB Check: referee_type?: 'SELF' | 'STAFF' | 'PRO';
  // Form: 'self', 'member', 'pro'.
  const refereeMap: Record<string, 'SELF' | 'STAFF' | 'PRO'> = {
    self: 'SELF',
    member: 'STAFF', // member -> staff? usually member ref is "staff" or "participating ref"? let's map to STAFF or leave undefined if mismatch.
    pro: 'PRO',
  };

  // 24.01.21 Update: Only populate matchOptions if there is actual data
  let matchOptions: MatchOptions | undefined;

  // Check if quarter rules exist (avoid default 10/4/1 if no input)
  const hasQuarterRules = rules.quarterTime || rules.quarterCount || rules.fullGames;

  // Check if any match option data exists
  const hasMatchOptions = form.gameFormat || hasQuarterRules || rules.guaranteedQuarters || rules.referee;

  if (hasMatchOptions) {
    matchOptions = {
      play_style: form.gameFormat ? gameFormatMap[form.gameFormat] : undefined,
      quarter_rule: hasQuarterRules ? {
        minutes_per_quarter: rules.quarterTime || 8,
        quarter_count: rules.quarterCount || 4,
        game_count: rules.fullGames || 2,
      } : undefined,
      guaranteed_quarters: rules.guaranteedQuarters,
      referee_type: rules.referee ? refereeMap[rules.referee] : undefined,
      supplies: undefined,
    };
  }

  // F. Team & Host
  const manualTeamName = form.selectedTeamId
    ? ''
    : (form.manualTeamName || '');

  return {
    host_id: hostId,
    gym_id: gymId,
    team_id: form.selectedTeamId || null,

    manual_team_name: manualTeamName,

    contact_type: form.contactType || 'KAKAO_OPEN_CHAT',
    contact_content: form.contactContent || '',

    host_notice: form.notice || '',

    start_time: startTimeISO,
    end_time: endTimeISO,

    match_type: form.matchType,     // 5vs5, 3vs3
    gender_rule: form.gender === 'men' ? 'MALE' : form.gender === 'women' ? 'FEMALE' : 'MIXED',
    level_limit: String(form.level),   // number to string

    cost_type: costType,
    cost_amount: costAmount,
    provides_beverage: form.facilities?.beverage || false,

    account_bank: form.bank,
    account_number: form.accountNumber,
    account_holder: form.accountHolder,

    recruitment_setup: recruitmentSetup,
    match_options: matchOptions,

    // 준비물
    requirements: form.requirements || [],

    status: 'RECRUITING',
  };
}
