import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChatService } from '@/entities/chat';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import type { MatchChatRole } from '@/entities/chat';
import type {
  CreateOrGetMatchChatRoomInputDTO,
  MatchChatMessageDTO,
} from '../model/types';
import { matchChatKeys } from './keys';

interface SendMatchChatMessageInput {
  roomId: string;
  body: string;
}

interface MarkMatchChatReadInput {
  roomId: string;
  role: MatchChatRole;
}

interface SetMatchChatMuteInput {
  roomId: string;
  role: MatchChatRole;
  muted: boolean;
}

interface LeaveMatchChatRoomInput {
  roomId: string;
  role: MatchChatRole;
}

interface ReportMatchChatRoomInput {
  roomId: string;
  reason: string;
  details?: string;
}

interface SendMatchChatMessageContext {
  previousMessages?: MatchChatMessageDTO[];
  optimisticId: string;
}

function sortMessagesByCreatedAt(messages: MatchChatMessageDTO[]): MatchChatMessageDTO[] {
  return [...messages].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
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
    onMutate: async ({ roomId, body }): Promise<SendMatchChatMessageContext | undefined> => {
      if (!user?.id) {
        return undefined;
      }

      const messagesKey = matchChatKeys.messages(roomId, user.id);
      await queryClient.cancelQueries({ queryKey: messagesKey });

      const previousMessages = queryClient.getQueryData<MatchChatMessageDTO[]>(messagesKey);
      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMessage: MatchChatMessageDTO = {
        id: optimisticId,
        roomId,
        senderId: user.id,
        body: body.trim(),
        createdAt: new Date().toISOString(),
        isMine: true,
        type: 'text',
      };

      queryClient.setQueryData<MatchChatMessageDTO[]>(messagesKey, (current) =>
        sortMessagesByCreatedAt([...(current ?? []), optimisticMessage])
      );

      return {
        previousMessages,
        optimisticId,
      };
    },
    onError: (_error, variables, context) => {
      if (!user?.id) {
        return;
      }

      const messagesKey = matchChatKeys.messages(variables.roomId, user.id);
      if (context?.previousMessages) {
        queryClient.setQueryData(messagesKey, context.previousMessages);
        return;
      }

      queryClient.setQueryData<MatchChatMessageDTO[]>(messagesKey, (current) =>
        (current ?? []).filter((message) => message.id !== context?.optimisticId)
      );
    },
    onSuccess: (sentMessage, variables, context) => {
      if (!user?.id) {
        return;
      }

      const messagesKey = matchChatKeys.messages(variables.roomId, user.id);
      const confirmed: MatchChatMessageDTO = {
        id: sentMessage.id,
        roomId: sentMessage.room_id,
        senderId: sentMessage.sender_id,
        body: sentMessage.body,
        createdAt: sentMessage.created_at,
        isMine: sentMessage.sender_id === user.id,
        type: (sentMessage.type === 'announcement' ? 'announcement' : 'text'),
      };

      queryClient.setQueryData<MatchChatMessageDTO[]>(messagesKey, (current) => {
        const filtered = (current ?? []).filter(
          (message) =>
            message.id !== context?.optimisticId &&
            message.id !== confirmed.id
        );

        return sortMessagesByCreatedAt([...filtered, confirmed]);
      });
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: matchChatKeys.all,
        refetchType: 'active',
      });

      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: matchChatKeys.roomDetail(variables.roomId, user.id),
          refetchType: 'active',
        });
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

export function useSetMatchChatMute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, role, muted }: SetMatchChatMuteInput) => {
      const chatService = createChatService(getSupabaseBrowserClient());
      await chatService.setRoomMuted(roomId, role, muted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
    },
  });
}

export function useLeaveMatchChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, role }: LeaveMatchChatRoomInput) => {
      const chatService = createChatService(getSupabaseBrowserClient());
      await chatService.leaveRoom(roomId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
    },
  });
}

export function useReportMatchChatRoom() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roomId, reason, details }: ReportMatchChatRoomInput) => {
      if (!user?.id) {
        throw new Error('로그인이 필요합니다.');
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      await chatService.reportRoom({
        roomId,
        reporterId: user.id,
        reason,
        details,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
    },
  });
}
