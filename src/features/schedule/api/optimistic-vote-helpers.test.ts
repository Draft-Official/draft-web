import test from 'node:test';
import assert from 'node:assert/strict';
import type { InfiniteData } from '@tanstack/react-query';
import type { ScheduleMatchListItemDTO } from '../model/types';
import { applyScheduleVoteOptimisticUpdate } from './optimistic-vote-helpers';

function createScheduleMatch(overrides: Partial<ScheduleMatchListItemDTO> = {}): ScheduleMatchListItemDTO {
  return {
    id: 'match-1',
    publicId: 'M12345',
    managementType: 'team_exercise',
    matchType: 'team',
    scheduleMode: 'participating',
    status: 'voting',
    teamName: '드래프트',
    date: '3/10',
    time: '20:00',
    startTimeISO: '2026-03-10T20:00:00.000Z',
    location: '체육관',
    myVote: 'PENDING',
    myVoteReason: undefined,
    votingSummary: {
      attending: 3,
      notAttending: 2,
      pending: 5,
    },
    type: 'team',
    ...overrides,
  };
}

test('applyScheduleVoteOptimisticUpdate updates target match vote fields in infinite cache', () => {
  const baseData: InfiniteData<{ matches: ScheduleMatchListItemDTO[]; nextCursor: number | undefined }> = {
    pages: [
      {
        matches: [createScheduleMatch({ id: 'match-1' }), createScheduleMatch({ id: 'match-2' })],
        nextCursor: undefined,
      },
    ],
    pageParams: [0],
  };

  const next = applyScheduleVoteOptimisticUpdate(baseData, 'match-1', 'CONFIRMED', '참석합니다');
  const first = next.pages[0].matches[0];
  const second = next.pages[0].matches[1];

  assert.equal(first.myVote, 'CONFIRMED');
  assert.equal(first.myVoteReason, '참석합니다');
  assert.equal(second.myVote, 'PENDING');
});

test('applyScheduleVoteOptimisticUpdate keeps reference when target match not found', () => {
  const baseData: InfiniteData<{ matches: ScheduleMatchListItemDTO[]; nextCursor: number | undefined }> = {
    pages: [{ matches: [createScheduleMatch({ id: 'match-1' })], nextCursor: undefined }],
    pageParams: [0],
  };

  const next = applyScheduleVoteOptimisticUpdate(baseData, 'missing-match', 'LATE', '늦참');

  assert.equal(next, baseData);
});
