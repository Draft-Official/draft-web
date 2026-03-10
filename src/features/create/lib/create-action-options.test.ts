import assert from 'node:assert/strict';
import test from 'node:test';
import { CREATE_ACTION_OPTIONS } from './create-action-options';

test('CREATE_ACTION_OPTIONS exposes exactly two create actions in order', () => {
  assert.deepEqual(
    CREATE_ACTION_OPTIONS.map((option) => option.id),
    ['guest-match', 'team-regular']
  );
});

test('CREATE_ACTION_OPTIONS has user-facing labels for each action', () => {
  assert.deepEqual(
    CREATE_ACTION_OPTIONS.map((option) => option.label),
    ['게스트 경기 생성', '팀 정기운동 생성']
  );
});
