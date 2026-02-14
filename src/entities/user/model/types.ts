/**
 * User Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 *
 * DB Schema 기반 타입 정의 (users 테이블)
 */

import type { PositionValue } from '@/shared/config/constants';
import type { OperationInfo, AccountInfo } from '@/shared/types/jsonb.types';

// ============================================
// User (사용자)
// ============================================

/**
 * 사용자 메타데이터 (JSONB)
 */
export interface UserMetadata {
  height?: number;
  age?: number;
  weight?: number;
  skillLevel?: number;
  [key: string]: unknown;
}

/**
 * 클라이언트용 사용자 타입
 * DB row를 mapper로 변환한 결과
 */
export interface ClientUser {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  phoneVerified: boolean | null;
  realName: string | null;
  positions: PositionValue[] | null;
  mannerScore: number | null;
  metadata: UserMetadata | null;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
  createdAt: string | null;
  deletedAt: string | null;
}

/**
 * 사용자 생성 input 타입
 */
export interface CreateUserInput {
  id: string;
  nickname?: string;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  realName?: string;
  positions?: PositionValue[];
  metadata?: UserMetadata;
  accountInfo?: AccountInfo;
  operationInfo?: OperationInfo;
}

/**
 * 사용자 수정 input 타입
 */
export interface UpdateUserInput {
  nickname?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
  phoneVerified?: boolean | null;
  realName?: string | null;
  positions?: PositionValue[] | null;
  metadata?: UserMetadata | null;
  accountInfo?: AccountInfo | null;
  operationInfo?: OperationInfo | null;
}
