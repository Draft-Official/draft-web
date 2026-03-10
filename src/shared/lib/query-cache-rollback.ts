import type { QueryClient } from '@tanstack/react-query';

export type QuerySnapshot<T = unknown> = readonly [readonly unknown[], T | undefined];

export function rollbackSnapshot<T>(
  queryClient: QueryClient,
  queryKey: readonly unknown[],
  snapshot: T | undefined
) {
  if (typeof snapshot === 'undefined') {
    queryClient.removeQueries({ queryKey, exact: true });
    return;
  }

  queryClient.setQueryData(queryKey, snapshot);
}

export function rollbackSnapshots(
  queryClient: QueryClient,
  snapshots: QuerySnapshot[]
) {
  for (const [queryKey, snapshot] of snapshots) {
    rollbackSnapshot(queryClient, queryKey, snapshot);
  }
}
