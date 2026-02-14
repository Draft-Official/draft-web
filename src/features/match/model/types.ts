/**
 * Match Feature 타입 정의
 *
 * 규칙:
 * - DB 타입은 database.types.ts에서 import
 * - Enum 값/라벨은 constants.ts에서 import
 * - JSONB 타입은 jsonb.types.ts에서 import
 */

import type {
  GenderValue,
  MatchStatusValue,
  MatchTypeValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
  ContactTypeValue,
} from '@/shared/config/match-constants';
import type { MatchRule } from '@/shared/types/jsonb.types';

// Re-export for convenience
export type { MatchRule };

// ============================================
// Guest Match DTO Types
// ============================================

/**
 * GuestMatch 리스트 아이템 DTO
 * 게스트 매치 목록 화면용 (홈, 검색 등)
 */
export interface GuestMatchListItemDTO {
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
 * GuestMatch 상세용 포지션 상태
 */
export interface GuestMatchPositionStatus {
  status: 'open' | 'closed';
  max: number;
  current: number;
}

/**
 * GuestMatch 상세용 연락처 정보
 */
export interface GuestMatchContactInfo {
  type: ContactTypeValue;
  value: string;
}

/**
 * GuestMatch 상세 페이지 DTO
 * 경기 상세 정보 화면용
 *
 * Extends GuestMatchListItemDTO with additional detail fields
 */
export interface GuestMatchDetailDTO extends GuestMatchListItemDTO {
  // Legacy compatibility fields (detail UI migration)
  id: string;
  title: string;
  location: string;
  address: string;
  price: string;
  priceNum: number;
  gender: GenderValue;
  level: string | null;
  levelMin: number | null;
  levelMax: number | null;
  ageRange: string | null;
  facilities: Record<string, unknown> | null;
  positions: {
    all?: GuestMatchPositionStatus;
    g?: GuestMatchPositionStatus;
    f?: GuestMatchPositionStatus;
    c?: GuestMatchPositionStatus;
    bigman?: GuestMatchPositionStatus;
  };
  rule: {
    type: PlayStyleValue;
    quarterTime: number;
    quarterCount: number;
    fullGames: number;
    referee: RefereeTypeValue;
  } | null;
  hostName: string | null;
  hostImage: string | null;
  manualTeamName: string | null;
  hostMessage: string | null;
  contactInfo: GuestMatchContactInfo | null;
  latitude: number;
  longitude: number;

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
