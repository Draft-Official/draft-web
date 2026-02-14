/**
 * React Query keys for Gym entity
 */
export const gymKeys = {
  all: ['gyms'] as const,
  detail: (id: string) => [...gymKeys.all, 'detail', id] as const,
  byKakaoPlaceId: (kakaoPlaceId: string) => [...gymKeys.all, 'kakao', kakaoPlaceId] as const,
  search: (query: string) => [...gymKeys.all, 'search', query] as const,
};
