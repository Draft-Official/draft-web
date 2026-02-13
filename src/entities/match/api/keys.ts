/**
 * Match Query Keys
 * Structured keys for both GUEST_RECRUIT and TEAM_MATCH
 */

export const matchKeys = {
  all: ['matches'] as const,

  lists: (filter?: { type?: string; status?: string }) =>
    [...matchKeys.all, 'list', filter] as const,

  detail: (id: string) =>
    [...matchKeys.all, 'detail', id] as const,

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
