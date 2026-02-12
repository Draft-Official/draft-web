/**
 * Profile 관련 타입 정의
 * Feature: my (마이페이지)
 */

import { PositionValue } from '@/shared/config/constants';

export interface ProfileData {
  nickname: string;
  height: string;
  age: string;
  weight: string;
  position: PositionValue | '';  // DB codes: 'G' | 'F' | 'C' | ''
  skillLevel: number;
  team?: string;
}

// Re-export from shared config for convenience
export type { SkillLevel } from '@/shared/config/skill-constants';
export { SKILL_LEVELS, SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';

// 프로필이 완성되었는지 확인 (필수 필드가 채워져 있는지)
// 타입 가드: true 반환 시 profile이 완전한 ProfileData임을 보장
export function isProfileComplete(profile: ProfileData | null): profile is ProfileData {
  if (!profile) return false;
  return !!(profile.height && profile.age && profile.weight && profile.position);
}
