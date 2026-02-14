import {
  RecruitmentSetup,
  MatchRule,
  OperationInfo,
} from '@/shared/types/database.types';
import type { LevelRange } from '@/shared/types/jsonb.types';
import {
  GuestListMatch,
  MatchDetailUI,
  MatchOptionsUI,
  PositionsUI,
  PositionStatusUI,
  ContactInfo,
} from '@/features/match/model/types';
import type { CostTypeValue, PositionValue, PlayStyleValue, RefereeTypeValue, MatchTypeValue, MatchFormatValue, ContactTypeValue } from '@/shared/config/constants';
import { CostType, getLevelLabel } from '@/shared/config/constants';

// Alias for backward compatibility
type Position = PositionValue;

/**
 * 가격 표시 문자열 생성
 */
function formatPriceDisplay(costType: CostTypeValue, amount: number): string {
  if (costType === 'FREE') return '무료';
  if (costType === 'BEVERAGE') return `음료수 ${amount}병`;
  return `${amount.toLocaleString()}원`;
}

/**
 * PositionStatus → PositionStatusUI 변환
 */
function toPositionStatusUI(pos: { open: number; closed: number }): PositionStatusUI {
  return {
    status: pos.open > 0 ? 'open' : 'closed',
    max: pos.open + pos.closed,
    current: pos.closed,
  };
}

/**
 * positions 데이터를 UI 친화적 구조로 변환
 */
function buildPositionsUI(
  positions: Partial<Record<Position, { open: number; closed: number }>>,
  recruitmentType: 'ANY' | 'POSITION'
): PositionsUI {
  if (recruitmentType === 'ANY' && positions.G) {
    // ANY 타입: "포지션 무관"으로 표시
    return {
      all: toPositionStatusUI(positions.G),
    };
  }

  // POSITION 타입: 개별 포지션 표시
  const result: PositionsUI = {};
  if (positions.G) result.g = toPositionStatusUI(positions.G);
  if (positions.F) result.f = toPositionStatusUI(positions.F);
  if (positions.C) result.c = toPositionStatusUI(positions.C);
  return result;
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
 * level_range JSONB를 표시 문자열로 변환
 * @param levelRange - { min: number, max: number } JSONB 데이터
 * @returns "중급1 ~ 상급1" 또는 "중급1 이상"
 */
function formatLevelRange(levelRange: LevelRange | null): string {
  if (!levelRange || !levelRange.min || !levelRange.max) {
    return '';
  }

  const minLabel = getLevelLabel(String(levelRange.min), '');
  const maxLabel = getLevelLabel(String(levelRange.max), '');

  if (levelRange.min === levelRange.max) {
    return `${minLabel} 이상`;
  }
  return `${minLabel} ~ ${maxLabel}`;
}

/**
 * OperationInfo에서 ContactInfo 추출
 */
function buildContactInfo(operationInfo: OperationInfo | undefined): ContactInfo | undefined {
  if (!operationInfo) return undefined;

  const contactType = operationInfo.type as ContactTypeValue;
  if (!contactType) return undefined;

  const value = contactType === 'PHONE' ? operationInfo.phone : operationInfo.url;
  if (!value) return undefined;

  return {
    type: contactType,
    value,
  };
}

/**
 * Match Row to GuestListMatch (UI Model) Conversion
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
    const currentCount = recruitmentSetup.current_count ?? 0;
    positions.G = {
      open: maxCount - currentCount,
      closed: currentCount,
    };
  }

  // 가격 정보 처리 (값 변환 없이 그대로 사용)
  const costType = (row.cost_type || 'MONEY') as CostTypeValue;
  const costAmount = row.cost_amount || 0;

  // match_rule 변환 (DB -> UI)
  const dbMatchRule: MatchRule | undefined = row.match_rule as MatchRule;
  let matchOptionsUI: MatchOptionsUI | undefined;

  if (dbMatchRule) {
    const hasAnyOption =
      dbMatchRule.play_style ||
      dbMatchRule.quarter_rule ||
      dbMatchRule.referee_type;

    if (hasAnyOption) {
      matchOptionsUI = {
        playStyle: dbMatchRule.play_style as PlayStyleValue | undefined,
        quarterRule: dbMatchRule.quarter_rule
          ? {
              minutesPerQuarter: dbMatchRule.quarter_rule.minutes_per_quarter,
              quarterCount: dbMatchRule.quarter_rule.quarter_count,
              gameCount: dbMatchRule.quarter_rule.game_count,
            }
          : undefined,
        refereeType: dbMatchRule.referee_type as RefereeTypeValue | undefined,
      };
    }
  }

  return {
    id: row.id,
    title: gym.name || '', // 체육관 이름을 title로 사용
    // match_type: 경기 목적 ('GUEST_RECRUIT' 등)
    matchType: row.match_type as MatchTypeValue, 

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
      type: costType,
      amount: costAmount,
      providesBeverage: row.provides_beverage || false,
    },

    facilities,

    matchFormat: (row.match_format || 'FIVE_ON_FIVE') as MatchFormatValue, // 경기 방식 ('FIVE_ON_FIVE' 등)
    level: formatLevelRange(row.level_range as LevelRange | null),
    levelMin: (row.level_range as LevelRange | null)?.min,
    levelMax: (row.level_range as LevelRange | null)?.max,
    gender: (row.gender_rule || 'MALE') as 'MALE' | 'FEMALE' | 'MIXED',

    // 팀/호스트 정보: team_id가 없으면 개인 주최
    teamId: row.team_id || undefined,
    manualTeamName: row.manual_team_name || undefined,
    teamName: row.team_id
      ? (row.team?.name || row.manual_team_name || '팀')
      : (row.manual_team_name || ` ${row.host?.nickname || ''}`),
    teamLogo: row.team_id ? (row.team?.logo_url || undefined) : undefined,
    isPersonalHost: !row.team_id,
    hostId: row.host_id || undefined,

    // 연락처 정보 (operation_info에서 추출)
    contactInfo: buildContactInfo(row.operation_info as OperationInfo),

    positions,
    recruitmentType: recruitmentSetup.type as 'ANY' | 'POSITION',

    // === UI 전용 필드 ===
    priceDisplay: formatPriceDisplay(costType, costAmount),
    positionsUI: buildPositionsUI(positions, recruitmentSetup.type as 'ANY' | 'POSITION'),

    // 상세 페이지 전용 필드
    hostNotice: (row.operation_info as OperationInfo)?.notice || undefined,
    hostName: row.host?.nickname || undefined,
    requirements: row.requirements?.length > 0 ? row.requirements : undefined,
    matchOptions: matchOptionsUI,

    // NEW 뱃지용
    createdAt: row.created_at || undefined,

    // 마감 여부 (status가 CLOSED일 때)
    isClosed: row.status === 'CLOSED',
  };
}

/**
 * GuestListMatch -> Match (상세 페이지 UI용) 변환
 * 기존 page.tsx의 adaptToDetailMatch 로직을 mapper로 이동
 */
export function guestListMatchToMatch(data: GuestListMatch): MatchDetailUI {
  const priceAmount = data.price.amount ?? 0;

  const getPriceDisplay = () => {
    if (data.price.type === CostType.FREE) return '무료';
    if (data.price.type === CostType.BEVERAGE) return `음료수 ${priceAmount}병`;
    return `${priceAmount.toLocaleString()}원`;
  };

  const matchOptions = data.matchOptions;

  return {
    id: data.id,
    dateISO: data.dateISO,
    startTime: data.startTime,
    endTime: data.endTime,
    title: data.title,
    location: data.location.name,
    address: data.location.fullAddress || data.location.address,
    price: getPriceDisplay(),
    priceNum: priceAmount,
    gender: data.gender,
    matchFormat: data.matchFormat,
    ageRange: data.ageMin && data.ageMax ? `${data.ageMin}대 ~ ${data.ageMax}대` : undefined,
    level: data.level,
    levelMin: data.levelMin,
    levelMax: data.levelMax,

    // 팀/호스트 정보
    hostId: data.hostId,
    hostName: data.hostName || '호스트',
    hostImage: '',
    teamId: data.teamId,
    manualTeamName: data.manualTeamName,
    teamName: data.teamName,
    teamLogo: data.teamLogo || '',
    contactInfo: data.contactInfo,

    // 위치 정보
    latitude: data.location.latitude,
    longitude: data.location.longitude,

    hostMessage: data.hostNotice,
    cancelPolicy: '시작 24시간 전 환불 불가',
    facilities: {
      ...data.facilities,
      providesBeverage: data.price.providesBeverage,
    },
    requirements: data.requirements,
    isClosed: data.isClosed,
    positions: {
      // 포지션 무관 (recruitmentType === 'ANY')
      all: data.recruitmentType === 'ANY' && data.positions.G
        ? {
            status: data.positions.G.open > 0 ? 'open' : 'closed',
            max: data.positions.G.open + data.positions.G.closed,
            current: data.positions.G.closed,
          }
        : undefined,
      // 개별 포지션 (recruitmentType === 'POSITION')
      g: data.recruitmentType === 'POSITION' && data.positions.G
        ? {
            status: data.positions.G.open > 0 ? 'open' : 'closed',
            max: data.positions.G.open + data.positions.G.closed,
            current: data.positions.G.closed,
          }
        : undefined,
      f: data.positions.F
        ? {
            status: data.positions.F.open > 0 ? 'open' : 'closed',
            max: data.positions.F.open + data.positions.F.closed,
            current: data.positions.F.closed,
          }
        : undefined,
      c: data.positions.C
        ? {
            status: data.positions.C.open > 0 ? 'open' : 'closed',
            max: data.positions.C.open + data.positions.C.closed,
            current: data.positions.C.closed,
          }
        : undefined,
      bigman: data.positions.B
        ? {
            status: data.positions.B.open > 0 ? 'open' : 'closed',
            max: data.positions.B.open + data.positions.B.closed,
            current: data.positions.B.closed,
          }
        : undefined,
    },
    rule: matchOptions
      ? {
          // GuestListMatch.matchOptions uses constants values directly (INTERNAL_2WAY, SELF, etc.)
          // PRACTICE is not in PlayStyleValue, map to INTERNAL_2WAY as fallback
          type: (matchOptions.playStyle === 'PRACTICE' ? 'INTERNAL_2WAY' : matchOptions.playStyle) as PlayStyleValue ?? 'INTERNAL_2WAY',
          quarterTime: matchOptions.quarterRule?.minutesPerQuarter ?? 0,
          quarterCount: matchOptions.quarterRule?.quarterCount ?? 0,
          fullGames: matchOptions.quarterRule?.gameCount ?? 0,
          referee: matchOptions.refereeType ?? 'SELF',
        }
      : undefined,
    currentPlayers: 0,
    totalPlayers: 0,
  };
}
