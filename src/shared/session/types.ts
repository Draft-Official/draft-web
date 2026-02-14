import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/shared/types/database.types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}
