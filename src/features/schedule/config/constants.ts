/**
 * 경기 관리 페이지 상수 정의
 * Config-Driven UI 패턴 적용
 */

import type {
  MatchType,
  MatchStatus,
  FilterOption,
  MatchManagementType,
} from '../model/types';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';

// 경기 타입 필터 옵션 (참여 모드 - guest 제외, 중복선택용)
export const MATCH_TYPE_FILTER_OPTIONS: FilterOption<Exclude<MatchType, 'host'>>[] = [
  { value: 'guest', label: '게스트' },
  { value: 'team', label: '팀운동' },
  { value: 'tournament', label: '대회' },
];

// 경기 타입 필터 옵션 (관리 모드 - guest 제외, 중복선택용)
export const HOST_TYPE_FILTER_OPTIONS: FilterOption<Exclude<MatchType, 'guest'>>[] = [
  { value: 'host', label: '게스트' },
  { value: 'team', label: '팀운동' },
  { value: 'tournament', label: '대회' },
];

// 경기 상태 필터 옵션 - 참여 모드 (중복선택용)
export const GUEST_STATUS_FILTER_OPTIONS: FilterOption<'pending' | 'payment_waiting' | 'voting' | 'confirmed' | 'ended' | 'cancelled'>[] = [
  { value: 'pending', label: '승인 대기' },
  { value: 'payment_waiting', label: '결제 대기' },
  { value: 'voting', label: '투표 중' },
  { value: 'confirmed', label: '확정' },
  { value: 'ended', label: '종료' },
  { value: 'cancelled', label: '취소/거절' },
];

// 경기 상태 필터 옵션 - 관리 모드 (중복선택용)
export const HOST_STATUS_FILTER_OPTIONS: FilterOption<'recruiting' | 'closed' | 'voting' | 'confirmed' | 'ended' | 'cancelled'>[] = [
  { value: 'recruiting', label: '모집 중' },
  { value: 'closed', label: '모집 마감' },
  { value: 'voting', label: '투표 중' },
  { value: 'confirmed', label: '경기 확정' },
  { value: 'ended', label: '종료' },
  { value: 'cancelled', label: '취소' },
];

// 경기 타입별 레이블
export const MATCH_TYPE_LABELS: Record<MatchType, string> = {
  guest: '게스트',
  host: '호스트',
  team: '팀운동',
  tournament: '대회',
};

// 경기 타입별 색상 (Tailwind classes)
export const MATCH_TYPE_COLORS: Record<MatchType, string> = {
  guest: 'bg-blue-500/10 text-blue-700 border-blue-500/20',
  host: 'bg-draft-500/10 text-primary border-draft-500/20',
  team: 'bg-green-500/10 text-green-700 border-green-500/20',
  tournament: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
};

// 관리 도메인 타입별 레이블
export const MANAGEMENT_TYPE_LABELS: Record<MatchManagementType, string> = {
  guest_recruitment: '게스트',
  team_exercise: '팀운동',
  tournament: '대회',
};

// 관리 도메인 타입별 색상 (Tailwind classes)
export const MANAGEMENT_TYPE_COLORS: Record<MatchManagementType, string> = {
  guest_recruitment: 'bg-draft-500/10 text-primary border-draft-500/20',
  team_exercise: 'bg-green-500/10 text-green-700 border-green-500/20',
  tournament: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
};

// 팀운동 투표 상태 배지 색상 (타입 배지와 같은 톤)
export const TEAM_EXERCISE_VOTE_BADGE_COLORS: Record<TeamVoteStatusValue, string> = {
  PENDING: 'bg-yellow-500/10 text-yellow-700 border-yellow-500/20',
  CONFIRMED: 'bg-green-500/10 text-green-700 border-green-500/20',
  LATE: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  NOT_ATTENDING: 'bg-red-500/10 text-red-700 border-red-500/20',
  MAYBE: 'bg-slate-500/10 text-slate-700 border-slate-500/20',
};

// 경기 상태별 레이블
export const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
  recruiting: '모집 중',
  waiting: '승인 대기',
  payment_waiting: '결제 대기',
  voting: '투표 중',
  confirmed: '경기 확정',
  ongoing: '경기 중',
  ended: '종료',
  cancelled: '취소',
  // Legacy
  scheduled: '경기 확정',
  pending: '승인 대기',
  closed: '모집 마감',
  rejected: '취소',
};

// 경기 상태별 색상 (Tailwind classes)
export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  recruiting: 'bg-blue-100 text-blue-700 border-blue-200',
  waiting: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  payment_waiting: 'bg-brand-weak-pressed text-brand-contrast border-brand-stroke-weak',
  voting: 'bg-blue-100 text-blue-700 border-blue-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  ongoing: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  ended: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
  // Legacy
  scheduled: 'bg-slate-100 text-slate-700 border-slate-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  closed: 'bg-purple-100 text-purple-700 border-purple-200',
  rejected: 'bg-gray-100 text-gray-500 border-gray-200',
};

// 지난 경기로 간주되는 상태
export const PAST_MATCH_STATUSES: MatchStatus[] = ['ended', 'cancelled', 'rejected'];

// ============================================
// 게스트 신청 상태 텍스트 (게스트 뷰용)
// ============================================

// Application DB status → UI text mapping for guest view
// Note: Uses combined statuses different from host view
export const GUEST_APPROVAL_STATUS_TEXT = {
  CONFIRMED: '경기 확정',
  REJECTED: '종료/취소',
  CANCELED: '종료/취소',
  PAYMENT_WAITING: '결제 대기',  // PENDING + approved_at
  PENDING: '승인 대기',
} as const;
