/**
 * Profile 관련 타입 정의
 * Feature: my (마이페이지)
 */

import { PositionValue } from '@/shared/config/match-constants';

// ============================================
// DTO Contracts (My Feature)
// ============================================

export interface MyProfileFormDTO {
  nickname: string;
  height: string;
  age: string;
  weight: string;
  position: PositionValue | '';  // DB codes: 'G' | 'F' | 'C' | ''
  skillLevel: number;
  team?: string;
}

export interface MyProfileViewDTO {
  profile: MyProfileFormDTO | null;
  userName: string;
  userInitials: string;
  displayTeamName?: string;
}

export interface MyTeamOptionDTO {
  id: string;
  name: string;
}

export interface MyNotificationSettingsDTO {
  notifyAnnouncement: boolean;
  notifyApplication: boolean;
  notifyMatch: boolean;
  notifyPayment: boolean;
}

export type UpdateMyProfileInput = MyProfileFormDTO;

/**
 * @deprecated Use MyProfileFormDTO instead.
 */
export type ProfileData = MyProfileFormDTO;

// Re-export from shared config for convenience
export type { SkillLevel } from '@/shared/config/skill-constants';
export { SKILL_LEVELS, SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';

// 프로필이 완성되었는지 확인 (필수 필드가 채워져 있는지)
// 타입 가드: true 반환 시 profile이 완전한 ProfileData임을 보장
export function isProfileComplete(profile: MyProfileFormDTO | null): profile is MyProfileFormDTO {
  if (!profile) return false;
  return !!(profile.height && profile.age && profile.weight && profile.position);
}
