import test from 'node:test';
import assert from 'node:assert/strict';
import type { TeamVoteDTO } from '@/features/team/model/types';
import {
  applyCompactVotingSummaryTransition,
  applyTeamVotingSummaryTransition,
  participantCountFromVote,
  upsertVoteForUser,
} from './optimistic-vote-helpers';

function createVote(overrides: Partial<TeamVoteDTO> = {}): TeamVoteDTO {
  return {
    id: 'vote-1',
    matchId: 'match-1',
    userId: 'user-1',
    status: 'PENDING',
    source: 'TEAM_VOTE',
    description: null,
    createdAt: null,
    updatedAt: null,
    userNickname: null,
    userAvatarUrl: null,
    userPositions: null,
    guestParticipants: [],
    ...overrides,
  };
}

test('participantCountFromVote counts owner + guests', () => {
  assert.equal(participantCountFromVote(undefined), 1);
  assert.equal(
    participantCountFromVote(createVote({ guestParticipants: [{ name: '게스트A', position: 'G' }] })),
    2
  );
});

test('applyTeamVotingSummaryTransition moves count between buckets', () => {
  const previous = {
    pending: 4,
    attending: 3,
    late: 2,
    maybe: 1,
    notAttending: 2,
    totalMembers: 12,
  };

  const next = applyTeamVotingSummaryTransition(previous, 'PENDING', 'LATE', 2);

  assert.deepEqual(next, {
    pending: 2,
    attending: 3,
    late: 4,
    maybe: 1,
    notAttending: 2,
    totalMembers: 12,
  });
});

test('applyCompactVotingSummaryTransition supports MAYBE transition without negative values', () => {
  const previous = {
    attending: 2,
    notAttending: 1,
    pending: 3,
  };

  const next = applyCompactVotingSummaryTransition(previous, 'CONFIRMED', 'MAYBE', 3);

  assert.deepEqual(next, {
    attending: 0,
    notAttending: 1,
    pending: 3,
  });
});

test('upsertVoteForUser updates existing vote in-place by user id', () => {
  const list = [
    createVote({ id: 'v-1', userId: 'user-1', status: 'PENDING' }),
    createVote({ id: 'v-2', userId: 'user-2', status: 'CONFIRMED' }),
  ];
  const updated = createVote({ id: 'server-v-1', userId: 'user-1', status: 'LATE', description: '지각' });

  const next = upsertVoteForUser(list, updated);

  assert.equal(next.length, 2);
  assert.equal(next[0].id, 'server-v-1');
  assert.equal(next[0].status, 'LATE');
  assert.equal(next[0].description, '지각');
});

test('upsertVoteForUser appends when user vote does not exist', () => {
  const list = [createVote({ id: 'v-1', userId: 'user-1' })];
  const updated = createVote({ id: 'v-2', userId: 'user-2', status: 'CONFIRMED' });

  const next = upsertVoteForUser(list, updated);

  assert.equal(next.length, 2);
  assert.equal(next[1].userId, 'user-2');
});
