// ============================================
// Model Types
// ============================================
export type {
  TeamInfoDTO,
  MyTeamListItemDTO,
  TeamMembershipDTO,
  TeamMemberListItemDTO,
  TeamVoteDTO,
  TeamScheduleMatchItemDTO,
  TeamMatchDetailDTO,
  MyPendingTeamVoteMatchDTO,
  TeamMatchWithVoting,
  TeamProfileCardData,
  TeamListItem,
  Team,
  LegacyTeamCard,
  LegacyMatchCard,
  Position,
} from './model/types';
export { MatchStatus, ApplicantStatus } from './model/types';

// ============================================
// API (Re-export from sub-modules)
// ============================================
// Team feature has complex API structure (core/membership/match)
// Exporting from api/index.ts which manages sub-modules
export * from './api';

// ============================================
// UI Components (Re-export from sub-modules)
// ============================================
// Team feature has many UI components organized in subdirectories
// Exporting from ui/index.ts which manages components
export * from './ui';
