/**
 * 경기 관리 페이지 상수 정의
 * Config-Driven UI 패턴 적용
 */

import type { MatchType, MatchStatus, FilterOption } from '../model/types';

// 경기 타입 필터 옵션 (참여 모드 - guest 제외, 중복선택용)
export const MATCH_TYPE_FILTER_OPTIONS: FilterOption<Exclude<MatchType, 'host'>>[] = [
  { value: 'guest', label: '게스트' },
  { value: 'team', label: '팀운동' },
  { value: 'tournament', label: '대회' },
];

// 경기 타입 필터 옵션 (관리 모드 - guest 제외, 중복선택용)
export const HOST_TYPE_FILTER_OPTIONS: FilterOption<Exclude<MatchType, 'guest'>>[] = [
  { value: 'host', label: '호스트' },
  { value: 'team', label: '팀운동' },
  { value: 'tournament', label: '대회' },
];

// 경기 상태 필터 옵션 (중복선택용)
export const MATCH_STATUS_FILTER_OPTIONS: FilterOption<'waiting' | 'confirmed' | 'ongoing' | 'ended'>[] = [
  { value: 'waiting', label: '대기 중' },
  { value: 'confirmed', label: '경기 확정' },
  { value: 'ongoing', label: '경기 중' },
  { value: 'ended', label: '종료/취소' },
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
  host: 'bg-orange-500/10 text-primary border-orange-500/20',
  team: 'bg-green-500/10 text-green-700 border-green-500/20',
  tournament: 'bg-purple-500/10 text-purple-700 border-purple-500/20',
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
  payment_waiting: 'bg-orange-100 text-orange-700 border-orange-200',
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
