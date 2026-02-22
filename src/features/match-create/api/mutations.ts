/**
 * Match Create Mutation Hooks
 * 매치 생성용 React Query hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { matchKeys } from '@/entities/match';
import { createMatchCreateService } from './match-create-api';
import type { MatchCreateFormData } from '@/features/match-create/model/form-data.types';
import { useAuth } from '@/shared/session';
import { createAuthService } from '@/shared/api/auth-service';
import { createTeamService } from '@/entities/team';
import type { MatchCreateDefaultsSaveDTO } from '@/features/match-create/model/types';

interface MutationErrorDetails {
  message?: string;
  error_description?: string;
  code?: string;
  details?: string;
  hint?: string;
}

function toMutationErrorDetails(error: unknown): MutationErrorDetails {
  if (typeof error === 'object' && error !== null) {
    return error as MutationErrorDetails;
  }
  return {};
}


/**
 * 매치 생성
 */
export function useCreateMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: MatchCreateFormData) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다');
      }
      const hostId = user.id;
      const supabase = getSupabaseBrowserClient();
      const matchCreateService = createMatchCreateService(supabase);
      return matchCreateService.createMatch(hostId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      toast.success('경기가 생성되었습니다');
    },
    onError: (error: unknown) => {
      const details = toMutationErrorDetails(error);
      console.error('Match creation error:', error);
      console.error('Error details:', {
        message: details.message,
        code: details.code,
        details: details.details,
        hint: details.hint,
      });
    },
  });
}

/**
 * 매치 수정
 */
export function useUpdateMatch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: { matchId: string; form: MatchCreateFormData }) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다');
      }
      const hostId = user.id;

      const supabase = getSupabaseBrowserClient();
      const matchCreateService = createMatchCreateService(supabase);
      return matchCreateService.updateMatch(input.matchId, hostId, input.form);
    },
    onSuccess: (_, variables) => {
      // 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.matchId) });
      queryClient.invalidateQueries({ queryKey: ['match-management'] }); // schedule 쪽 캐시도 무효화
      toast.success('경기가 수정되었습니다');
    },
    onError: (error: unknown) => {
      console.error('Match update error:', error);
    },
  });
}

/**
 * 운영 정보 기본값 저장
 */
export function useSaveMatchCreateDefaults() {
  return useMutation({
    mutationFn: async (input: MatchCreateDefaultsSaveDTO) => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      const teamService = createTeamService(supabase);

      if (input.selectedHost === 'me') {
        await authService.updateOperationsDefaults(input.userId, {
          accountInfo: {
            bank: input.accountInfo.bank,
            number: input.accountInfo.number,
            holder: input.accountInfo.holder,
          },
          operationInfo: {
            type: input.contactInfo.type,
            url: input.contactInfo.type === 'KAKAO_OPEN_CHAT' ? input.contactInfo.content : undefined,
            notice: input.hostNotice,
          },
        });

        if (input.contactInfo.type === 'PHONE') {
          await authService.updateProfile(input.userId, {
            phone: input.contactInfo.content,
          });
        }
        return;
      }

      await teamService.updateTeamDefaults(input.selectedHost, {
        accountInfo: {
          bank: input.accountInfo.bank,
          number: input.accountInfo.number,
          holder: input.accountInfo.holder,
        },
        operationInfo: {
          notice: input.hostNotice,
        },
      });

      await authService.updateOperationsDefaults(input.userId, {
        operationInfo: {
          type: input.contactInfo.type,
          url: input.contactInfo.type === 'KAKAO_OPEN_CHAT' ? input.contactInfo.content : undefined,
        },
      });

      if (input.contactInfo.type === 'PHONE') {
        await authService.updateProfile(input.userId, {
          phone: input.contactInfo.content,
        });
      }
    },
  });
}
