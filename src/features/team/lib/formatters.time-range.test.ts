import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTeamMatchTime } from '@/features/team/lib/formatters';

test('formatTeamMatchTime returns time range when end time is provided', () => {
  const result = formatTeamMatchTime('2026-03-11T11:00:00.000Z', '2026-03-11T13:00:00.000Z');
  assert.equal(result, '20:00 ~ 22:00');
});
