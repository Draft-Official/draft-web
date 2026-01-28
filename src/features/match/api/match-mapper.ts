import {
  RecruitmentSetup,
  MatchRule,
  OperationInfo,
} from '@/shared/types/database.types';
import {
  GuestListMatch,
  MatchOptionsUI,
} from '@/features/match/model/types';
import type { CostTypeValue, PositionValue, PlayStyleValue, RefereeTypeValue, MatchTypeValue, MatchFormatValue } from '@/shared/config/constants';

// Alias for backward compatibility
type Position = PositionValue;

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
      base: costAmount,
      final: costAmount,
    },

    facilities,

    matchFormat: (row.match_format || 'FIVE_ON_FIVE') as MatchFormatValue, // 경기 방식 ('FIVE_ON_FIVE' 등)
    level: row.level_limit || '',
    gender: (row.gender_rule || 'MIXED') as 'MALE' | 'FEMALE' | 'MIXED',
    courtType: (facilities.court_size_type === 'REGULAR' ? 'indoor' : 'outdoor') as 'indoor' | 'outdoor',

    // 팀/호스트 정보: team_id가 없으면 개인 주최
    teamName: row.team_id
      ? (row.team?.name || row.manual_team_name || '팀')
      : `호스트 ${row.host?.nickname || ''}`,
    teamLogo: row.team_id ? (row.team?.logo_url || undefined) : undefined,
    isPersonalHost: !row.team_id,

    positions,

    // 상세 페이지 전용 필드
    hostNotice: (row.operation_info as OperationInfo)?.notice || undefined,
    hostName: row.host?.nickname || undefined,
    requirements: row.requirements?.length > 0 ? row.requirements : undefined,
    matchOptions: matchOptionsUI,
  };
}
