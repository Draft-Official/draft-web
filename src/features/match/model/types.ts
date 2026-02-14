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
  MatchTypeValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
  ContactTypeValue,
} from '@/shared/config/constants';
import type { MatchRule } from '@/shared/types/jsonb.types';

// Re-export for convenience
export type { MatchRule };

// ============================================
// DTO Types (NEW - Flat Structure)
// ============================================

/**
 * Match 리스트 아이템 DTO
 * 게스트 매치 목록 화면용 (홈, 검색 등)
 *
 * Flat structure for React performance optimization
 */
export interface MatchListItemDTO {
  // Match entity fields
  matchId: string;
  dateISO: string; // "2026-02-14"
  startTime: string; // "19:00"
  endTime: string; // "21:00"
  matchType: MatchTypeValue;
  matchFormat: MatchFormatValue;
  genderRule: GenderValue;
  status: MatchStatusValue | null;

  // Gym fields (flattened from entities/gym)
  gymId: string;
  gymName: string;
  gymAddress: string;
  gymLatitude: number;
  gymLongitude: number;

  // Host fields (flattened from entities/user)
  hostId: string;
  hostNickname: string | null;
  hostAvatar: string | null;

  // Team fields (flattened from entities/team)
  teamId: string | null;
  teamName: string | null;
  teamLogo: string | null;

  // Computed UI fields
  priceDisplay: string; // "10,000원" | "무료" | "음료수 2병"
  positionsDisplay: string; // "가드 1/3, 포워드 0/2"
  levelDisplay: string | null; // "중수(B) 이상"
  ageDisplay: string | null; // "20대~30대"
  isNew: boolean; // Created within 24 hours
  isClosed: boolean; // status === 'CLOSED'
}

/**
 * Match 상세 페이지 DTO
 * 경기 상세 정보 화면용
 *
 * Extends MatchListItemDTO with additional detail fields
 */
export interface MatchDetailDTO extends MatchListItemDTO {
  // Additional detail fields
  requirements: string[] | null;
  providesBeverage: boolean | null;

  // Recruitment status (computed)
  recruitmentStatus: {
    total: number;
    current: number;
    isFull: boolean;
  };

  // Match rule display (formatted)
  matchRuleDisplay: {
    playStyle: string; // "2파전" | "3파전" | "교류전"
    quarterTime: number;
    quarterCount: number;
    referee: string; // "자체 심판" | "스태프" | "전문 심판"
  } | null;

  // Contact info
  contactType: ContactTypeValue | null;
  contactValue: string | null;
}

// ============================================
// Legacy Types (DEPRECATED - will be removed)
// ============================================

/**
 * @deprecated Flattened into DTO types
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
 * @deprecated Flattened into DTO types (priceDisplay field)
 * 가격 정보
 */
export interface PriceInfo {
  type: CostTypeValue;
  amount: number; // 금액(원) 또는 음료 개수(병)
  providesBeverage?: boolean; // 음료 제공 여부 (뱃지용)
}

/**
 * 모집 상태 (포지션별) - 기존 스타일
 */
export interface PositionStatus {
  open: number;
  closed: number;
}

/**
 * @deprecated Flattened into DTO types (positionsDisplay field)
 * 포지션 상태 (UI용) - 새 스타일
 */
export interface PositionStatusUI {
  status: 'open' | 'closed';
  max: number;
  current: number;
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
  matchType: MatchTypeValue; // 'GUEST_RECRUIT', 'PICKUP_GAME' etc.
  matchFormat: MatchFormatValue; // 'FIVE_ON_FIVE', 'THREE_ON_THREE'
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
  refereeType?: 'SELF' | 'STAFF' | 'PRO';
}

/**
 * @deprecated Flattened into DTO types (positionsDisplay field)
 * 포지션 UI 구조 (리스트 표시용)
 * - all: 포지션 무관 (recruitmentType === 'ANY')
 * - g/f/c: 개별 포지션 (recruitmentType === 'POSITION')
 */
export interface PositionsUI {
  all?: PositionStatusUI;
  g?: PositionStatusUI;
  f?: PositionStatusUI;
  c?: PositionStatusUI;
}

/**
 * 연락처 정보
 */
export interface ContactInfo {
  type: ContactTypeValue;
  value: string; // 전화번호 또는 오픈채팅 URL
}

/**
 * @deprecated Use MatchListItemDTO instead
 * Will be removed after all components migrated
 *
 * Guest 매치 리스트/상세용 Match
 */
export interface GuestListMatch extends BaseMatch {
  teamName: string;
  teamLogo?: string; // 팀 로고 URL (개인 주최 시 undefined)
  isPersonalHost?: boolean; // 개인 주최 여부
  positions: Partial<Record<PositionValue, PositionStatus>>; // max가 0인 포지션은 제외
  recruitmentType?: 'ANY' | 'POSITION'; // 모집 타입 (ANY = 포지션 무관)
  level: string;
  levelMin?: number; // 1-7 (레벨 범위 최소값)
  levelMax?: number; // 1-7 (레벨 범위 최대값)
  gender: GenderValue;
  ageMin?: number;
  ageMax?: number;
  createdAt?: string; // ISO timestamp - NEW 뱃지용
  isClosed?: boolean; // 마감 여부 (status === 'CLOSED')

  // === 팀/호스트 정보 ===
  teamId?: string; // 팀 ID (없으면 개인 주최)
  manualTeamName?: string; // 수동 입력 팀명 (teamId 없을 때)
  hostId?: string; // 호스트 사용자 ID
  contactInfo?: ContactInfo; // 연락처 정보

  // === UI 전용 필드 (mapper에서 생성) ===
  priceDisplay: string; // "10,000원", "무료", "음료수 2병"
  positionsUI: PositionsUI; // UI 친화적 포지션 구조

  // 상세 페이지 전용 필드
  hostNotice?: string; // 호스트 메시지
  hostName?: string; // 호스트 닉네임
  requirements?: string[]; // 준비물 (예: ["INDOOR_SHOES", "WHITE_BLACK_JERSEY"])
  matchOptions?: MatchOptionsUI; // 경기 진행 방식
}

/**
 * @deprecated Use MatchDetailDTO instead
 * Will be removed after all components migrated
 *
 * Match 인터페이스 (상세 페이지 UI용)
 */
export interface MatchDetailUI {
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

  // Guest Detail View Fields
  level?: string; // e.g., "중수 (B) 이상"
  levelMin?: number; // 1-7 (레벨 범위 최소값)
  levelMax?: number; // 1-7 (레벨 범위 최대값)
  matchFormat: MatchFormatValue; // e.g., "FIVE_ON_FIVE"
  ageRange?: string; // e.g., "20대 ~ 30대"

  totalPlayers?: number;
  currentPlayers?: number;

  // Match Rule Details
  rule?: {
    type: PlayStyleValue;
    quarterTime: number;
    quarterCount: number;
    fullGames?: number;
    referee: RefereeTypeValue;
  };

  // 팀/호스트 정보
  hostId?: string; // 호스트 사용자 ID
  hostName?: string;
  hostImage?: string;
  teamId?: string; // 팀 ID (없으면 개인 주최)
  manualTeamName?: string; // 수동 입력 팀명
  teamLogo?: string;
  contactInfo?: ContactInfo; // 연락처 정보

  // 위치 정보
  latitude?: number;
  longitude?: number;

  hostMessage?: string;
  cancelPolicy?: string;
  requirements?: string[];
}
