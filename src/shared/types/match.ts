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

/**
 * 참가비 타입
 */
export enum CostType {
  MONEY = 'MONEY', // 일반 참가비 (원)
  FREE = 'FREE', // 무료
  BEVERAGE = 'BEVERAGE', // 음료 내기 (병 수)
}

/**
 * 성별 규칙 (DB는 대문자, UI는 소문자 모두 지원)
 */
export type GenderRule = 'MALE' | 'MIXED' | 'FEMALE' | 'men' | 'women' | 'mixed';

/**
 * 포지션 타입 (DB Enum과 동일)
 * B: 빅맨 (F/C 통합 포지션)
 */
export type Position = 'G' | 'F' | 'C' | 'B';

// ============================================
// Core Interfaces
// ============================================

/**
 * 지리적 위치 정보
 */
export interface Location {
  name: string; // 표시 이름 (예: "강남구민회관")
  address: string; // 전체 주소
  latitude: number;
  longitude: number;
}

/**
 * 가격 정보 (새 스키마)
 */
export interface PriceInfo {
  type: CostType;
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
 * Guest 매치 리스트용 Match
 */
export interface GuestListMatch extends BaseMatch {
  teamName: string;
  positions: Record<Position, PositionStatus>;
  level: string;
  gender: GenderRule;
  gameFormat?: string; // "내부 2게임", "교류전" 등
  courtType?: string;
  ageMin?: number;
  ageMax?: number;
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
