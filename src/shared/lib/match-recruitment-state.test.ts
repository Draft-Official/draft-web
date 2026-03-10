import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canCreateMatchAt,
  hasMatchStarted,
  isRecruitmentClosed,
  isTeamVotingClosed,
} from './match-recruitment-state';

const START_TIME = '2026-03-10T10:00:00.000Z';

test('hasMatchStarted returns true when now is after start time', () => {
  const started = hasMatchStarted(START_TIME, new Date('2026-03-10T10:00:01.000Z'));
  assert.equal(started, true);
});

test('hasMatchStarted returns true when now equals start time', () => {
  const started = hasMatchStarted(START_TIME, new Date('2026-03-10T10:00:00.000Z'));
  assert.equal(started, true);
});

test('hasMatchStarted returns false when now is before start time', () => {
  const started = hasMatchStarted(START_TIME, new Date('2026-03-10T09:59:59.000Z'));
  assert.equal(started, false);
});

test('isRecruitmentClosed returns true for CLOSED status before start', () => {
  const closed = isRecruitmentClosed(
    { status: 'CLOSED', startTimeISO: START_TIME },
    new Date('2026-03-10T09:00:00.000Z')
  );
  assert.equal(closed, true);
});

test('isRecruitmentClosed returns true for RECRUITING status after start', () => {
  const closed = isRecruitmentClosed(
    { status: 'RECRUITING', startTimeISO: START_TIME },
    new Date('2026-03-10T10:30:00.000Z')
  );
  assert.equal(closed, true);
});

test('isRecruitmentClosed returns false for RECRUITING status before start', () => {
  const closed = isRecruitmentClosed(
    { status: 'RECRUITING', startTimeISO: START_TIME },
    new Date('2026-03-10T09:30:00.000Z')
  );
  assert.equal(closed, false);
});

test('isTeamVotingClosed returns true for start-past matches', () => {
  const closed = isTeamVotingClosed(
    { status: 'RECRUITING', startTimeISO: START_TIME },
    new Date('2026-03-10T11:00:00.000Z')
  );
  assert.equal(closed, true);
});

test('isTeamVotingClosed returns true for CLOSED status', () => {
  const closed = isTeamVotingClosed(
    { status: 'CLOSED', startTimeISO: START_TIME },
    new Date('2026-03-10T09:00:00.000Z')
  );
  assert.equal(closed, true);
});

test('canCreateMatchAt returns true when start time is in the future', () => {
  const creatable = canCreateMatchAt(
    '2026-03-10T12:00:00.000Z',
    new Date('2026-03-10T10:00:00.000Z')
  );
  assert.equal(creatable, true);
});

test('canCreateMatchAt returns false when start time is equal to now', () => {
  const creatable = canCreateMatchAt(
    '2026-03-10T10:00:00.000Z',
    new Date('2026-03-10T10:00:00.000Z')
  );
  assert.equal(creatable, false);
});

test('canCreateMatchAt returns false when start time is in the past', () => {
  const creatable = canCreateMatchAt(
    '2026-03-10T09:59:59.000Z',
    new Date('2026-03-10T10:00:00.000Z')
  );
  assert.equal(creatable, false);
});

test('canCreateMatchAt returns false when start time is invalid', () => {
  const creatable = canCreateMatchAt(
    'not-a-datetime',
    new Date('2026-03-10T10:00:00.000Z')
  );
  assert.equal(creatable, false);
});
