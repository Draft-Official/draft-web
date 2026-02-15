/**
 * Match Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from './match-service';
import { matchKeys } from './keys';

type MatchType = 'GUEST_RECRUIT' | 'TEAM_MATCH';

/**
 * Get matches with optional filter
 */
export function useMatches(filter?: { type?: MatchType }) {
  return useQuery({
    queryKey: matchKeys.lists(filter),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.getMatches(filter);
    },
  });
}

/**
 * Get match detail
 */
export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.getMatchDetail(id);
    },
    enabled: !!id,
  });
}
