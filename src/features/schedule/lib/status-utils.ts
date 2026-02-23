/**
 * Application Status Utilities
 * DB application status → UI status 변환 공통 로직
 */
import type { GuestStatus, MatchStatus } from '../model/types';
import { GUEST_APPROVAL_STATUS_TEXT } from '../config/constants';

/**
 * DB Application status → UI GuestStatus 변환
 *
 * 상태 해석:
 * - PENDING → 승인 대기 (pending)
 * - PAYMENT_PENDING → 입금 대기 (payment_waiting)
 * - CONFIRMED → 확정
 * - REJECTED → 거절
 * - CANCELED → 취소
 */
export function resolveApplicationStatus(
  dbStatus: string,
  approvedAt?: string | null | undefined,
): GuestStatus {
  if (dbStatus === 'CONFIRMED') return 'confirmed';
  if (dbStatus === 'REJECTED') return 'rejected';
  if (dbStatus === 'CANCELED') return 'canceled';
  if (dbStatus === 'PAYMENT_PENDING') return 'payment_waiting';

  if (dbStatus === 'PENDING') {
    // 마이그레이션 이전 레거시 데이터 호환 (approved_at 있으면 입금대기)
    return approvedAt ? 'payment_waiting' : 'pending';
  }

  return 'pending';
}

/** GuestStatus → 게스트 참여 목록용 ScheduleMatchListItemDTO status */
const GUEST_STATUS_TO_MATCH_STATUS: Record<GuestStatus, MatchStatus> = {
  confirmed: 'confirmed',
  rejected: 'cancelled',
  canceled: 'cancelled',
  payment_waiting: 'payment_waiting',
  pending: 'waiting',
};

/** GuestStatus → 승인 상태 텍스트 */
const GUEST_STATUS_TO_APPROVAL_TEXT: Record<GuestStatus, string> = {
  confirmed: GUEST_APPROVAL_STATUS_TEXT.CONFIRMED,
  rejected: GUEST_APPROVAL_STATUS_TEXT.REJECTED,
  canceled: GUEST_APPROVAL_STATUS_TEXT.CANCELED,
  payment_waiting: GUEST_APPROVAL_STATUS_TEXT.PAYMENT_WAITING,
  pending: GUEST_APPROVAL_STATUS_TEXT.PENDING,
};

/** resolveApplicationStatus 결과를 ScheduleMatchListItemDTO status로 변환 */
export function toParticipatingMatchStatus(guestStatus: GuestStatus): MatchStatus {
  return GUEST_STATUS_TO_MATCH_STATUS[guestStatus];
}

/** resolveApplicationStatus 결과를 승인 상태 텍스트로 변환 */
export function toApprovalStatusText(guestStatus: GuestStatus): string {
  return GUEST_STATUS_TO_APPROVAL_TEXT[guestStatus];
}
