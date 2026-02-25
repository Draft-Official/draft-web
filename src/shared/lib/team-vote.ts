import type { PositionValue } from '@/shared/config/match-constants';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import type { Application, ParticipantInfo } from '@/shared/types/database.types';

const TEAM_VOTE_POSITION_SET = new Set<PositionValue>(['G', 'F', 'C', 'B']);

export function normalizeTeamVotePosition(position: string | null | undefined): PositionValue {
  if (!position) return 'G';
  const upper = position.toUpperCase() as PositionValue;
  return TEAM_VOTE_POSITION_SET.has(upper) ? upper : 'G';
}

export function parseTeamVoteParticipants(
  participantsInfo: Application['participants_info'] | null | undefined
): ParticipantInfo[] {
  if (!participantsInfo || !Array.isArray(participantsInfo)) return [];

  return (participantsInfo as ParticipantInfo[]).filter(
    (participant) =>
      participant &&
      (participant.type === 'MAIN' || participant.type === 'GUEST') &&
      typeof participant.position === 'string'
  );
}

export function countTeamVoteParticipants(
  participantsInfo: Application['participants_info'] | null | undefined
): number {
  const participants = parseTeamVoteParticipants(participantsInfo);
  if (participants.length === 0) return 1;

  const hasMainParticipant = participants.some((participant) => participant.type === 'MAIN');
  if (!hasMainParticipant) return participants.length + 1;

  return participants.length;
}

export function extractTeamVoteGuestParticipants(
  participantsInfo: Application['participants_info'] | null | undefined
): Array<{ name: string; position: PositionValue }> {
  return parseTeamVoteParticipants(participantsInfo)
    .filter((participant) => participant.type === 'GUEST')
    .map((participant) => ({
      name: participant.name || '게스트',
      position: normalizeTeamVotePosition(participant.position),
    }));
}

export function extractTeamVoteGuestNames(
  participantsInfo: Application['participants_info'] | null | undefined
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
