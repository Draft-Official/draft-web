/**
 * Application Feature 타입 정의
 */

import type { PositionValue } from '@/shared/config/match-constants';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';
import type { ApplicationSourceValue } from '@/shared/config/team-constants';
import type { ParticipantInfo } from '@/shared/types/database.types';

// Re-export for convenience
export type { ApplicationSourceValue } from '@/shared/config/team-constants';

// ============================================
// DTO Contracts
// ============================================

export interface ApplyFormDTO {
  height: string;
  age: string;
  weight: string;
  position: PositionValue | '';
  teamId: string;
}

export interface ApplyCompanionDTO {
  name: string;
  position: PositionValue | '';
  height: string;
  age: string;
  skillLevel: string;
}

export interface CreateApplicationDTO {
  matchId: string;
  userId: string;
  teamId: string | null;
  participants: ParticipantInfo[];
}

export interface UserApplicationItemDTO {
  matchId: string;
  status: ApplicationStatusValue;
}

export interface UserTeamOptionDTO {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface ApplyModalViewDTO {
  form: ApplyFormDTO;
  userSkillLevel: string;
}

/**
 * 신청자 정보
 * @deprecated Use Application DTO contracts instead
 */
export interface Applicant {
  id: string;
  nickname: string;
  position: PositionValue;
  level: string;
  height: string;
  status: ApplicationStatusValue;
  avatar?: string;
  tags: string[];
  mannerTemp: number;
  noshowCount: number;
  attendanceRate: number;
}
