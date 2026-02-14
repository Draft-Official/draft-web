/**
 * Match Query Keys
 * Single source of truth for match-related React Query keys
 */

export const matchKeys = {
  all: ['matches'] as const,

  lists: (filters?: Record<string, unknown>) =>
    filters
      ? ([...matchKeys.all, 'list', filters] as const)
      : ([...matchKeys.all, 'list'] as const),

  // alias for backward compatibility
  list: (filters?: Record<string, unknown>) =>
    matchKeys.lists(filters),

  listInfinite: (filters?: Record<string, unknown>) =>
    filters
      ? ([...matchKeys.lists(), 'infinite', filters] as const)
      : ([...matchKeys.lists(), 'infinite'] as const),

  details: () =>
    [...matchKeys.all, 'detail'] as const,

  detail: (id: string) =>
    [...matchKeys.details(), id] as const,

  byHost: (hostId: string) =>
    [...matchKeys.all, 'host', hostId] as const,

  // Guest Recruit specific
  guestRecruit: {
    all: ['matches', 'guest-recruit'] as const,
    recruiting: () => [...matchKeys.guestRecruit.all, 'recruiting'] as const,
    detail: (id: string) => [...matchKeys.guestRecruit.all, 'detail', id] as const,
  },

  // Team Match specific
  teamMatch: {
    all: ['matches', 'team-match'] as const,
    upcoming: () => [...matchKeys.teamMatch.all, 'upcoming'] as const,
    detail: (id: string) => [...matchKeys.teamMatch.all, 'detail', id] as const,
  },
} as const;
