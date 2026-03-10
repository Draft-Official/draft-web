import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Node test runner loads TypeScript files with explicit extension.
import { buildTeamVoteReminderMessage, toKakaoShareText } from './team-vote-reminder.ts';

test('buildTeamVoteReminderMessage builds the agreed reminder format', () => {
  const message = buildTeamVoteReminderMessage({
    teamName: '드래프트',
    matchDateTime: '2026. 03. 12 (목) 20:00',
    pendingCount: 3,
    voteUrl: 'https://draft.kr/team/draft/matches/abc123',
    attendingCount: 8,
    notAttendingCount: 2,
    maybeCount: 3,
  });

  assert.equal(
    message,
    [
      '[드래프트] 2026. 03. 12 (목) 20:00',
      '',
      '운동 인원 확정을 위해 투표 부탁드립니다',
      '',
      '미투표: 3명',
      '투표 링크: https://draft.kr/team/draft/matches/abc123',
      '투표 결과: 참석 8 / 불참 2 / 미정 3',
    ].join('\n')
  );
});

test('buildTeamVoteReminderMessage renders zero pending count as 0명', () => {
  const message = buildTeamVoteReminderMessage({
    teamName: '드래프트',
    matchDateTime: '2026. 03. 12 (목) 20:00',
    pendingCount: 0,
    voteUrl: 'https://draft.kr/team/draft/matches/abc123',
    attendingCount: 8,
    notAttendingCount: 2,
    maybeCount: 3,
  });

  assert.match(message, /미투표: 0명/u);
});

test('buildTeamVoteReminderMessage clamps negative pending count to 0명', () => {
  const message = buildTeamVoteReminderMessage({
    teamName: '드래프트',
    matchDateTime: '2026. 03. 12 (목) 20:00',
    pendingCount: -2,
    voteUrl: 'https://draft.kr/team/draft/matches/abc123',
    attendingCount: 10,
    notAttendingCount: 0,
    maybeCount: 0,
  });

  assert.match(message, /미투표: 0명/u);
});

test('toKakaoShareText keeps message unchanged when under length limit', () => {
  const text = '짧은 메시지';
  assert.equal(toKakaoShareText(text, 200), text);
});

test('toKakaoShareText truncates message and appends ellipsis over length limit', () => {
  const text = 'a'.repeat(210);
  const result = toKakaoShareText(text, 200);

  assert.equal(result.length, 200);
  assert.equal(result.endsWith('…'), true);
});
