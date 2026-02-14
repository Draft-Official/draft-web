// ============================================
// Model Types
// ============================================
export type {
  ClientMatch,
  CreateMatchInput,
  UpdateMatchInput,
} from './model/types';

// ============================================
// API Service & Queries
// ============================================
export { MatchService, createMatchService } from './api/match-service';
export { matchKeys } from './api/keys';
export { useMatches, useMatch } from './api/queries';
export { useCreateMatch, useUpdateMatch } from './api/mutations';
