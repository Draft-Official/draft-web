import type { SessionProfile, SessionProfileMetadata, UpdateSessionProfileInput } from '@/shared/session';
import type { ParticipantInfo } from '@/shared/types/database.types';
import { POSITION_DEFAULT } from '@/shared/config/match-constants';
import type {
  ApplyCompanionDTO,
  ApplyFormDTO,
  ApplyModalViewDTO,
  CreateApplicationDTO,
  UserApplicationItemDTO,
  UserTeamOptionDTO,
} from '../model/types';

function toMetadata(profile: SessionProfile | null): SessionProfileMetadata {
  if (!profile?.metadata || typeof profile.metadata !== 'object') {
    return {};
  }
  return profile.metadata;
}

export function sessionProfileToApplyFormDTO(profile: SessionProfile | null): ApplyFormDTO {
  const metadata = toMetadata(profile);
  const position = profile?.positions?.[0] ?? '';

  return {
    height: metadata.height?.toString() ?? '',
    age: metadata.age?.toString() ?? '',
    weight: metadata.weight?.toString() ?? '',
    position: (position as ApplyFormDTO['position']) || '',
    teamId: '',
  };
}

export function sessionProfileToApplyModalViewDTO(
  profile: SessionProfile | null
): ApplyModalViewDTO {
  const metadata = toMetadata(profile);

  return {
    form: sessionProfileToApplyFormDTO(profile),
    userSkillLevel: metadata.skill_level?.toString() ?? '',
  };
}

export function buildProfileUpdateFromApplyForm(
  formData: ApplyFormDTO,
  profile: SessionProfile | null
): UpdateSessionProfileInput | null {
  const metadata = toMetadata(profile);
  const currentPosition = profile?.positions?.[0];

  const nextMetadata: SessionProfileMetadata = { ...metadata };
  let hasUpdates = false;

  if (!metadata.height && formData.height) {
    nextMetadata.height = parseInt(formData.height, 10);
    hasUpdates = true;
  }

  if (!metadata.age && formData.age) {
    nextMetadata.age = parseInt(formData.age, 10);
    hasUpdates = true;
  }

  if (!metadata.weight && formData.weight) {
    nextMetadata.weight = parseInt(formData.weight, 10);
    hasUpdates = true;
  }

  const updates: UpdateSessionProfileInput = {};

  if (hasUpdates) {
    updates.metadata = nextMetadata;
  }

  if (!currentPosition && formData.position) {
    updates.positions = [formData.position];
    hasUpdates = true;
  }

  return hasUpdates ? updates : null;
}

interface BuildCreateApplicationDTOParams {
  matchId: string;
  userId: string;
  formData: ApplyFormDTO;
  companions: ApplyCompanionDTO[];
  hasCompanions: boolean;
  profile: SessionProfile | null;
}

export function buildCreateApplicationDTO(
  params: BuildCreateApplicationDTOParams
): CreateApplicationDTO {
  const metadata = toMetadata(params.profile);
  const userSkillLevel = metadata.skill_level?.toString() ?? '';
  const positionCode = params.formData.position || POSITION_DEFAULT;

  const participants: ParticipantInfo[] = [
    {
      type: 'MAIN',
      name: params.profile?.nickname || params.profile?.real_name || '',
      position: positionCode,
      ...(userSkillLevel ? { skillLevel: parseInt(userSkillLevel, 10) } : {}),
    },
    ...(params.hasCompanions
      ? params.companions.map((companion) => ({
          type: 'GUEST' as const,
          name: companion.name,
          position: companion.position || POSITION_DEFAULT,
          ...(companion.height ? { height: parseInt(companion.height, 10) } : {}),
          ...(companion.age ? { age: parseInt(companion.age, 10) } : {}),
          ...(companion.skillLevel
            ? { skillLevel: parseInt(companion.skillLevel, 10) }
            : {}),
        }))
      : []),
  ];

  return {
    matchId: params.matchId,
    userId: params.userId,
    teamId: params.formData.teamId || null,
    participants,
  };
}

export function toUserApplicationItemDTO(row: {
  match_id: string;
  status: UserApplicationItemDTO['status'];
}): UserApplicationItemDTO {
  return {
    matchId: row.match_id,
    status: row.status,
  };
}

export function toUserTeamOptionDTO(row: {
  id: string;
  name: string;
  logo_url?: string | null;
}): UserTeamOptionDTO {
  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logo_url ?? null,
  };
}
