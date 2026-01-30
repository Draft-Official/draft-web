/**
 * 경기 관리 페이지 Mock 데이터
 * Phase 2에서 Supabase API로 대체 예정
 */

import type {
  ManagedMatch,
  Guest,
  Participant,
  HostMatchDetail,
  TeamExerciseDetail,
  TournamentDetail,
  GuestMatchDetail,
  TeamExerciseManageDetail,
  TournamentManageDetail,
} from './types';

export const MOCK_MANAGED_MATCHES: ManagedMatch[] = [
  {
    id: '1',
    type: 'guest',
    status: 'scheduled',
    teamName: '강남 썬더스',
    date: '2025. 01. 20 (월)',
    time: '19:00',
    location: '강남구민체육센터 농구장',
    locationUrl: 'https://map.kakao.com',
    approvalStatus: '확정',
    totalCost: 15000,
  },
  {
    id: '2',
    type: 'host',
    status: 'scheduled',
    teamName: '서초 호퍼스',
    date: '2025. 01. 22 (수)',
    time: '20:00',
    location: '서초구민체육센터 농구장',
    locationUrl: 'https://map.kakao.com',
    applicants: 8,
    vacancies: 2,
  },
  {
    id: '3',
    type: 'team',
    status: 'ongoing',
    teamName: '판교 드래곤즈',
    date: '2025. 01. 13 (월)',
    time: '18:30',
    location: '판교테크노밸리 체육관',
    locationUrl: 'https://map.kakao.com',
    participants: 12,
  },
  {
    id: '4',
    type: 'tournament',
    status: 'scheduled',
    teamName: '용산 매버릭스',
    date: '2025. 01. 25 (토)',
    time: '14:00',
    location: '올림픽공원 농구장',
    locationUrl: 'https://map.kakao.com',
    tournamentName: '2025 서울시 농구대회',
    round: '본선 16강',
  },
  {
    id: '5',
    type: 'guest',
    status: 'pending',
    teamName: '마포 윙스',
    date: '2025. 01. 18 (토)',
    time: '15:00',
    location: '마포구민체육센터',
    locationUrl: 'https://map.kakao.com',
    approvalStatus: '승인대기',
    totalCost: 20000,
  },
  {
    id: '6',
    type: 'host',
    status: 'ended',
    teamName: '강동 이글스',
    date: '2025. 01. 10 (금)',
    time: '19:30',
    location: '강동구민체육센터',
    locationUrl: 'https://map.kakao.com',
    applicants: 10,
    vacancies: 0,
  },
  {
    id: '7',
    type: 'guest',
    status: 'cancelled',
    teamName: '송파 파이어스',
    date: '2025. 01. 15 (수)',
    time: '20:00',
    location: '송파구민체육센터',
    locationUrl: 'https://map.kakao.com',
    approvalStatus: '취소됨',
    totalCost: 18000,
  },
  {
    id: '8',
    type: 'guest',
    status: 'rejected',
    teamName: '노원 스타즈',
    date: '2025. 01. 16 (목)',
    time: '19:00',
    location: '노원구민체육센터',
    locationUrl: 'https://map.kakao.com',
    approvalStatus: '승인거부',
    totalCost: 15000,
  },
  {
    id: '9',
    type: 'team',
    status: 'ended',
    teamName: '강서 피닉스',
    date: '2025. 01. 08 (수)',
    time: '20:00',
    location: '강서구민체육센터',
    locationUrl: 'https://map.kakao.com',
    participants: 10,
  },
  {
    id: '10',
    type: 'tournament',
    status: 'ended',
    teamName: '성북 레이더스',
    date: '2025. 01. 05 (일)',
    time: '13:00',
    location: '성북구민체육센터',
    locationUrl: 'https://map.kakao.com',
    tournamentName: '2024 겨울컵 농구대회',
    round: '예선',
  },
];

// ============================================
// 경기 상세 페이지 Mock 데이터
// ============================================

// 참여자 목록 (팀운동, 대회 공통)
export const MOCK_PARTICIPANTS: Participant[] = [
  { id: '1', name: '김민수', position: '가드 (G)', level: '중급 (Lv.4)', ageGroup: '30대', height: '178cm' },
  { id: '2', name: '이준호', position: '포워드 (F)', level: '상급 (Lv.6)', ageGroup: '20대', height: '185cm' },
  { id: '3', name: '박서연', position: '센터 (C)', level: '중급 (Lv.5)', ageGroup: '30대', height: '190cm' },
  { id: '4', name: '최윤아', position: '가드 (G)', level: '초급 (Lv.2)', ageGroup: '20대', height: '175cm' },
  { id: '5', name: '정태민', position: '포워드 (F)', level: '중급 (Lv.4)', ageGroup: '30대', height: '180cm' },
  { id: '6', name: '강동현', position: '가드 (G)', level: '상급 (Lv.7)', ageGroup: '40대', height: '182cm' },
  { id: '7', name: '오지은', position: '포워드 (F)', level: '중급 (Lv.5)', ageGroup: '20대', height: '177cm' },
  { id: '8', name: '한승우', position: '센터 (C)', level: '초급 (Lv.3)', ageGroup: '30대', height: '188cm' },
  { id: '9', name: '신예진', position: '가드 (G)', level: '중급 (Lv.4)', ageGroup: '20대', height: '176cm' },
  { id: '10', name: '윤성호', position: '포워드 (F)', level: '상급 (Lv.6)', ageGroup: '30대', height: '179cm' },
  { id: '11', name: '임지훈', position: '센터 (C)', level: '중급 (Lv.5)', ageGroup: '20대', height: '192cm' },
  { id: '12', name: '송하린', position: '가드 (G)', level: '초급 (Lv.3)', ageGroup: '30대', height: '174cm' },
];

// 게스트 목록 (호스트 관리용)
export const MOCK_GUESTS: Guest[] = [
  { id: '1', name: '홍길동', position: '가드 (G)', level: '중급 (Lv.4)', ageGroup: '30대', height: '178cm', status: 'pending', matchHistory: { count: 3, lastDate: '2025.01.10' } },
  { id: '2', name: '김철수', position: '포워드 (F)', level: '상급 (Lv.6)', ageGroup: '20대', height: '185cm', status: 'pending' },
  { id: '3', name: '박영희', position: '센터 (C)', level: '중급 (Lv.5)', ageGroup: '30대', height: '190cm', status: 'pending' },
  { id: '4', name: '이민수', position: '가드 (G)', level: '초급 (Lv.2)', ageGroup: '20대', height: '175cm', status: 'payment_waiting' },
  { id: '5', name: '정수진', position: '포워드 (F)', level: '중급 (Lv.4)', ageGroup: '30대', height: '180cm', status: 'payment_waiting' },
  { id: '6', name: '최준호', position: '가드 (G)', level: '상급 (Lv.7)', ageGroup: '40대', height: '182cm', status: 'confirmed' },
  { id: '7', name: '강민지', position: '포워드 (F)', level: '중급 (Lv.5)', ageGroup: '20대', height: '177cm', status: 'confirmed' },
  { id: '8', name: '윤서준', position: '센터 (C)', level: '초급 (Lv.3)', ageGroup: '30대', height: '188cm', status: 'confirmed' },
  { id: '9', name: '오지훈', position: '가드 (G)', level: '중급 (Lv.4)', ageGroup: '20대', height: '176cm', status: 'confirmed' },
  { id: '10', name: '임하은', position: '포워드 (F)', level: '상급 (Lv.6)', ageGroup: '30대', height: '179cm', status: 'rejected' },
];

// 호스트 경기 상세 Mock
export const MOCK_HOST_MATCH_DETAIL: HostMatchDetail = {
  id: '2',
  date: '2025. 01. 22 (수)',
  time: '20:00',
  endTimeISO: '2025-01-22T13:00:00.000Z',
  location: '서초구민체육센터 농구장',
  locationUrl: 'https://map.kakao.com',
  teamName: '서초 호퍼스',
  status: 'RECRUITING',
  recruitmentMode: 'position',
  positionQuotas: [
    { position: 'G', label: '가드', current: 2, max: 2 },
    { position: 'F', label: '포워드', current: 1, max: 2 },
    { position: 'C', label: '센터', current: 0, max: 1 },
  ],
};

// 팀운동 상세 Mock
export const MOCK_TEAM_EXERCISE_DETAIL: TeamExerciseDetail = {
  id: '3',
  teamName: '판교 드래곤즈',
  date: '2025. 01. 13 (월)',
  time: '18:30',
  location: '판교테크노밸리 체육관',
  locationUrl: 'https://map.kakao.com',
  description: '오늘은 속공 연습 + 존 디펜스 연습합니다. 링크의 영상 보고오세요',
  participants: MOCK_PARTICIPANTS,
};

// 대회 상세 Mock
export const MOCK_TOURNAMENT_DETAIL: TournamentDetail = {
  id: '4',
  tournamentName: '2025 서울시 농구대회',
  round: '본선 16강',
  date: '2025. 01. 25 (토)',
  time: '14:00',
  location: '올림픽공원 농구장',
  locationUrl: 'https://map.kakao.com',
  tactics: '1쿼터는 존 디펜스로 시작, 상대 7 집중 마크\n\n2쿼터부터 맨투맨 전환, 속공 적극 활용',
  participants: MOCK_PARTICIPANTS.slice(0, 8),
  teamName: '용산 매버릭스',
};

// 게스트 경기 상세 Mock (게스트 신청용)
export const MOCK_GUEST_MATCH_DETAIL: GuestMatchDetail = {
  id: '1',
  teamName: '팀 슬램덩크',
  hostName: '김농구',
  date: '1월 24일 금요일',
  time: '19:00 ~ 21:00',
  duration: '2시간',
  gymName: '강남구민회관 체육관',
  address: '서울 강남구 삼성로 123',
  locationUrl: 'https://map.kakao.com',
  price: 10000,
  level: '중수 (B) 이상',
  gender: '남성',
  method: '5vs5',
  ageRange: '20대 ~ 30대',
  totalParticipants: 12,
  currentParticipants: 9,
  hostMessage: '승부욕보다는 즐겁게 뛰실 분 환영합니다! 거친 플레이는 지양합니다. 서로 매너 지켜요!',
  positions: [
    { position: 'G', label: '가드', current: 1, max: 1, isOpen: false },
    { position: 'F', label: '포워드', current: 0, max: 2, isOpen: true, canSupportCenter: true },
    { position: 'C', label: '센터', current: 0, max: 1, isOpen: true },
    { position: 'B', label: '빅맨 (F/C)', current: 0, max: 2, isOpen: true },
  ],
  cancellationPolicy: [
    '참가비는 노쇼 방지용으로 사용됩니다. 신청 이후에 환불은 불가합니다.',
    '단, 취소는 가능합니다.',
  ],
  bankInfo: {
    bank: '카카오뱅크',
    account: '3333-01-234567',
    holder: '김농구',
  },
};

// ============================================
// 관리 페이지 Mock 데이터
// ============================================

// 팀운동 관리 상세 Mock
export const MOCK_TEAM_EXERCISE_MANAGE: TeamExerciseManageDetail = {
  id: '3',
  teamName: '판교 드래곤즈',
  date: '2025. 01. 13 (월)',
  time: '18:30',
  location: '판교테크노밸리 체육관',
  locationUrl: 'https://map.kakao.com',
  description: '오늘은 속공 연습 + 존 디펜스 연습합니다. 링크의 영상 보고오세요',
  participants: MOCK_PARTICIPANTS,
};

// 대회 관리 상세 Mock
export const MOCK_TOURNAMENT_MANAGE: TournamentManageDetail = {
  id: '4',
  teamName: '용산 매버릭스',
  tournamentName: '2025 서울시 농구대회',
  round: '본선 16강',
  date: '2025. 01. 25 (토)',
  time: '14:00',
  location: '올림픽공원 농구장',
  locationUrl: 'https://map.kakao.com',
  description: '대회 출전 선수 명단 확정되었습니다. 12시 30분까지 현장 도착 부탁드립니다.',
  participants: MOCK_PARTICIPANTS.slice(0, 10),
};
