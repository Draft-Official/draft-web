/**
 * 경기 관리 페이지 상수 정의
 * Config-Driven UI 패턴 적용
 */

import type { MatchType, MatchStatus, FilterOption } from '../model/types';

// 경기 타입 필터 옵션 (게스트 모드에서만 사용 - host 제외, 중복선택용)
export const MATCH_TYPE_FILTER_OPTIONS: FilterOption<Exclude<MatchType, 'host'>>[] = [
  { value: 'guest', label: '게스트' },
  { value: 'team', label: '팀운동' },
  { value: 'tournament', label: '대회' },
];

// 경기 상태 필터 옵션 (기본 4가지만 표시, 중복선택용)
export const MATCH_STATUS_FILTER_OPTIONS: FilterOption<'scheduled' | 'ongoing' | 'ended' | 'cancelled'>[] = [
  { value: 'scheduled', label: '예정' },
  { value: 'ongoing', label: '진행중' },
  { value: 'ended', label: '종료' },
  { value: 'cancelled', label: '취소' },
];

// 지난 경기 필터 옵션
export const PAST_MATCH_FILTER_OPTIONS: FilterOption<'hide' | 'show'>[] = [
  { value: 'hide', label: '숨기기' },
  { value: 'show', label: '보이기' },
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
  scheduled: '예정',
  ongoing: '진행중',
  ended: '종료',
  cancelled: '취소',
  pending: '승인대기',
  confirmed: '확정',
  closed: '마감',
  rejected: '승인거부',
};

// 경기 상태별 색상 (Tailwind classes)
export const MATCH_STATUS_COLORS: Record<MatchStatus, string> = {
  scheduled: 'bg-slate-100 text-slate-700 border-slate-200',
  ongoing: 'bg-green-100 text-green-700 border-green-200',
  ended: 'bg-gray-100 text-gray-500 border-gray-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  closed: 'bg-purple-100 text-purple-700 border-purple-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
};

// 지난 경기로 간주되는 상태
export const PAST_MATCH_STATUSES: MatchStatus[] = ['ended', 'cancelled', 'rejected'];
