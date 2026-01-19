/**
 * Auth Feature 타입 정의
 */
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/shared/types/database.types';

/**
 * 인증 상태
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Auth Context 값
 */
export interface AuthContextValue {
  /** 현재 Supabase 사용자 */
  user: User | null;
  /** 현재 사용자 프로필 */
  profile: Profile | null;
  /** 인증 상태 */
  status: AuthStatus;
  /** 로딩 중 여부 */
  isLoading: boolean;
  /** 인증됨 여부 */
  isAuthenticated: boolean;
  /** 로그아웃 */
  signOut: () => Promise<void>;
  /** 프로필 새로고침 */
  refreshProfile: () => Promise<void>;
}
