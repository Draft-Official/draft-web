// ============================================
// API Keys & Queries
// ============================================
export { matchManagementKeys } from './api/keys';
export {
  useHostedMatches,
  useParticipatingMatches,
  useHostMatchDetail,
  useMatchApplicants,
} from './api/queries';

// ============================================
// Mutations
// ============================================
export {
  useApproveApplication,
  useConfirmPaymentByGuest,
  useConfirmPaymentByHost,
  useVerifyPayment,
  useRejectApplication,
  useCancelApplicationByGuest,
  useCancelParticipation,
} from './api/application-mutations';
export {
  useUpdateMatchStatus,
  useUpdateRecruitmentSetup,
  useCancelMatchFlow,
} from './api/match-mutations';
export { useCreateAnnouncement } from './api/announcement-mutations';

// ============================================
// Utilities & Mappers
// ============================================
export {
  resolveApplicationStatus,
  toParticipatingMatchStatus,
  toApprovalStatusText,
} from './lib/status-utils';
export {
  getGuestStatus,
  applicationToGuest,
  matchToManagedMatch,
  matchToHostMatchDetail,
} from './lib/mappers';

// ============================================
// UI Components
// ============================================
export { MatchManagementView } from './ui/match-management-view';

// Detail views
export { HostMatchDetailView } from './ui/detail/host-match-detail-view';
export { TeamExerciseDetailView } from './ui/detail/team-exercise-detail-view';
export { TeamExerciseManageView } from './ui/detail/team-exercise-manage-view';
export { TournamentDetailView } from './ui/detail/tournament-detail-view';
export { TournamentManageView } from './ui/detail/tournament-manage-view';
