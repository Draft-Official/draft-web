import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { rollbackSnapshot, rollbackSnapshots } from './query-cache-rollback';

test('rollbackSnapshot restores cached value when snapshot exists', () => {
  const queryClient = new QueryClient();
  const key = ['sample', 'query'] as const;

  queryClient.setQueryData(key, { value: 1 });
  rollbackSnapshot(queryClient, key, { value: 2 });

  assert.deepEqual(queryClient.getQueryData(key), { value: 2 });
});

test('rollbackSnapshot removes query when snapshot is undefined', () => {
  const queryClient = new QueryClient();
  const key = ['sample', 'query'] as const;

  queryClient.setQueryData(key, { value: 1 });
  rollbackSnapshot(queryClient, key, undefined);

  assert.equal(queryClient.getQueryData(key), undefined);
});

test('rollbackSnapshots restores mixed snapshot list', () => {
  const queryClient = new QueryClient();
  const keepKey = ['keep'] as const;
  const removeKey = ['remove'] as const;

  queryClient.setQueryData(keepKey, { value: 'before' });
  queryClient.setQueryData(removeKey, { value: 'before' });

  rollbackSnapshots(queryClient, [
    [keepKey, { value: 'after' }],
    [removeKey, undefined],
  ]);

  assert.deepEqual(queryClient.getQueryData(keepKey), { value: 'after' });
  assert.equal(queryClient.getQueryData(removeKey), undefined);
});
