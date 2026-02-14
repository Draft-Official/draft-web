// ============================================
// Model Types
// ============================================
export type { ApplicationSourceValue } from '@/shared/config/team-constants';
export type {
  Applicant,
  ApplyCompanionDTO,
  ApplyFormDTO,
  ApplyModalViewDTO,
  CreateApplicationDTO,
  UserApplicationItemDTO,
  UserTeamOptionDTO,
} from './model/types';

// ============================================
// Mappers
// ============================================
export {
  buildCreateApplicationDTO,
  buildProfileUpdateFromApplyForm,
  sessionProfileToApplyFormDTO,
  sessionProfileToApplyModalViewDTO,
  toUserApplicationItemDTO,
  toUserTeamOptionDTO,
} from './lib';

// ============================================
// API & Queries
// ============================================
export { applicationKeys } from './api/keys';
export { useUserTeams, useUserApplications } from './api/queries';
export { useCreateApplication, useCancelApplication } from './api/mutations';

// ============================================
// UI Components
// ============================================
export { ApplyModal } from './ui/apply-modal';
