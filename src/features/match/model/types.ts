/**
 * Match Feature 타입 정의
 */

export type PositionStatus = {
  status: 'open' | 'closed';
  max: number;  // 모집 정원 (e.g. 2 means 0/2)
};

/**
 * Match 인터페이스 (상세 페이지 UI용)
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
  facilities?: Record<string, any>;

  // Detail Fields
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  courtType?: 'indoor' | 'outdoor';

  // Guest Detail View Fields
  level?: string; // e.g., "중수 (B) 이상"
  gameFormat: string; // e.g., "5vs5"
  ageRange?: string; // e.g., "20대 ~ 30대"
  totalPlayers?: number;
  currentPlayers?: number;

  // Match Rule Details
  rule?: {
    type: '2team' | '3team' | 'lesson' | 'exchange';
    quarterTime: number;
    quarterCount: number;
    fullGames?: number;
    guaranteedQuarters: number;
    referee: 'self' | 'guest' | 'pro';
  };

  hostName?: string;
  hostImage?: string;
  teamLogo?: string;
  hostMessage?: string;
  cancelPolicy?: string;
  requirements?: string[];
}
