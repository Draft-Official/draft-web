import test from 'node:test';
import assert from 'node:assert/strict';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from './operation-tracker';

test('newly started operation is latest for the same resource', () => {
  const token = beginOptimisticOperation('vote|match-1|user-1');

  assert.equal(isLatestOptimisticOperation(token), true);

  finishOptimisticOperation(token);
});

test('older operation is no longer latest when newer one starts', () => {
  const first = beginOptimisticOperation('vote|match-2|user-1');
  const second = beginOptimisticOperation('vote|match-2|user-1');

  assert.equal(isLatestOptimisticOperation(first), false);
  assert.equal(isLatestOptimisticOperation(second), true);

  finishOptimisticOperation(first);
  finishOptimisticOperation(second);
});

test('finishing stale operation does not release latest operation lock', () => {
  const first = beginOptimisticOperation('vote|match-4|user-1');
  const second = beginOptimisticOperation('vote|match-4|user-1');

  finishOptimisticOperation(first);

  assert.equal(isLatestOptimisticOperation(second), true);

  finishOptimisticOperation(second);
});

test('finishing latest operation clears the resource lock', () => {
  const token = beginOptimisticOperation('vote|match-3|user-2');

  finishOptimisticOperation(token);

  assert.equal(isLatestOptimisticOperation(token), false);
});

test('buildOptimisticResourceKey creates deterministic escaped key', () => {
  const key = buildOptimisticResourceKey('team-vote', 'match/1', 'user:1', null, undefined);

  assert.equal(key, 'team-vote|match%2F1|user%3A1|null|undefined');
});
