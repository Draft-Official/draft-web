/**
 * Host Dashboard 관련 타입 정의
 */

export type MatchStatus = 'recruiting' | 'closing_soon' | 'closed' | 'canceled';
export type ApplicantStatus = 'pending' | 'checking' | 'confirmed' | 'rejected';
export type MatchType = 'TEAM' | 'SOLO';
export type Position = 'G' | 'F' | 'C' | 'Big';

export interface Match {
  id: string;
  title: string;
  gymName: string;
  date: string; // YYYY. MM. DD (Day)
  time: string; // HH:mm
  status: MatchStatus;
  type: MatchType;
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}

export interface Applicant {
  id: string;
  nickname: string;
  position: Position;
  level: string;
  height: string;
  status: ApplicantStatus;
  avatar?: string;
  tags: string[];
  mannerTemp: number; // 36.5
  noshowCount: number;
  attendanceRate: number; // 0-100
}

export interface Team {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  avatar?: string;
}
