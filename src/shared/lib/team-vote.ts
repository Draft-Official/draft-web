import type { PositionValue } from '@/shared/config/match-constants';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import type { Application, ParticipantInfo } from '@/shared/types/database.types';
import type { Participant } from '@/shared/types/jsonb.types';

const TEAM_VOTE_POSITION_SET = new Set<PositionValue>(['G', 'F', 'C', 'B']);

type TeamVoteParticipantsInput =
  | Application['participants_info']
  | Participant[]
  | ParticipantInfo[]
  | null
  | undefined;

type TeamVoteParticipantRaw = {
  type: 'MAIN' | 'GUEST';
  position: string;
  name?: unknown;
  [key: string]: unknown;
};

function isTeamVoteParticipantRaw(value: unknown): value is TeamVoteParticipantRaw {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { type?: unknown; position?: unknown };
  return (
    (candidate.type === 'MAIN' || candidate.type === 'GUEST') &&
    typeof candidate.position === 'string'
  );
}

export function normalizeTeamVotePosition(position: string | null | undefined): PositionValue {
  if (!position) return 'G';
  const upper = position.toUpperCase() as PositionValue;
  return TEAM_VOTE_POSITION_SET.has(upper) ? upper : 'G';
}

export function parseTeamVoteParticipants(
  participantsInfo: TeamVoteParticipantsInput
): ParticipantInfo[] {
  if (!participantsInfo || !Array.isArray(participantsInfo)) return [];

  const parsed: ParticipantInfo[] = [];
  for (const value of participantsInfo) {
    if (!isTeamVoteParticipantRaw(value)) continue;
    parsed.push({
      type: value.type,
      position: value.position,
      name: typeof value.name === 'string' ? value.name : '',
    });
  }

  return parsed;
}

export function countTeamVoteParticipants(
  participantsInfo: TeamVoteParticipantsInput
): number {
  const participants = parseTeamVoteParticipants(participantsInfo);
  if (participants.length === 0) return 1;

  const hasMainParticipant = participants.some((participant) => participant.type === 'MAIN');
  if (!hasMainParticipant) return participants.length + 1;

  return participants.length;
}

export function extractTeamVoteGuestParticipants(
  participantsInfo: TeamVoteParticipantsInput
): Array<{ name: string; position: PositionValue }> {
  return parseTeamVoteParticipants(participantsInfo)
    .filter((participant) => participant.type === 'GUEST')
    .map((participant) => ({
      name: participant.name || '게스트',
      position: normalizeTeamVotePosition(participant.position),
    }));
}

export function extractTeamVoteGuestNames(
  participantsInfo: TeamVoteParticipantsInput
): string[] {
  return extractTeamVoteGuestParticipants(participantsInfo).map((participant) => participant.name);
}

export function toTeamVoteStatus(status: string | null | undefined): TeamVoteStatusValue {
  switch (status) {
    case 'CONFIRMED':
    case 'LATE':
    case 'NOT_ATTENDING':
    case 'MAYBE':
      return status;
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

export const TEAM_VOTE_STATUS_TO_APPLICATION_STATUS: Record<
  TeamVoteStatusValue,
  NonNullable<Application['status']>
> = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  LATE: 'LATE',
  NOT_ATTENDING: 'NOT_ATTENDING',
  MAYBE: 'MAYBE',
};
