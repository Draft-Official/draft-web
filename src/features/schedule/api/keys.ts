/**
 * Match Management Query Keys
 * React Query 캐시 키 관리
 */

export const matchManagementKeys = {
  all: ['schedule'] as const,

  // 내가 주최한 경기 목록
  hostedMatches: (userId: string) =>
    [...matchManagementKeys.all, 'hosted', userId] as const,

  // 내가 참여한 경기 목록 (게스트로 신청한 경기)
  participatingMatches: (userId: string) =>
    [...matchManagementKeys.all, 'participating', userId] as const,

  // 경기 상세 (호스트 관리용)
  matchDetail: (matchId: string) =>
    [...matchManagementKeys.all, 'detail', matchId] as const,

  // 경기 신청자 목록
  applicants: (matchId: string) =>
    [...matchManagementKeys.all, 'applicants', matchId] as const,
};
