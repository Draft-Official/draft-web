/**
 * Gym Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 *
 * DB Schema 기반 타입 정의 (gyms 테이블)
 */

import type { GymFacilities } from '@/shared/types/jsonb.types';

// ============================================
// Gym (체육관)
// ============================================

/**
 * 클라이언트용 체육관 타입
 * DB row를 mapper로 변환한 결과
 */
export interface ClientGym {
  id: string;
  name: string;
  address: string;
  kakaoPlaceId: string;
  latitude: number;
  longitude: number;
  facilities: GymFacilities | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * 체육관 생성 input 타입
 */
export interface CreateGymInput {
  name: string;
  address: string;
  kakaoPlaceId: string;
  latitude: number;
  longitude: number;
  facilities?: GymFacilities;
}

/**
 * 체육관 수정 input 타입
 */
export interface UpdateGymInput {
  name?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  facilities?: GymFacilities | null;
}
