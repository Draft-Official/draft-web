import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import type { ProfileUpdate } from '@/shared/types/database.types';
import { authKeys } from './keys';
import {
  profileRowToSessionProfile,
  sessionProfileToProfileUpdate,
} from './mappers';
import type { SessionProfile, UpdateSessionProfileInput } from './types';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: authKeys.profile(userId!),
    queryFn: async (): Promise<SessionProfile | null> => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId!)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return profileRowToSessionProfile(data);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: UpdateSessionProfileInput | ProfileUpdate;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const normalizedUpdates = sessionProfileToProfileUpdate(
        updates as UpdateSessionProfileInput
      );
      const { data, error } = await supabase
        .from('users')
        .update(normalizedUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return profileRowToSessionProfile(data);
    },
    onSuccess: (data) => {
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: authKeys.profile(data.id) });
      }
      toast.success('프로필이 업데이트되었습니다');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '계정 삭제에 실패했습니다.');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
