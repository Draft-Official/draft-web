/**
 * Application Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 *
 * DB Schema 기반 타입 정의 (applications 테이블)
 */

import type {
  ApplicationStatusValue,
  CancelTypeValue,
} from '@/shared/config/application-constants';
import type { Participant } from '@/shared/types/jsonb.types';

// ============================================
// Application (게스트 신청)
// ============================================

/**
 * 클라이언트용 신청 타입
 * DB row를 mapper로 변환한 결과
 */
export interface Application {
  id: string;
  userId: string;
  matchId: string;
  teamId: string | null;
  status: ApplicationStatusValue | null;
  source: string | null;
  participantsInfo: Participant[] | null;
  description: string | null;
  approvedAt: string | null;
  paymentVerifiedAt: string | null;
  confirmedAt: string | null;
  cancelType: CancelTypeValue | null;
  cancelReason: string | null;
  canceledBy: string | null;
  refundCompletedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * 신청 생성 input 타입
 */
export interface CreateApplicationInput {
  userId: string;
  matchId: string;
  teamId?: string;
  source?: string;
  participantsInfo?: Participant[];
  description?: string;
}

/**
 * 신청 수정 input 타입
 */
export interface UpdateApplicationInput {
  status?: ApplicationStatusValue;
  participantsInfo?: Participant[] | null;
  description?: string | null;
  approvedAt?: string | null;
  paymentVerifiedAt?: string | null;
  confirmedAt?: string | null;
  cancelType?: CancelTypeValue | null;
  cancelReason?: string | null;
  canceledBy?: string | null;
  refundCompletedAt?: string | null;
}
