/**
 * Application Query Keys
 */
export const applicationKeys = {
  all: ['applications'] as const,
  byMatch: (matchId: string) => [...applicationKeys.all, 'match', matchId] as const,
  byUser: (userId: string) => [...applicationKeys.all, 'user', userId] as const,
  detail: (id: string) => [...applicationKeys.all, 'detail', id] as const,
};
