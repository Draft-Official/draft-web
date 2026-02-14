/**
 * Application Mapper
 * DB row를 entity 타입으로 변환
 */

import type { Application as ApplicationRow } from '@/shared/types/database.types';
import type { ApplicationStatusValue, CancelTypeValue } from '@/shared/config/application-constants';
import type { Participant } from '@/shared/types/jsonb.types';
import type { Application as ApplicationEntity } from '../model/types';

/**
 * Application DB row를 entity 타입으로 변환
 */
export function applicationRowToEntity(row: ApplicationRow): ApplicationEntity {
  return {
    id: row.id,
    userId: row.user_id,
    matchId: row.match_id,
    teamId: row.team_id,
    status: row.status as ApplicationStatusValue | null,
    source: row.source,
    participantsInfo: (row.participants_info as unknown as Participant[]) ?? null,
    description: row.description,
    approvedAt: row.approved_at,
    paymentVerifiedAt: row.payment_verified_at,
    confirmedBy: row.confirmed_by,
    cancelType: row.cancel_type as CancelTypeValue | null,
    cancelReason: row.cancel_reason,
    canceledBy: row.canceled_by,
    refundCompletedAt: row.refund_completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
