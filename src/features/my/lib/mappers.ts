import type { SessionProfile, SessionProfileMetadata, UpdateSessionProfileInput } from '@/shared/session';
import type {
  MyProfileFormDTO,
  MyProfileViewDTO,
  MyTeamOptionDTO,
  UpdateMyProfileInput,
} from '../model/types';

function toProfileMetadata(value: SessionProfileMetadata | null | undefined): SessionProfileMetadata {
  if (!value || typeof value !== 'object') return {};
  return value;
}

export function sessionProfileToMyProfileFormDTO(
  sessionProfile: SessionProfile | null
): MyProfileFormDTO | null {
  if (!sessionProfile) return null;

  const metadata = toProfileMetadata(sessionProfile.metadata);
  const position = sessionProfile.positions?.[0] ?? '';

  return {
    nickname: sessionProfile.nickname ?? '',
    height: metadata.height?.toString() ?? '',
    age: metadata.age?.toString() ?? '',
    weight: metadata.weight?.toString() ?? '',
    position: position as MyProfileFormDTO['position'],
    skillLevel: Number(metadata.skill_level ?? 1),
    team: (metadata.display_team_id as string | undefined) ?? '',
  };
}

export function myProfileFormDTOToUpdateSessionProfileInput(
  formData: UpdateMyProfileInput,
  teamOptions: MyTeamOptionDTO[]
): UpdateSessionProfileInput {
  const selectedTeam = formData.team
    ? teamOptions.find((team) => team.id === formData.team) ?? null
    : null;

  return {
    nickname: formData.nickname.trim() || null,
    positions: formData.position ? [formData.position] : null,
    metadata: {
      height: formData.height ? parseInt(formData.height, 10) : undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
      skill_level: formData.skillLevel,
      display_team_id: selectedTeam?.id ?? null,
      display_team_name: selectedTeam?.name ?? null,
    },
  };
}

export function toMyTeamOptions(
  teams: Array<{ id: string; name: string }>
): MyTeamOptionDTO[] {
  return teams.map((team) => ({ id: team.id, name: team.name }));
}

export function toMyProfileViewDTO(params: {
  sessionProfile: SessionProfile | null;
  userEmail: string | null | undefined;
  teamOptions: MyTeamOptionDTO[];
}): MyProfileViewDTO {
  const profile = sessionProfileToMyProfileFormDTO(params.sessionProfile);

  const userName =
    params.sessionProfile?.nickname ||
    params.sessionProfile?.real_name ||
    params.userEmail?.split('@')[0] ||
    '사용자';

  let displayTeamName: string | undefined;
  if (profile?.team) {
    const found = params.teamOptions.find((team) => team.id === profile.team);
    if (found) {
      displayTeamName = found.name;
    } else {
      const metadata = toProfileMetadata(params.sessionProfile?.metadata);
      displayTeamName = (metadata.display_team_name as string | undefined) ?? undefined;
    }
  }

  return {
    profile,
    userName,
    userInitials: userName.slice(0, 2),
    displayTeamName,
  };
}
