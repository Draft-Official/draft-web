// ============================================
// Model Types
// ============================================
export type {
  Location,
  PriceInfo,
  PositionStatus,
  PositionStatusUI,
  BaseMatch,
  HostDashboardMatch,
  MatchOptionsUI,
  PositionsUI,
  ContactInfo,
  GuestListMatch,
  MatchDetailUI,
} from './model/types';

// ============================================
// API & Queries
// ============================================
export { matchKeys } from '@/entities/match';
export { useRecruitingMatches, useMatch, useRecruitingMatchesInfinite } from './api/queries';
export { matchRowToGuestListMatch, guestListMatchToMatch } from './api/match-mapper';

// ============================================
// Utilities
// ============================================
export type { DateOption, FilterOptions } from './lib/utils';
export {
  getNext14Days,
  formatDateISO,
  getDayLabel,
  getShortDayLabel,
  isNewMatch,
  filterMatches,
  groupMatchesByDate,
} from './lib/utils';

// ============================================
// UI Components
// ============================================
export { FilterBar } from './ui/filter-bar';
export { MatchDetailView } from './ui/match-detail-view';
export { MatchListItem } from './ui/match-list-item';
