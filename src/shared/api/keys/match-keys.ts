/**
 * Match Query Keys
 * React Query 캐시 키 관리
 *
 * match, match-create 등 여러 feature에서 공유
 */

export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    filters
      ? ([...matchKeys.lists(), filters] as const)
      : matchKeys.lists(),
  listInfinite: (filters?: Record<string, unknown>) =>
    filters
      ? ([...matchKeys.lists(), 'infinite', filters] as const)
      : ([...matchKeys.lists(), 'infinite'] as const),
  details: () => [...matchKeys.all, 'detail'] as const,
  detail: (id: string) => [...matchKeys.details(), id] as const,
  byHost: (hostId: string) => [...matchKeys.all, 'host', hostId] as const,
};
