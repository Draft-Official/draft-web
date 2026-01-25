/**
 * 공통 Match 타입 정의 (Schema v2)
 *
 * 설계 원칙:
 * 1. 유연한 매치 속성: facilities를 JSONB 스타일로 관리
 * 2. 가격 구조: cost_type + cost_amount 모델
 * 3. 지리적 위치: latitude, longitude 필수 포함
 * 4. 매치 타입: Enum으로 관리하여 쉽게 확장 가능
 */

// ============================================
// Enums
// ============================================

export enum MatchType {
  GUEST_RECRUIT = 'GUEST_RECRUIT', // MVP
  PICKUP_GAME = 'PICKUP_GAME', // MVP
  TUTORIAL = 'TUTORIAL', // Phase 2
  LESSON = 'LESSON', // Phase 2
  TOURNAMENT = 'TOURNAMENT', // Future
}

export enum MatchStatus {
  RECRUITING = 'RECRUITING',
  CLOSING_SOON = 'CLOSING_SOON',
  CLOSED = 'CLOSED',
  FINISHED = 'FINISHED',
  CANCELED = 'CANCELED',
}

export enum ApplicantStatus {
  PENDING = 'PENDING',
  CHECKING = 'CHECKING', // 하위 호환성
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELED = 'CANCELED',
  // 하위 호환성 (소문자)
  pending = 'pending',
  checking = 'checking',
  confirmed = 'confirmed',
  rejected = 'rejected',
}

// ============================================
// Re-export from constants (Single Source of Truth)
// ============================================
import {
  CostType as CostTypeConst,
  type CostTypeValue,
  type GenderValue,
  type PositionValue,
  type RecruitmentTypeValue,
} from '@/shared/config/match-constants';

// Re-export with original names for compatibility
export const CostType = CostTypeConst;
export type { CostTypeValue, RecruitmentTypeValue };
export type GenderRule = GenderValue;
export type Position = PositionValue;

// ============================================
// Core Interfaces
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
 * 가격 정보 (새 스키마)
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
 * 모집 상태 (포지션별)
 */
export interface PositionStatus {
  open: number;
  closed: number;
}

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

// ============================================
// Feature-specific Match Types
// ============================================

/**
 * Host Dashboard용 Match
 */
export interface HostDashboardMatch extends BaseMatch {
  status: MatchStatus;
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}

/**
 * 경기 진행 방식 (상세 페이지용)
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
  positions: Partial<Record<Position, PositionStatus>>; // max가 0인 포지션은 제외
  level: string;
  gender: GenderRule;
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

// ============================================
// Applicant & Team Types
// ============================================

export interface Applicant {
  id: string;
  nickname: string;
  position: Position;
  level: string;
  height: string;
  status: ApplicantStatus;
  avatar?: string;
  tags: string[];
  mannerTemp: number;
  noshowCount: number;
  attendanceRate: number;
}

export interface Team {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  avatar?: string;
}
