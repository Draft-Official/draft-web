/**
 * Host Dashboard Mock 데이터
 */

import { Match, Applicant, Team, ApplicantStatus, MatchStatus } from './types';

export const MOCK_TEAM: Team = {
  id: '1',
  name: '슬램덩크',
  leaderName: '강백호',
  memberCount: 12,
  avatar: 'https://github.com/shadcn.png',
};

export const MOCK_MATCHES: Match[] = [
  {
    id: '1',
    title: '강남 금요일 농구',
    gymName: '강남구민회관 체육관',
    date: '1. 24 (금)',
    time: '19:00',
    status: 'recruiting',
    type: 'TEAM',
    stats: { total: 12, confirmed: 10, left: 2 },
    pendingCount: 2,
    isPast: false,
  },
  {
    id: '2',
    title: '주말 오전 빡겜',
    gymName: '서초종합체육관',
    date: '1. 26 (일)',
    time: '10:00',
    status: 'closing_soon',
    type: 'SOLO',
    stats: { total: 15, confirmed: 12, left: 0 },
    pendingCount: 0,
    isPast: false,
  },
  {
    id: '3',
    title: '지난 경기',
    gymName: '반포종합체육관',
    date: '1. 10 (금)',
    time: '20:00',
    status: 'closed',
    type: 'TEAM',
    stats: { total: 10, confirmed: 10, left: 0 },
    pendingCount: 0,
    isPast: true,
  },
];

export const MOCK_APPLICANTS: Applicant[] = [
  {
    id: '1',
    nickname: '강백호',
    position: 'F',
    level: '초보',
    height: '189cm',
    status: ApplicantStatus.PENDING,
    mannerTemp: 38.2,
    noshowCount: 0,
    attendanceRate: 98,
    tags: ['🏃 하슬플레이', '💪 리바운드'],
  },
  {
    id: '2',
    nickname: '서태웅',
    position: 'F',
    level: '고수',
    height: '187cm',
    status: ApplicantStatus.CHECKING,
    mannerTemp: 41.5,
    noshowCount: 0,
    attendanceRate: 100,
    tags: ['🅰️ 패스마스터', '🛡️ 수비요정'],
  },
  {
    id: '3',
    nickname: '정대만',
    position: 'G',
    level: '중수',
    height: '184cm',
    status: ApplicantStatus.CONFIRMED,
    mannerTemp: 36.5,
    noshowCount: 2,
    attendanceRate: 85,
    tags: ['🔥 3점슈터'],
  },
  {
    id: '4',
    nickname: '송태섭',
    position: 'G',
    level: '중수',
    height: '168cm',
    status: ApplicantStatus.REJECTED,
    mannerTemp: 39.0,
    noshowCount: 0,
    attendanceRate: 99,
    tags: ['⚡️ 스피드'],
  },
];
