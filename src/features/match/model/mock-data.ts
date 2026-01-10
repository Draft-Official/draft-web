export type PositionStatus = {
  status: 'open' | 'closed';
  max: number;  // 모집 정원 (e.g. 2 means 0/2)
};

/**
 * Match 인터페이스 (Guest List/Detail용)
 *
 * Phase 2 확장성 준수:
 * - facilities: JSONB 스타일 (parking, shower 등 하드코딩 제거)
 * - 공통 타입은 @/shared/types/match 참조
 */
export interface Match {
  id: string;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  location: string; // e.g., "강남구민회관" (Display Name)
  address: string;  // e.g., "서울 강남구 대치동 123" (Filtering Key)
  price: string;    // e.g., "10,000원"
  priceNum: number; // e.g., 10000 (for filtering)
  teamName?: string; // e.g., "팀 슬램덩크"
  positions: {
    all?: PositionStatus; // 포지션 무관
    g?: PositionStatus;   // 가드
    f?: PositionStatus;   // 포워드
    c?: PositionStatus;   // 센터
    bigman?: PositionStatus; // 빅맨 (F/C)
  };
  isClosed?: boolean;

  // Phase 2 확장성: facilities를 JSONB 스타일로 관리
  // parking, shower 등을 개별 필드로 하드코딩하지 않음
  facilities?: Record<string, any>; // { parking: 'free', shower: true, equipment: 'provided' }

  // Detail Fields typical for Match Create Form
  gender?: 'men' | 'women' | 'mixed';
  courtType?: 'indoor' | 'outdoor';

  // Guest Detail View Fields
  level?: string; // e.g., "중수 (B) 이상"
  gameFormat?: string; // e.g., "5vs5"
  ageRange?: string; // e.g., "20대 ~ 30대"
  totalPlayers?: number; // e.g., 12
  currentPlayers?: number; // e.g., 9
  hostName?: string; // e.g., "호스트 김농구"
  hostImage?: string; // Profile image URL
  teamLogo?: string; // Team logo URL
  hostMessage?: string; // 호스트 특이사항 메시지
  cancelPolicy?: string; // 취소 및 환불 규정
}

// Mock Data from Figma Make
export const MOCK_MATCHES: Match[] = [
  // 1월 2일 (금)
  {
    id: '1',
    dateISO: '2025-01-02',
    startTime: '19:00',
    endTime: '21:00',
    title: '강남구민회관 체육관',
    teamName: '팀 슬램덩크',
    location: '강남구민회관',
    address: '서울 강남구 삼성로 123',
    price: '10,000원',
    priceNum: 10000,
    gender: 'men',
    facilities: { parking: 'free', shower: true },
    courtType: 'indoor',
    level: '중수 (B) 이상',
    gameFormat: '5vs5',
    ageRange: '20대 ~ 30대',
    totalPlayers: 12,
    currentPlayers: 9,
    hostName: '호스트 김농구',
    hostMessage: '"승부욕보다는 즐겁게 뛰실 분 환영합니다! 거친 플레이는 지양합니다. 서로 매너 지켜요!"',
    cancelPolicy: '참가비는 노쇼 방지용으로 사용됩니다. 신청 이후에 환불은 불가합니다.\n\n단, 취소는 가능합니다.',
    positions: {
      g: { status: 'closed', max: 1 },
      f: { status: 'open', max: 2 },
      c: { status: 'open', max: 1 },
    },
  },
  // 12월 31일 (수)
  {
    id: '2',
    dateISO: '2024-12-31',
    startTime: '20:00',
    endTime: '22:00',
    title: '반포종합운동장',
    teamName: 'Unknown Ballers',
    location: '서초구 반포동',
    address: '서울 서초구 반포동 15-2',
    price: '15,000원',
    priceNum: 15000,
    gender: 'men',
    facilities: { parking: 'paid', shower: false },
    courtType: 'outdoor',
    positions: {
      all: { status: 'closed', max: 10 } // 마감됨
    },
    isClosed: true,
  },
  // 1월 1일 (목)
  {
    id: '3',
    dateISO: '2025-01-01',
    startTime: '19:30',
    endTime: '21:30',
    title: '잠실 실내체육관',
    teamName: 'Team Jordan',
    location: '송파구 잠실동',
    address: '서울 송파구 올림픽로 25',
    price: '12,000원',
    priceNum: 12000,
    gender: 'mixed',
    facilities: { parking: 'impossible' },
    courtType: 'indoor',
    positions: {
      f: { status: 'open', max: 2 },
      c: { status: 'open', max: 1 },
    },
  },
  // 1월 3일 (토)
  {
    id: '4',
    dateISO: '2025-01-03',
    startTime: '14:00',
    endTime: '16:00',
    title: '마포구민체육센터',
    teamName: '홍대 농구동아리',
    location: '마포구 망원동',
    address: '서울 마포구 망원동 450',
    price: '10,000원',
    priceNum: 10000,
    gender: 'men',
    facilities: { parking: 'free' },
    courtType: 'indoor',
    positions: {
      g: { status: 'open', max: 1 },
      f: { status: 'open', max: 2 },
      c: { status: 'open', max: 1 },
    },
  },
  {
    id: '5',
    dateISO: '2025-01-03',
    startTime: '16:00',
    endTime: '18:00',
    title: '망원 유수지',
    teamName: '망원 덩크슛',
    location: '마포구 망원동',
    address: '서울 마포구 망원동 451',
    price: '11,000원',
    priceNum: 11000,
    gender: 'women',
    facilities: { parking: 'paid' },
    courtType: 'outdoor',
    positions: {
      all: { status: 'open', max: 10 },
    },
  },
  // 1월 7일 (수)
  {
    id: '6',
    dateISO: '2025-01-07',
    startTime: '20:00',
    endTime: '22:00',
    title: '도봉산 실내 농구장',
    teamName: '도봉 마운틴스',
    location: '도봉구',
    address: '서울 도봉구 도봉동 1',
    price: '5,000원',
    priceNum: 5000,
    gender: 'mixed',
    facilities: { parking: 'free' },
    courtType: 'indoor',
    positions: {
       all: { status: 'closed', max: 10 },
    },
    isClosed: true,
  }
];

export const getDistrictName = (address: string) => {
    // "서울 강남구 ..." -> "강남구"
    const parts = address.split(' ');
    if (parts.length > 1) return parts[1];
    return parts[0];
};
