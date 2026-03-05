import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChatService } from '@/entities/chat';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import type { MatchChatRole } from '@/entities/chat';
import type { CreateOrGetMatchChatRoomInputDTO } from '../model/types';
import { matchChatKeys } from './keys';

interface SendMatchChatMessageInput {
  roomId: string;
  body: string;
}

interface MarkMatchChatReadInput {
  roomId: string;
  role: MatchChatRole;
}

export function useCreateOrGetMatchChatRoom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrGetMatchChatRoomInputDTO) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const room = await chatService.createOrGetRoom({
        matchId: input.matchId,
        hostId: input.hostId,
        guestId: input.guestId,
      });

      return room.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
    },
  });
}

export function useSendMatchChatMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, body }: SendMatchChatMessageInput) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      return chatService.sendMessage(roomId, user.id, body);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: matchChatKeys.messages(variables.roomId, user.id) });
        queryClient.invalidateQueries({ queryKey: matchChatKeys.roomDetail(variables.roomId, user.id) });
      }
    },
  });
}

export function useMarkMatchChatRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, role }: MarkMatchChatReadInput) => {
      const chatService = createChatService(getSupabaseBrowserClient());
      await chatService.markRoomRead(roomId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
    },
  });
}
