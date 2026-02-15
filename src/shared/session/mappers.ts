import type {
  Profile as ProfileRow,
  ProfileUpdate,
} from '@/shared/types/database.types';
import type {
  SessionAccountInfo,
  SessionProfile,
  SessionProfileMetadata,
  UpdateSessionProfileInput,
} from './types';

function toSessionMetadata(value: unknown): SessionProfileMetadata | null {
  if (!value || typeof value !== 'object') return null;
  return value as SessionProfileMetadata;
}

function toSessionAccountInfo(value: unknown): SessionAccountInfo | null {
  if (!value || typeof value !== 'object') return null;
  return value as SessionAccountInfo;
}

export function profileRowToSessionProfile(row: ProfileRow | null): SessionProfile | null {
  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    nickname: row.nickname,
    real_name: row.real_name,
    avatar_url: row.avatar_url,
    phone: row.phone,
    phone_verified: row.phone_verified,
    positions: row.positions,
    metadata: toSessionMetadata(row.metadata),
    account_info: toSessionAccountInfo(row.account_info),
    operation_info: (row.operation_info as SessionProfile['operation_info']) ?? null,
    manner_score: row.manner_score,
    created_at: row.created_at,
    deleted_at: row.deleted_at,
  };
}

export function sessionProfileToProfileUpdate(
  input: UpdateSessionProfileInput
): ProfileUpdate {
  const updates: ProfileUpdate = {};

  if ('nickname' in input) updates.nickname = input.nickname ?? null;
  if ('real_name' in input) updates.real_name = input.real_name ?? null;
  if ('avatar_url' in input) updates.avatar_url = input.avatar_url ?? null;
  if ('phone' in input) updates.phone = input.phone ?? null;
  if ('phone_verified' in input) updates.phone_verified = input.phone_verified ?? null;
  if ('positions' in input) updates.positions = input.positions ?? null;
  if ('metadata' in input) {
    updates.metadata = (input.metadata ?? null) as ProfileUpdate['metadata'];
  }
  if ('account_info' in input) {
    updates.account_info = (input.account_info ?? null) as ProfileUpdate['account_info'];
  }
  if ('operation_info' in input) {
    updates.operation_info = (input.operation_info ?? null) as ProfileUpdate['operation_info'];
  }
  if ('manner_score' in input) updates.manner_score = input.manner_score ?? null;

  return updates;
}
