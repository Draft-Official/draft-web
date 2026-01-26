/**
 * Auth Service
 * 인증 및 프로필 관련 DB 접근을 캡슐화
 */
import type { SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import type {
  Database,
  User,
  UserUpdate,
  Json,
} from '@/shared/types/database.types';
import type { OperationInfo, AccountInfo } from '@/shared/types/jsonb.types';
import { handleSupabaseError, AuthError } from '@/shared/lib/errors';

export class AuthService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 현재 로그인한 사용자 조회 (Supabase Auth User)
   */
  async getCurrentUser(): Promise<SupabaseUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

  /**
   * 유저 프로필 조회 (users 테이블)
   */
  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '프로필');
    }

    return data;
  }

  /**
   * 현재 사용자의 프로필 조회
   */
  async getCurrentProfile(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;
    return this.getProfile(user.id);
  }

  /**
   * 프로필 업데이트
   */
  async updateProfile(userId: string, updates: UserUpdate): Promise<User> {
    const { data, error } = await this.supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '프로필 수정');
    return data!;
  }

  /**
   * 현재 사용자 프로필 업데이트
   */
  async updateCurrentProfile(updates: UserUpdate): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new AuthError();
    return this.updateProfile(user.id, updates);
  }

  /**
   * 운영 정보 기본값 업데이트 (경기 생성용)
   */
  async updateOperationsDefaults(
    userId: string,
    updates: {
      operationInfo?: OperationInfo;
      accountInfo?: AccountInfo;
    }
  ): Promise<User> {
    const dbUpdates: UserUpdate = {};

    if (updates.operationInfo) {
      dbUpdates.operation_info = updates.operationInfo as unknown as Json;
    }
    if (updates.accountInfo) {
      dbUpdates.account_info = updates.accountInfo as unknown as Json;
    }

    return this.updateProfile(userId, dbUpdates);
  }

  /**
   * 현재 사용자의 운영 정보 기본값 업데이트
   */
  async updateCurrentOperationsDefaults(updates: {
    operationInfo?: OperationInfo;
    accountInfo?: AccountInfo;
  }): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new AuthError();
    return this.updateOperationsDefaults(user.id, updates);
  }


  /**
   * Kakao OAuth 로그인
   */
  async signInWithKakao(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  /**
   * Apple OAuth 로그인
   */
  async signInWithApple(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  /**
   * Google OAuth 로그인
   */
  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  /**
   * 이메일/비밀번호 로그인
   */
  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  /**
   * 회원가입
   */
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  /**
   * 로그아웃
   */
  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new AuthError(error.message);
  }

  /**
   * 인증 상태 변경 리스너
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

/**
 * AuthService 팩토리 함수
 */
export function createAuthService(supabase: SupabaseClient<Database>) {
  return new AuthService(supabase);
}
