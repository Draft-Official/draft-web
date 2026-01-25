/**
 * Match Feature 타입 정의
 *
 * 규칙:
 * - DB 타입은 database.types.ts에서 import
 * - Enum 값/라벨은 constants.ts에서 import
 * - JSONB 타입은 jsonb.types.ts에서 import
 */

import type {
  CostTypeValue,
  GenderValue,
  PositionValue,
  MatchStatusValue,
} from '@/shared/config/constants';
import type { MatchRule } from '@/shared/types/jsonb.types';

// Re-export for convenience
export type { MatchRule };

// ============================================
// Core Interfaces (from shared/types/match.ts)
// ============================================

/**
 * 지리적 위치 정보
 */
export interface Location {
  name: string; // 표시 이름 (예: "강남구민회관")
  address: string; // 리스트용 축약 주소 (예: "서울 강남구")
  fullAddress?: string; // 상세용 전체 주소 (예: "서울 강남구 개포로 220")
  latitude: number;
  longitude: number;
}

/**
 * 가격 정보
 */
export interface PriceInfo {
  type: CostTypeValue;
  amount: number; // 금액(원) 또는 음료 개수(병)
  providesBeverage?: boolean; // 음료 제공 여부 (뱃지용)
  /** @deprecated Use amount instead - 하위 호환성용 */
  base?: number;
  /** @deprecated Use amount instead - 하위 호환성용 */
  final?: number;
}

/**
 * 모집 상태 (포지션별) - 기존 스타일
 */
export interface PositionStatus {
  open: number;
  closed: number;
}

/**
 * 포지션 상태 (UI용) - 새 스타일
 */
export interface PositionStatusUI {
  status: 'open' | 'closed';
  max: number;
}

// ============================================
// Match Types
// ============================================

/**
 * 베이스 Match 인터페이스
 */
export interface BaseMatch {
  id: string;
  title: string;
  matchType: string; // '5vs5', '3vs3'
  location: Location;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: PriceInfo;
  facilities: Record<string, unknown>;
}

/**
 * Host Dashboard용 Match
 */
export interface HostDashboardMatch extends BaseMatch {
  status: MatchStatusValue;
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}

/**
 * 경기 진행 방식 (UI용 - camelCase)
 * DB의 MatchRule (snake_case)을 UI에서 사용하기 위한 타입
 */
export interface MatchOptionsUI {
  playStyle?: 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE' | 'PRACTICE';
  quarterRule?: {
    minutesPerQuarter: number;
    quarterCount: number;
    gameCount: number;
  };
  guaranteedQuarters?: number;
  refereeType?: 'SELF' | 'STAFF' | 'PRO';
}

/**
 * Guest 매치 리스트/상세용 Match
 */
export interface GuestListMatch extends BaseMatch {
  teamName: string;
  teamLogo?: string; // 팀 로고 URL (개인 주최 시 undefined)
  isPersonalHost?: boolean; // 개인 주최 여부
  positions: Partial<Record<PositionValue, PositionStatus>>; // max가 0인 포지션은 제외
  level: string;
  gender: GenderValue;
  gameFormat?: string; // "내부 2게임", "교류전" 등
  courtType?: string;
  ageMin?: number;
  ageMax?: number;

  // 상세 페이지 전용 필드
  hostNotice?: string; // 호스트 메시지
  hostName?: string; // 호스트 닉네임
  requirements?: string[]; // 준비물 (예: ["INDOOR_SHOES", "WHITE_BLACK_JERSEY"])
  matchOptions?: MatchOptionsUI; // 경기 진행 방식
}

/**
 * Match 인터페이스 (상세 페이지 UI용)
 */
export interface Match {
  id: string;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  location: string; // e.g., "강남구민회관" (Display Name)
  address: string; // e.g., "서울 강남구 대치동 123" (Filtering Key)
  price: string; // e.g., "10,000원"
  priceNum: number; // e.g., 10000 (for filtering)
  teamName?: string; // e.g., "팀 슬램덩크"
  positions: {
    all?: PositionStatusUI; // 포지션 무관
    g?: PositionStatusUI; // 가드
    f?: PositionStatusUI; // 포워드
    c?: PositionStatusUI; // 센터
    bigman?: PositionStatusUI; // 빅맨 (F/C)
  };
  isClosed?: boolean;

  // Phase 2 확장성: facilities를 JSONB 스타일로 관리
  facilities?: Record<string, unknown>;

  // Detail Fields
  gender: GenderValue;
  courtType?: 'indoor' | 'outdoor';

  // Guest Detail View Fields
  level?: string; // e.g., "중수 (B) 이상"
  gameFormat: string; // e.g., "5vs5"
  ageRange?: string; // e.g., "20대 ~ 30대"
  totalPlayers?: number;
  currentPlayers?: number;

  // Match Rule Details
  rule?: {
    type: '2team' | '3team' | 'lesson' | 'exchange';
    quarterTime: number;
    quarterCount: number;
    fullGames?: number;
    guaranteedQuarters: number;
    referee: 'self' | 'guest' | 'pro';
  };

  hostName?: string;
  hostImage?: string;
  teamLogo?: string;
  hostMessage?: string;
  cancelPolicy?: string;
  requirements?: string[];
}
