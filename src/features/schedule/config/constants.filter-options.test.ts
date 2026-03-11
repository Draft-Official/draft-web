import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MATCH_TYPE_FILTER_OPTIONS,
  HOST_TYPE_FILTER_OPTIONS,
} from '@/features/schedule/config/constants';

test('schedule match type filters hide tournament option for now', () => {
  assert.deepEqual(
    MATCH_TYPE_FILTER_OPTIONS.map((option) => option.value),
    ['guest', 'team']
  );

  assert.deepEqual(
    HOST_TYPE_FILTER_OPTIONS.map((option) => option.value),
    ['host', 'team']
  );
});
