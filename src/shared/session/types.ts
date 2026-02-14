import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/shared/types/database.types';
import type { OperationInfo } from '@/shared/types/jsonb.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Shared Session Contracts
 * - shared/session 공개 계약 타입 (DB row 타입 비노출)
 */
export interface SessionUser {
  id: string;
  email: string | null;
  phone: string | null;
}

export interface SessionProfileMetadata {
  height?: number;
  age?: number;
  weight?: number;
  skill_level?: number;
  display_team_id?: string | null;
  display_team_name?: string | null;
  [key: string]: unknown;
}

export interface SessionAccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
  [key: string]: unknown;
}

export interface SessionProfile {
  id: string;
  email: string | null;
  nickname: string | null;
  real_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  phone_verified: boolean | null;
  positions: string[] | null;
  metadata: SessionProfileMetadata | null;
  account_info: SessionAccountInfo | null;
  operation_info: OperationInfo | null;
  manner_score: number | null;
  created_at: string | null;
  deleted_at: string | null;
}

export interface UpdateSessionProfileInput {
  nickname?: string | null;
  real_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  phone_verified?: boolean | null;
  positions?: string[] | null;
  metadata?: SessionProfileMetadata | null;
  account_info?: SessionAccountInfo | null;
  operation_info?: OperationInfo | null;
  manner_score?: number | null;
}

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
