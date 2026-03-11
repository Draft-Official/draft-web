import test from 'node:test';
import assert from 'node:assert/strict';
import { MATCH_TYPE_ICON_TOKENS } from '@/features/schedule/config/constants';

test('MATCH_TYPE_ICON_TOKENS maps each match type to stable icon tokens', () => {
  assert.deepEqual(MATCH_TYPE_ICON_TOKENS, {
    guest: 'user',
    host: 'crown',
    team: 'users',
    tournament: 'trophy',
  });
});
