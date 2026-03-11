import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import type { MyPendingTeamVoteMatchDTO, TeamVoteDTO, VotingSummary } from '../../model/types';

export type CompactVotingSummary = {
  attending: number;
  notAttending: number;
  pending: number;
};

type FullSummaryBucket = 'pending' | 'attending' | 'late' | 'maybe' | 'notAttending';
type CompactSummaryBucket = keyof CompactVotingSummary;

function clampToZero(value: number): number {
  return value < 0 ? 0 : value;
}

function toFullSummaryBucket(status: TeamVoteStatusValue | null | undefined): FullSummaryBucket | null {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'attending';
    case 'LATE':
      return 'late';
    case 'MAYBE':
      return 'maybe';
    case 'NOT_ATTENDING':
      return 'notAttending';
    default:
      return null;
  }
}

function toCompactSummaryBucket(status: TeamVoteStatusValue | null | undefined): CompactSummaryBucket | null {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
    case 'LATE':
      return 'attending';
    case 'NOT_ATTENDING':
      return 'notAttending';
    case 'MAYBE':
    default:
      return null;
  }
}

export function participantCountFromVote(
  vote: Pick<TeamVoteDTO, 'guestParticipants'> | null | undefined
): number {
  if (!vote) return 1;
  return 1 + (vote.guestParticipants?.length ?? 0);
}

function applyFullBucketDelta(
  summary: VotingSummary,
  bucket: FullSummaryBucket | null,
  delta: number
): VotingSummary {
  if (!bucket || delta === 0) {
    return summary;
  }

  switch (bucket) {
    case 'pending':
      return { ...summary, pending: clampToZero(summary.pending + delta) };
    case 'attending':
      return { ...summary, attending: clampToZero(summary.attending + delta) };
    case 'late':
      return { ...summary, late: clampToZero(summary.late + delta) };
    case 'maybe':
      return { ...summary, maybe: clampToZero(summary.maybe + delta) };
    case 'notAttending':
      return { ...summary, notAttending: clampToZero(summary.notAttending + delta) };
    default:
      return summary;
  }
}

function applyCompactBucketDelta(
  summary: CompactVotingSummary,
  bucket: CompactSummaryBucket | null,
  delta: number
): CompactVotingSummary {
  if (!bucket || delta === 0) {
    return summary;
  }

  switch (bucket) {
    case 'pending':
      return { ...summary, pending: clampToZero(summary.pending + delta) };
    case 'attending':
      return { ...summary, attending: clampToZero(summary.attending + delta) };
    case 'notAttending':
      return { ...summary, notAttending: clampToZero(summary.notAttending + delta) };
    default:
      return summary;
  }
}

export function applyTeamVotingSummaryTransition(
  summary: VotingSummary | null | undefined,
  previousStatus: TeamVoteStatusValue | null | undefined,
  nextStatus: TeamVoteStatusValue,
  participantCount: number
): VotingSummary | null | undefined {
  if (!summary || participantCount <= 0) {
    return summary;
  }

  const prevBucket = toFullSummaryBucket(previousStatus);
  const nextBucket = toFullSummaryBucket(nextStatus);

  if (prevBucket === nextBucket) {
    return summary;
  }

  const removed = applyFullBucketDelta(summary, prevBucket, -participantCount);
  return applyFullBucketDelta(removed, nextBucket, participantCount);
}

export function applyCompactVotingSummaryTransition(
  summary: CompactVotingSummary | undefined,
  previousStatus: TeamVoteStatusValue | null | undefined,
  nextStatus: TeamVoteStatusValue,
  participantCount: number
): CompactVotingSummary | undefined {
  if (!summary || participantCount <= 0) {
    return summary;
  }

  const prevBucket = toCompactSummaryBucket(previousStatus);
  const nextBucket = toCompactSummaryBucket(nextStatus);

  if (prevBucket === nextBucket) {
    return summary;
  }

  const removed = applyCompactBucketDelta(summary, prevBucket, -participantCount);
  return applyCompactBucketDelta(removed, nextBucket, participantCount);
}

export function applyTeamVotingSummaryDelta(
  summary: VotingSummary | null | undefined,
  status: TeamVoteStatusValue | null | undefined,
  delta: number
): VotingSummary | null | undefined {
  if (!summary || delta === 0) {
    return summary;
  }

  return applyFullBucketDelta(summary, toFullSummaryBucket(status), delta);
}

export function applyCompactVotingSummaryDelta(
  summary: CompactVotingSummary | undefined,
  status: TeamVoteStatusValue | null | undefined,
  delta: number
): CompactVotingSummary | undefined {
  if (!summary || delta === 0) {
    return summary;
  }

  return applyCompactBucketDelta(summary, toCompactSummaryBucket(status), delta);
}

export function upsertVoteForUser(votes: TeamVoteDTO[] | undefined, vote: TeamVoteDTO): TeamVoteDTO[] {
  if (!votes || votes.length === 0) {
    return [vote];
  }

  const index = votes.findIndex((item) => item.userId === vote.userId);
  if (index < 0) {
    return [...votes, vote];
  }

  const next = votes.slice();
  next[index] = vote;
  return next;
}

interface CreateOptimisticVoteInput {
  matchId: string;
  userId: string;
  status: TeamVoteStatusValue;
  description?: string;
  baseVote?: TeamVoteDTO | null;
}

export function createOptimisticTeamVote({
  matchId,
  userId,
  status,
  description,
  baseVote,
}: CreateOptimisticVoteInput): TeamVoteDTO {
  const timestamp = new Date().toISOString();

  return {
    id: baseVote?.id ?? `optimistic-vote-${matchId}-${userId}`,
    matchId,
    userId,
    status,
    source: baseVote?.source ?? 'TEAM_VOTE',
    description: description ?? null,
    createdAt: baseVote?.createdAt ?? timestamp,
    updatedAt: timestamp,
    userNickname: baseVote?.userNickname ?? null,
    userAvatarUrl: baseVote?.userAvatarUrl ?? null,
    userPositions: baseVote?.userPositions ?? null,
    guestParticipants: baseVote?.guestParticipants ?? [],
  };
}

export function patchPendingVoteItem(
  item: MyPendingTeamVoteMatchDTO,
  status: TeamVoteStatusValue,
  reason: string | null,
  participantCount: number,
  previousStatus: TeamVoteStatusValue | null | undefined
): MyPendingTeamVoteMatchDTO {
  return {
    ...item,
    myVote: status,
    myVoteReason: reason,
    votingSummary:
      applyCompactVotingSummaryTransition(item.votingSummary, previousStatus, status, participantCount) ??
      item.votingSummary,
  };
}
