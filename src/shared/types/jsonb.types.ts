/**
 * JSONB 필드 타입 정의
 *
 * 이 파일은 PostgreSQL JSONB 컬럼의 TypeScript 인터페이스를 정의합니다.
 * database.types.ts에서 이 타입들을 참조합니다.
 *
 * 규칙:
 * - 동일한 구조는 동일한 이름 사용 (operation_info, account_info)
 * - enum 값은 UPPER_SNAKE_CASE 사용
 * - constants.ts의 타입을 import하여 사용
 */

import type {
  PositionValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
  RequirementsValue,
} from '@/shared/config/constants';

// ============================================
// 공통 JSONB 타입 (users, teams, matches)
// ============================================

/**
 * 운영 정보
 * 사용 테이블: users, teams, matches
 */
export interface OperationInfo {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT';
  phone?: string; // 전화번호 (type이 PHONE일 때)
  url?: string; // 오픈채팅 URL (type이 KAKAO_OPEN_CHAT일 때)
  notice?: string; // 공지사항
}

/**
 * 계좌 정보
 * 사용 테이블: users, teams, matches
 */
export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}

// ============================================
// Matches 전용 JSONB 타입
// ============================================

/**
 * 모집 설정
 * 사용 테이블: matches (recruitment_setup)
 */
export interface RecruitmentSetup {
  type: 'ANY' | 'POSITION';
  max_count?: number;
  positions?: {
    [key in PositionValue]?: { max: number; current: number };
  };
}

/**
 * 경기 규칙
 * 사용 테이블: matches (match_rule)
 * 기존 MatchOptionsUI → MatchRule로 이름 변경
 */
export interface MatchRule {
  play_style?: PlayStyleValue;
  quarter_rule?: {
    minutes_per_quarter: number;
    quarter_count: number;
    game_count: number;
  };
  guaranteed_quarters?: number;
  referee_type?: RefereeTypeValue;
}

/**
 * 모집 현황
 * 사용 테이블: matches (recruitment_count)
 */
export interface RecruitmentCount {
  [position: string]: number;
}

/**
 * 준비물
 * 사용 테이블: matches (requirements)
 */
export interface Requirements {
  items: RequirementsValue[];
  custom?: string[];
}

// ============================================
// Gyms 전용 JSONB 타입
// ============================================

/**
 * 체육관 시설 정보
 * 사용 테이블: gyms (facilities)
 */
export interface GymFacilities {
  shower?: boolean;
  parking?: boolean;
  parking_fee?: string;
  parking_location?: string;
  court_size_type?: CourtSizeValue;
  air_conditioner?: boolean;
  water_purifier?: boolean;
  ball?: boolean;
}

// ============================================
// Applications 전용 JSONB 타입
// ============================================

/**
 * 참여자 정보
 * 사용 테이블: applications (participants)
 */
export interface Participant {
  type: 'MAIN' | 'GUEST';
  name: string;
  position: PositionValue;
  cost: number;
}

// ============================================
// Teams 전용 JSONB 타입
// ============================================

/**
 * 정기 일정
 * 사용 테이블: teams (regular_schedules)
 */
export interface RegularSchedule {
  day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  location?: string;
}
