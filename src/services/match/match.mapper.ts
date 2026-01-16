import { MatchCreateFormData, FacilitiesFormData } from '@/features/match/create/model/schema';
import {
  GuestListMatch,
  CostType,
  Position,
} from '@/shared/types/match';
import {
  MatchInsert,
  RecruitmentSetup,
  MatchOptions,
  GymFacilities,
} from '@/shared/types/database.types';

/**
 * Frontend Form -> Match Insert Data (새 스키마 v2)
 */
export function toMatchInsertData(
  hostId: string,
  form: MatchCreateFormData,
  gymId: string
): MatchInsert {
  const {
    title,
    date,
    startTime,
    endTime,
    recruitment,
    level,
    gender,
    gameFormat,
    matchType,
    price,
    bank,
    accountNumber,
    accountHolder,
    notice,
  } = form;

  // Combine date and time
  const startDateTime = new Date(`${date}T${startTime}:00`).toISOString();
  const endDateTime = new Date(`${date}T${endTime}:00`).toISOString();

  // Gender mapping (form: 'men'/'women'/'mixed' → DB: 'MALE'/'FEMALE'/'MIXED')
  const genderRuleMap: Record<string, string> = {
    men: 'MALE',
    women: 'FEMALE',
    mixed: 'MIXED',
  };

  // recruitment_setup JSONB 생성
  const recruitmentSetup: RecruitmentSetup =
    recruitment.type === 'position'
      ? {
          type: 'POSITION',
          max_total:
            recruitment.guard + recruitment.forward + recruitment.center,
          positions: {
            G: { max: recruitment.guard, current: 0 },
            F: { max: recruitment.forward, current: 0 },
            C: { max: recruitment.center, current: 0 },
          },
        }
      : {
          type: 'ANY',
          max_count: recruitment.count,
        };

  // match_options JSONB 생성 (rules 정보 포함)
  const formRules = form.rules || {};
  const matchOptions: MatchOptions = {
    game_format: gameFormat as MatchOptions['game_format'],
    quarter_time: formRules.quarterTime,
    quarter_count: formRules.quarterCount,
    referee: formRules.referee as MatchOptions['referee'],
  };

  // 참가비 타입 결정
  // 현재 폼은 price만 있으므로, 0이면 FREE, 아니면 MONEY
  const costType = price === 0 ? 'FREE' : 'MONEY';

  return {
    host_id: hostId,
    gym_id: gymId,
    team_id: null, // 추후 팀 기능 구현 시 사용
    title,
    description: notice || '',

    // Time
    start_time: startDateTime,
    end_time: endDateTime,

    // Specs
    match_type: matchType, // '5vs5', '3vs3'
    gender_rule: genderRuleMap[gender] || 'MIXED',
    level_limit: String(level),

    // Cost (새 스키마)
    cost_type: costType,
    cost_amount: price,
    provides_beverage: false, // 폼에서 추가 필요 시 확장

    // Account
    account_bank: bank || null,
    account_number: accountNumber || null,
    account_holder: accountHolder || null,

    // Recruitment (JSONB)
    recruitment_setup: recruitmentSetup,

    // Options (JSONB)
    match_options: matchOptions,

    status: 'RECRUITING',
  };
}

/**
 * Form에서 Gym 데이터 추출
 * findOrCreateGym에 전달할 데이터 형식으로 변환
 */
export function extractGymData(form: MatchCreateFormData): {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  kakaoPlaceId?: string;
  facilities: GymFacilities;
} {
  const formFacilities: FacilitiesFormData | undefined = form.facilities;

  return {
    name: form.location.name,
    address: form.location.address,
    latitude: form.location.latitude,
    longitude: form.location.longitude,
    kakaoPlaceId: form.location.kakaoPlaceId,
    facilities: {
      parking: formFacilities?.parking !== '' && formFacilities?.parking !== undefined,
      water: formFacilities?.water,
      ac_heat: formFacilities?.acHeat,
      shower: formFacilities?.shower !== 'none',
      ball: formFacilities?.ball,
      indoor: formFacilities?.courtSize === 'regular',
    },
  };
}

/**
 * Database Row -> GuestListMatch (UI Model)
 * 새 스키마 v2: recruitment_setup JSONB 사용
 */
export function matchRowToGuestListMatch(row: any): GuestListMatch {
  // gym은 JOIN 결과로 포함됨
  const gym = row.gym || {};
  const matchOptions = row.match_options || {};
  const facilities = gym.facilities || {};
  const recruitmentSetup: RecruitmentSetup = row.recruitment_setup || {
    type: 'ANY',
    max_count: 10,
  };

  // positions 계산 (recruitment_setup에서)
  const positions: Record<Position, { open: number; closed: number }> = {
    G: { open: 0, closed: 0 },
    F: { open: 0, closed: 0 },
    C: { open: 0, closed: 0 },
  };

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
  }

  // cost_type -> CostType enum 매핑
  const costTypeMap: Record<string, CostType> = {
    MONEY: CostType.MONEY,
    FREE: CostType.FREE,
    BEVERAGE: CostType.BEVERAGE,
  };

  // gender_rule -> GenderRule 매핑 (UI는 소문자 사용)
  const genderMap: Record<string, 'men' | 'women' | 'mixed'> = {
    MALE: 'men',
    FEMALE: 'women',
    MIXED: 'mixed',
  };

  return {
    id: row.id,
    title: row.title,
    matchType: row.match_type || '5vs5',

    // Location은 gym에서 가져옴
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

    // 새 스키마 가격 구조
    price: {
      type: costTypeMap[row.cost_type] || CostType.MONEY,
      amount: row.cost_amount || 0,
      providesBeverage: row.provides_beverage || false,
      // 하위 호환성
      base: row.cost_amount || 0,
      final: row.cost_amount || 0,
    },

    // Facilities는 gym에서 가져옴
    facilities,

    // Specs
    gameFormat: matchOptions.game_format,
    level: row.level_limit || '',
    gender: genderMap[row.gender_rule] || 'mixed',
    courtType: (facilities.indoor ? 'indoor' : 'outdoor') as 'indoor' | 'outdoor',

    // Team name은 team JOIN 결과에서 가져옴 (있으면)
    teamName: row.team?.name || 'DRAFT Team',

    // Positions
    positions,
  };
}
