import {
  MatchInsert,
  GymFacilities,
  MatchOptions,
  RecruitmentSetup,
} from '@/shared/types/database.types';
import {
  GuestListMatch,
  CostType,
  Position,
} from '@/shared/types/match';
import { GymData } from '@/services/gym/gym.service';

import { MatchCreateFormData } from '@/features/match/create/model/schema';

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

function calculateEndTime(startISO: string, endTimeStr: string): string {
   // Use form's endTime directly if available, combined with date?
   // Form has `endTime` string HH:mm.
   // But user might play overnight?
   // The form validation checks start < end in minutes, so it assumes same day.
   // We should use the date from context. 
   // Actually, `toMatchInsertDataV3` takes `form`. `form` has `date` and `endTime`.
   // We can construct ISO from that.
   const dateStr = startISO.split('T')[0]; // Extract date part or use form.date
   // Wait, if we use form.date, we are safe.
   return `${dateStr}T${endTimeStr}:00+09:00`;
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

  const matchOptions: MatchOptions = {
    play_style: form.gameFormat ? gameFormatMap[form.gameFormat] : undefined,
    quarter_rule: {
      minutes_per_quarter: rules.quarterTime || 10,
      quarter_count: rules.quarterCount || 4,
      game_count: rules.fullGames || 1, // field usage?
    },
    guaranteed_quarters: rules.guaranteedQuarters,
    referee_type: rules.referee ? refereeMap[rules.referee] : undefined,
    supplies: undefined, // form doesn't seem to have supplies text field distinct from facilities?
  };

  // F. Team & Host
  const manualTeamName = form.selectedTeamId
    ? '' 
    : (form.manualTeamName || ''); 
    
  // Contact info? 
  // Form doesn't have explicit contact method field in `matchCreateSchema` (I viewed it).
  // It only has `accountHolder`, `accountNumber` etc.
  // Wait, did I miss it? 
  // The schema defines "Admin Info" but no phone/kakao contact field.
  // I will default to KAKAO_OPEN_CHAT and use empty content or notice? 
  // Maybe the form assumes User Profile contact? 
  // I'll set a default "PROFILE" or similar if DB allows? 
  // DB: contact_type 'PHONE' | 'KAKAO_OPEN_CHAT'.
  // I'll default to KAKAO_OPEN_CHAT with empty string if not in form.
  
  // Validating what's in schema: `refundPolicy`, `notice`.
  // `bindName`? No.
  
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

/**
 * 3. Match Row to GuestListMatch (UI Model) Conversion
 * Used by queries to format data for the listing UI
 */
export function matchRowToGuestListMatch(row: any): GuestListMatch {
  const gym = row.gym || {};
  const matchOptions: MatchOptions = row.match_options || {};
  const facilities = gym.facilities || {};
  const recruitmentSetup: RecruitmentSetup = row.recruitment_setup || {
    type: 'ANY',
    max_count: 10,
  };

  // Position logic (V3)
  const positions: Record<Position, { open: number; closed: number }> = {
    G: { open: 0, closed: 0 },
    F: { open: 0, closed: 0 },
    C: { open: 0, closed: 0 },
    B: { open: 0, closed: 0 }, // 빅맨 (F/C 통합)
  };
  
  // Note: GuestListMatch UI types usually only have G, F, C. 
  // If 'B' is not in UI type yet, we might ignore it or we need to update GuestListMatch type later.
  // For now we map standard G, F, C.

  if (recruitmentSetup.type === 'POSITION' && recruitmentSetup.positions) {
    const posData = recruitmentSetup.positions;
    if (posData.G) {
      positions.G = {
        open: posData.G.max - posData.G.current,
        closed: posData.G.current,
      };
    }
    if (posData.F) {
      positions.F = {
        open: posData.F.max - posData.F.current,
        closed: posData.F.current,
      };
    }
    if (posData.C) {
      positions.C = {
        open: posData.C.max - posData.C.current,
        closed: posData.C.current,
      };
    }
    if (posData.B) {
      positions.B = {
        open: posData.B.max - posData.B.current,
        closed: posData.B.current,
      };
    }
  }

  const costTypeMap: Record<string, CostType> = {
    MONEY: CostType.MONEY,
    FREE: CostType.FREE,
    BEVERAGE: CostType.BEVERAGE,
  };

  const genderMap: Record<string, 'men' | 'women' | 'mixed'> = {
    MALE: 'men',
    FEMALE: 'women',
    MIXED: 'mixed',
  };

  return {
    id: row.id,
    title: row.host_notice || row.manual_team_name || 'Match', // V3: title column is gone, use host_notice or team name
    matchType: row.match_type || '5vs5',

    location: {
      name: gym.name || '',
      address: gym.address || '',
      latitude: gym.latitude || 0,
      longitude: gym.longitude || 0,
    },

    dateISO: row.start_time ? row.start_time.split('T')[0] : '',
    startTime: row.start_time
      ? new Date(row.start_time).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '',
    endTime: row.end_time
      ? new Date(row.end_time).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      : '',

    price: {
      type: costTypeMap[row.cost_type] || CostType.MONEY,
      amount: row.cost_amount || 0,
      providesBeverage: row.provides_beverage || false,
      base: row.cost_amount || 0,
      final: row.cost_amount || 0,
    },

    facilities,

    gameFormat: matchOptions.play_style || 'INTERNAL_3WAY', // V3 uses play_style
    level: row.level_limit || '',
    gender: genderMap[row.gender_rule] || 'mixed',
    courtType: (facilities.court_size_type === 'REGULAR' ? 'indoor' : 'outdoor') as 'indoor' | 'outdoor', 
    // ^ Mapping logic adjusted slightly for court_size_type availability

    teamName: row.team?.name || row.manual_team_name || 'DRAFT Team',

    positions,
  };
}

