// ============================================
// Model Types
// ============================================
export type {
  ClientTeam,
  CreateTeamInput,
  UpdateTeamInput,
  ClientTeamMember,
  UpdateMemberRoleInput,
  ClientTeamFee,
  UpdateFeeStatusInput,
  VotingSummary,
  TeamVote,
  VoteInput,
  CreateTeamMatchInput,
} from './model/types';

// ============================================
// API Service & Queries
// ============================================
export { TeamService, createTeamService } from './api/team-service';
export type { TeamMemberWithUser, TeamFeeWithUser } from './api/team-service';
export {
  teamKeys,
  teamMemberKeys,
  teamMatchKeys,
  teamFeeKeys,
} from './api/keys';
export {
  teamRowToClient,
  teamMemberRowToClient,
  teamFeeRowToClient,
  formatRegion,
  formatRegularSchedule,
} from './api/mapper';
