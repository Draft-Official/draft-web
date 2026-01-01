export type PositionStatus = {
  status: 'open' | 'closed';
  max: number;  // 모집 정원 (e.g. 2 means 0/2)
};

export interface Match {
  id: string;
  dateISO: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  title: string;
  location: string; // e.g., "강남구민회관" (Display Name)
  address: string;  // e.g., "서울 강남구 대치동 123" (Filtering Key)
  price: string;    // e.g., "10,000"
  positions: {
    all?: PositionStatus; // 포지션 무관
    g?: PositionStatus;   // 가드
    f?: PositionStatus;   // 포워드
    c?: PositionStatus;   // 센터
  };
  isClosed?: boolean;
}

// Mock Data from Figma Make
export const MOCK_MATCHES: Match[] = [
  // 1월 2일 (금)
  {
    id: '1',
    dateISO: '2025-01-02',
    startTime: '19:00',
    endTime: '21:00',
    title: '강남구민회관',
    location: '강남구 대치동',
    address: '서울 강남구 대치동 50',
    price: '10,000',
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
    location: '서초구 반포동',
    address: '서울 서초구 반포동 15-2',
    price: '15,000',
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
    location: '송파구 잠실동',
    address: '서울 송파구 올림픽로 25',
    price: '12,000',
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
    location: '마포구 망원동',
    address: '서울 마포구 망원동 450',
    price: '10,000',
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
    location: '마포구 망원동',
    address: '서울 마포구 망원동 451',
    price: '11,000',
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
    title: '도봉산 실내 농구장 (서울 도봉구)',
    location: '도봉구',
    address: '서울 도봉구 도봉동 1', 
    price: '5,000',
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
