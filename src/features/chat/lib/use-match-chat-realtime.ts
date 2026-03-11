'use client';

import { useEffect } from 'react';
import type { RealtimePostgresInsertPayload } from '@supabase/supabase-js';
import { useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import type { MatchChatMessage } from '@/shared/types/database.types';
import type { MatchChatMessageDTO } from '../model/types';
import { matchChatKeys } from '../api/keys';

interface UseMatchChatRealtimeOptions {
  roomId?: string;
}

function mergeMessage(
  current: MatchChatMessageDTO[] | undefined,
  incoming: MatchChatMessageDTO
): MatchChatMessageDTO[] {
  const base = current ?? [];

  if (base.some((message) => message.id === incoming.id)) {
    return base;
  }

  return [...base, incoming].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function useMatchChatRealtime({ roomId }: UseMatchChatRealtimeOptions = {}) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const channel = supabase.channel(
      roomId ? `match-chat-room-${roomId}` : `match-chat-inbox-${user.id}`
    );

    channel.on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'match_chat_messages',
        ...(roomId ? { filter: `room_id=eq.${roomId}` } : {}),
      },
      (payload: RealtimePostgresInsertPayload<MatchChatMessage>) => {
        const inserted = payload.new;

        if (roomId) {
          const key = matchChatKeys.messages(roomId, user.id);
          const nextMessage: MatchChatMessageDTO = {
            id: inserted.id,
            roomId: inserted.room_id,
            senderId: inserted.sender_id,
            body: inserted.body,
            createdAt: inserted.created_at,
            isMine: inserted.sender_id === user.id,
            type: (inserted.type === 'announcement' ? 'announcement' : 'text'),
          };

          queryClient.setQueryData<MatchChatMessageDTO[]>(key, (current) =>
            mergeMessage(current, nextMessage)
          );
        }

        queryClient.invalidateQueries({
          queryKey: matchChatKeys.all,
          refetchType: 'active',
        });
      }
    );

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_chat_rooms',
        ...(roomId ? { filter: `id=eq.${roomId}` } : {}),
      },
      () => {
        queryClient.invalidateQueries({
          queryKey: matchChatKeys.all,
          refetchType: 'active',
        });
      }
    );

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, roomId, user?.id]);
}
