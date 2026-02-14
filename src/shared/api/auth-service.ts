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

  async getCurrentUser(): Promise<SupabaseUser | null> {
    const {
      data: { user },
    } = await this.supabase.auth.getUser();
    return user;
  }

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

  async getCurrentProfile(): Promise<User | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;
    return this.getProfile(user.id);
  }

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

  async updateCurrentProfile(updates: UserUpdate): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new AuthError();
    return this.updateProfile(user.id, updates);
  }

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

  async updateCurrentOperationsDefaults(updates: {
    operationInfo?: OperationInfo;
    accountInfo?: AccountInfo;
  }): Promise<User> {
    const user = await this.getCurrentUser();
    if (!user) throw new AuthError();
    return this.updateOperationsDefaults(user.id, updates);
  }

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

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new AuthError(error.message);
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new AuthError(error.message);
  }

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}

export function createAuthService(supabase: SupabaseClient<Database>) {
  return new AuthService(supabase);
}
