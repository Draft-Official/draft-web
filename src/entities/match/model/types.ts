/**
 * Match Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 *
 * DB Schema 기반 타입 정의 (matches 테이블)
 */

import type {
  MatchTypeValue,
  MatchFormatValue,
  CostTypeValue,
  GenderValue,
  MatchStatusValue,
} from '@/shared/config/match-constants';
import type {
  LevelRange,
  AgeRange,
  RecruitmentSetup,
  MatchRule,
  OperationInfo,
  AccountInfo,
} from '@/shared/types/jsonb.types';

// ============================================
// Match (경기)
// ============================================

/**
 * 클라이언트용 매치 타입
 * DB row를 mapper로 변환한 결과
 */
export interface Match {
  id: string;
  shortId: string;
  hostId: string;
  teamId: string | null;
  gymId: string;
  startTime: string;
  endTime: string;
  matchType: MatchTypeValue;
  matchFormat: MatchFormatValue;
  costType: CostTypeValue;
  costAmount: number | null;
  genderRule: GenderValue;
  manualTeamName: string;
  status: MatchStatusValue | null;
  levelRange: LevelRange | null;
  ageRange: AgeRange | null;
  recruitmentSetup: RecruitmentSetup;
  confirmedParticipantCount: number;
  matchRule: MatchRule | null;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
  requirements: string[] | null;
  providesBeverage: boolean | null;
  createdAt: string | null;
}

/**
 * 매치 생성 input 타입
 */
export interface CreateMatchInput {
  hostId: string;
  teamId?: string;
  gymId: string;
  startTime: string;
  endTime: string;
  matchType: MatchTypeValue;
  matchFormat: MatchFormatValue;
  costType: CostTypeValue;
  costAmount?: number;
  genderRule: GenderValue;
  manualTeamName: string;
  levelRange?: LevelRange;
  ageRange?: AgeRange;
  recruitmentSetup: RecruitmentSetup;
  matchRule?: MatchRule;
  accountInfo?: AccountInfo;
  operationInfo?: OperationInfo;
  requirements?: string[];
  providesBeverage?: boolean;
}

/**
 * 매치 수정 input 타입
 */
export interface UpdateMatchInput {
  startTime?: string;
  endTime?: string;
  costType?: CostTypeValue;
  costAmount?: number | null;
  genderRule?: GenderValue;
  manualTeamName?: string;
  levelRange?: LevelRange | null;
  ageRange?: AgeRange | null;
  recruitmentSetup?: RecruitmentSetup;
  matchRule?: MatchRule | null;
  accountInfo?: AccountInfo | null;
  operationInfo?: OperationInfo | null;
  requirements?: string[] | null;
  providesBeverage?: boolean | null;
  status?: MatchStatusValue | null;
}
