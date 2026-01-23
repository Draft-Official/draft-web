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
  MatchOptionsUI,
} from '@/shared/types/match';
import { GymData } from '@/shared/api/gym-api';

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
 * 주소에서 시/구까지만 추출
 * 예: "서울 강남구 개포로 220" -> "서울 강남구"
 * 예: "서울특별시 강남구 역삼동 123-4" -> "서울시 강남구"
 */
function extractCityDistrict(address: string): string {
  if (!address) return '';

  const parts = address.split(' ');
  const result: string[] = [];

  for (const part of parts) {
    // 시/도 처리 (특별시, 광역시 등 -> 시로 축약)
    if (part.endsWith('특별시') || part.endsWith('광역시')) {
      result.push(part.replace('특별시', '시').replace('광역시', '시'));
    } else if (part.endsWith('도')) {
      result.push(part);
    } else if (part.endsWith('시') || part.endsWith('군')) {
      result.push(part);
    } else if (part.endsWith('구')) {
      result.push(part);
      break; // 구까지만 추출
    } else if (part === '서울' || part === '부산' || part === '대구' || part === '인천' ||
               part === '광주' || part === '대전' || part === '울산' || part === '세종') {
      // 축약형 도시명 처리
      result.push(part);
    }
  }

  return result.join(' ');
}

/**
 * 3. Match Row to GuestListMatch (UI Model) Conversion
 * Used by queries to format data for the listing UI
 */
export function matchRowToGuestListMatch(row: any): GuestListMatch {
  const gym = row.gym || {};
  const facilities = gym.facilities || {};
  const recruitmentSetup: RecruitmentSetup = row.recruitment_setup || {
    type: 'ANY',
    max_count: 10,
  };

  // Position logic (V3) - max가 0보다 큰 포지션만 포함
  const positions: Partial<Record<Position, { open: number; closed: number }>> = {};

  if (recruitmentSetup.type === 'POSITION' && recruitmentSetup.positions) {
    const posData = recruitmentSetup.positions;
    if (posData.G && posData.G.max > 0) {
      positions.G = {
        open: posData.G.max - posData.G.current,
        closed: posData.G.current,
      };
    }
    if (posData.F && posData.F.max > 0) {
      positions.F = {
        open: posData.F.max - posData.F.current,
        closed: posData.F.current,
      };
    }
    if (posData.C && posData.C.max > 0) {
      positions.C = {
        open: posData.C.max - posData.C.current,
        closed: posData.C.current,
      };
    }
    if (posData.B && posData.B.max > 0) {
      positions.B = {
        open: posData.B.max - posData.B.current,
        closed: posData.B.current,
      };
    }
  } else if (recruitmentSetup.type === 'ANY') {
    // ANY 타입: 전체 인원 표시
    const maxCount = recruitmentSetup.max_count || 0;
    const currentCount = row.current_players_count || 0;
    positions.G = {
      open: maxCount - currentCount,
      closed: currentCount,
    };
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

  // 가격 정보 처리
  const costType = row.cost_type || 'MONEY';
  const costAmount = row.cost_amount || 0;

  // match_options 변환 (DB -> UI)
  const dbMatchOptions: MatchOptions | undefined = row.match_options;
  let matchOptionsUI: MatchOptionsUI | undefined;

  if (dbMatchOptions) {
    const hasAnyOption =
      dbMatchOptions.play_style ||
      dbMatchOptions.quarter_rule ||
      (dbMatchOptions.guaranteed_quarters && dbMatchOptions.guaranteed_quarters > 0) ||
      dbMatchOptions.referee_type;

    if (hasAnyOption) {
      matchOptionsUI = {
        playStyle: dbMatchOptions.play_style,
        quarterRule: dbMatchOptions.quarter_rule
          ? {
              minutesPerQuarter: dbMatchOptions.quarter_rule.minutes_per_quarter,
              quarterCount: dbMatchOptions.quarter_rule.quarter_count,
              gameCount: dbMatchOptions.quarter_rule.game_count,
            }
          : undefined,
        guaranteedQuarters:
          dbMatchOptions.guaranteed_quarters && dbMatchOptions.guaranteed_quarters > 0
            ? dbMatchOptions.guaranteed_quarters
            : undefined,
        refereeType: dbMatchOptions.referee_type,
      };
    }
  }

  return {
    id: row.id,
    title: gym.name || '', // 체육관 이름을 title로 사용
    matchType: row.match_type || '5vs5',

    location: {
      name: gym.name || '',
      address: extractCityDistrict(gym.address || ''), // 리스트용: 시/구까지만 표시
      fullAddress: gym.address || '', // 상세용: 전체 주소
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
      type: costTypeMap[costType] || CostType.MONEY,
      amount: costAmount,
      providesBeverage: row.provides_beverage || false,
      base: costAmount,
      final: costAmount,
    },

    facilities,

    gameFormat: row.match_type || '5vs5', // match_type 사용 (5vs5, 3vs3)
    level: row.level_limit || '',
    gender: genderMap[row.gender_rule] || 'mixed',
    courtType: (facilities.court_size_type === 'REGULAR' ? 'indoor' : 'outdoor') as 'indoor' | 'outdoor',

    // 팀/호스트 정보: team_id가 없으면 개인 주최
    teamName: row.team_id
      ? (row.team?.name || row.manual_team_name || '팀')
      : `호스트 ${row.host?.nickname || ''}`,
    teamLogo: row.team_id ? (row.team?.logo_url || undefined) : undefined,
    isPersonalHost: !row.team_id,

    positions,

    // 상세 페이지 전용 필드
    hostNotice: row.host_notice || undefined,
    hostName: row.host?.nickname || undefined,
    requirements: row.requirements?.length > 0 ? row.requirements : undefined,
    matchOptions: matchOptionsUI,
  };
}

