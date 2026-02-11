/**
 * Team Feature React Query Keys
 */

export const teamKeys = {
  // 기본 키
  all: ['teams'] as const,

  // 팀 목록
  lists: () => [...teamKeys.all, 'list'] as const,
  myTeams: (userId: string) => [...teamKeys.lists(), 'my', userId] as const,

  // 팀 상세
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
  detailByCode: (code: string) => [...teamKeys.details(), 'code', code] as const,

  // 팀 코드 중복 체크
  codeCheck: (code: string) => [...teamKeys.all, 'code-check', code] as const,
};

export const teamMemberKeys = {
  // 기본 키
  all: ['team-members'] as const,

  // 팀원 목록
  lists: () => [...teamMemberKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamMemberKeys.lists(), teamId] as const,
  pending: (teamId: string) => [...teamMemberKeys.lists(), teamId, 'pending'] as const,

  // 내 멤버십
  myMembership: (teamId: string, userId: string) =>
    [...teamMemberKeys.all, 'my', teamId, userId] as const,

  // 내가 속한 모든 팀의 멤버십
  allMyMemberships: (userId: string) => [...teamMemberKeys.all, 'my-all', userId] as const,
};

export const teamMatchKeys = {
  // 기본 키
  all: ['team-matches'] as const,

  // 팀 매치 목록
  lists: () => [...teamMatchKeys.all, 'list'] as const,
  byTeam: (teamId: string) => [...teamMatchKeys.lists(), teamId] as const,
  upcoming: (teamId: string) => [...teamMatchKeys.lists(), teamId, 'upcoming'] as const,

  // 내 미투표 매치 목록
  myPendingVotes: (userId: string) => [...teamMatchKeys.all, 'my-pending-votes', userId] as const,

  // 매치 상세 (투표 정보 포함)
  details: () => [...teamMatchKeys.all, 'detail'] as const,
  detail: (matchId: string) => [...teamMatchKeys.details(), matchId] as const,

  // 투표 현황
  votingStatus: (matchId: string) => [...teamMatchKeys.all, 'voting', matchId] as const,
  myVote: (matchId: string, userId: string) =>
    [...teamMatchKeys.all, 'my-vote', matchId, userId] as const,
};

export const teamFeeKeys = {
  // 기본 키
  all: ['team-fees'] as const,

  // 회비 목록
  lists: () => [...teamFeeKeys.all, 'list'] as const,
  byTeamMonth: (teamId: string, yearMonth: string) =>
    [...teamFeeKeys.lists(), teamId, yearMonth] as const,

  // 내 회비 상태
  myStatus: (teamId: string, userId: string, yearMonth: string) =>
    [...teamFeeKeys.all, 'my', teamId, userId, yearMonth] as const,

  // 팀 회비 요약
  summary: (teamId: string, yearMonth: string) =>
    [...teamFeeKeys.all, 'summary', teamId, yearMonth] as const,
};
