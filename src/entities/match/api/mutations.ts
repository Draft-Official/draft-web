/**
 * Match Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from './match-service';
import { matchKeys } from './keys';

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.createMatch(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      toast.success('경기가 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`경기 생성 실패: ${error.message}`);
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.updateMatch(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      toast.success('경기가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`경기 수정 실패: ${error.message}`);
    },
  });
}
