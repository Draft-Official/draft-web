import test from 'node:test';
import assert from 'node:assert/strict';
import { formatMatchTimeRange } from '@/shared/lib/datetime';

test('formatMatchTimeRange formats start and end in KST', () => {
  const result = formatMatchTimeRange('2026-03-11T11:00:00.000Z', '2026-03-11T13:00:00.000Z');
  assert.equal(result, '20:00 ~ 22:00');
});

test('formatMatchTimeRange falls back to start time when end is missing', () => {
  const result = formatMatchTimeRange('2026-03-11T11:00:00.000Z');
  assert.equal(result, '20:00');
});
