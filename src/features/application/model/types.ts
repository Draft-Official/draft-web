/**
 * Application Feature 타입 정의
 */

import type {
  PositionValue,
} from '@/shared/config/constants';
import type { ApplicationStatusValue } from "@/src/shared/config/application-constants";
import type { ApplicationSourceValue } from '@/shared/config/team-constants';

// Re-export for convenience
export type { ApplicationSourceValue } from '@/shared/config/team-constants';

/**
 * 신청자 정보
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
