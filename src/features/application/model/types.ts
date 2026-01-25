/**
 * Application Feature 타입 정의
 */

import type {
  PositionValue,
  ApplicationStatusValue,
} from '@/shared/config/constants';

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
