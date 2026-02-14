/**
 * User Mapper
 * DB row를 entity 타입으로 변환
 */

import type { User as UserRow } from '@/shared/types/database.types';
import type { PositionValue } from '@/shared/config/match-constants';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import type { UserMetadata, User as UserEntity } from '../model/types';

/**
 * User DB row를 entity 타입으로 변환
 */
export function userRowToEntity(row: UserRow): UserEntity {
  return {
    id: row.id,
    nickname: row.nickname,
    avatarUrl: row.avatar_url,
    email: row.email,
    phone: row.phone,
    phoneVerified: row.phone_verified,
    realName: row.real_name,
    positions: (row.positions as PositionValue[] | null) ?? null,
    mannerScore: row.manner_score,
    metadata: (row.metadata as unknown as UserMetadata) ?? null,
    accountInfo: (row.account_info as unknown as AccountInfo) ?? null,
    operationInfo: (row.operation_info as unknown as OperationInfo) ?? null,
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
  };
}
