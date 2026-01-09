/**
 * 공통 Match 타입 정의 (Phase 2 확장성 준수)
 * 
 * 설계 원칙:
 * 1. 유연한 매치 속성: facilities를 JSONB 스타일로 관리
 * 2. 가격 구조 확장성: Base Price + Modifiers 모델
 * 3. 지리적 위치: latitude, longitude 필수 포함
 * 4. 매치 타입: Enum으로 관리하여 쉽게 확장 가능
 */

// ============================================
// Enums
// ============================================

export enum MatchType {
  GUEST_RECRUIT = 'GUEST_RECRUIT', // MVP
  PICKUP_GAME = 'PICKUP_GAME',     // MVP
  TUTORIAL = 'TUTORIAL',           // Phase 2
  LESSON = 'LESSON',               // Phase 2
  TOURNAMENT = 'TOURNAMENT',       // Future
}

export enum MatchStatus {
  RECRUITING = 'recruiting',
  CLOSING_SOON = 'closing_soon',
  CLOSED = 'closed',
  CANCELED = 'canceled',
}

export enum ApplicantStatus {
  PENDING = 'pending',
  CHECKING = 'checking',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export type Position = 'G' | 'F' | 'C' | 'Big';

// ============================================
// Core Interfaces (Phase 2 확장성 적용)
// ============================================

/**
 * 지리적 위치 정보
 * Phase 2: 카풀 매칭, 근처 검색 기능에 필수
 */
export interface Location {
  name: string;       // 표시 이름 (예: "강남구민회관")
  address: string;    // 전체 주소
  latitude: number;   // 위도 (필수)
  longitude: number;  // 경도 (필수)
}

/**
 * 가격 정보 (확장 가능한 구조)
 * Phase 2: 카풀 할인, 장비 대여 요금 등 추가 가능
 */
export interface PriceInfo {
  base: number;        // 기본 가격
  modifiers?: Array<{
    type: string;      // 'CARPOOL_DISCOUNT', 'EQUIPMENT_FEE' 등
    amount: number;    // 양수(추가) 또는 음수(할인)
  }>;
  final: number;       // 최종 가격 (계산된 값)
}

/**
 * 베이스 Match 인터페이스
 * 모든 Match 타입의 공통 필드
 */
export interface BaseMatch {
  id: string;
  title: string;
  matchType: MatchType;
  location: Location;
  dateISO: string;     // YYYY-MM-DD
  startTime: string;   // HH:mm
  price: PriceInfo;
  facilities: Record<string, any>; // JSONB 스타일: { shower: true, parking: 'paid', equipment: 'provided' }
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
  positions: Record<string, PositionStatus>;
  level: string;
  gender: 'men' | 'women' | 'mixed';
  gameFormat: string; // "5vs5", "3vs3" 등
  courtType: 'indoor' | 'outdoor';
}

/**
 * Position별 모집 상태
 */
export interface PositionStatus {
  open: number;
  closed: number;
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
