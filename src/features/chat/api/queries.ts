import { useQuery } from '@tanstack/react-query';
import { createChatService } from '@/entities/chat';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import type { MatchChatRoomWithRelations } from '@/entities/chat';
import type {
  MatchChatMessageDTO,
  MatchChatRoomDetailDTO,
  MatchChatRoomListItemDTO,
  UseMatchChatRoomsOptions,
} from '../model/types';
import {
  toMatchChatMessageDTO,
  toMatchChatRoomDetailDTO,
  toMatchChatRoomListItemDTO,
} from '../lib/mappers';
import { matchChatKeys } from './keys';

function getUnreadSince(room: MatchChatRoomWithRelations, viewerUserId: string): string {
  return room.host_id === viewerUserId ? room.host_last_read_at : room.guest_last_read_at;
}

async function mapRoomsWithUnread(
  rooms: MatchChatRoomWithRelations[],
  viewerUserId: string
): Promise<MatchChatRoomListItemDTO[]> {
  const chatService = createChatService(getSupabaseBrowserClient());

  const unreadCounts = await Promise.all(
    rooms.map(async (room) => {
      try {
        return await chatService.countUnreadMessages(
          room.id,
          viewerUserId,
          getUnreadSince(room, viewerUserId)
        );
      } catch {
        return 0;
      }
    })
  );

  return rooms.map((room, index) =>
    toMatchChatRoomListItemDTO(room, viewerUserId, unreadCounts[index] ?? 0)
  );
}

export function useMatchChatRooms(options: UseMatchChatRoomsOptions = {}) {
  const { user } = useAuth();
  const mode = options.mode ?? 'all';
  const matchId = options.matchId;

  return useQuery({
    queryKey: matchChatKeys.rooms(user?.id ?? '', mode, matchId),
    enabled: !!user?.id,
    refetchInterval: 10_000,
    queryFn: async (): Promise<MatchChatRoomListItemDTO[]> => {
      if (!user?.id) {
        return [];
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const rooms = await chatService.listMyRooms(user.id, {
        mode,
        matchId,
      });

      return mapRoomsWithUnread(rooms, user.id);
    },
  });
}

export function useHostMatchChatRooms(matchId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.hostRoomsByMatch(user?.id ?? '', matchId),
    enabled: !!user?.id && !!matchId,
    refetchInterval: 10_000,
    queryFn: async (): Promise<MatchChatRoomListItemDTO[]> => {
      if (!user?.id || !matchId) {
        return [];
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const rooms = await chatService.listHostRoomsByMatch(user.id, matchId);

      return mapRoomsWithUnread(rooms, user.id);
    },
  });
}

export function useMatchChatRoom(roomId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.roomDetail(roomId, user?.id ?? ''),
    enabled: !!user?.id && !!roomId,
    refetchInterval: 10_000,
    queryFn: async (): Promise<MatchChatRoomDetailDTO | null> => {
      if (!user?.id || !roomId) {
        return null;
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const room = await chatService.getRoom(roomId);
      const unreadCount = await chatService.countUnreadMessages(
        room.id,
        user.id,
        getUnreadSince(room, user.id)
      );

      return toMatchChatRoomDetailDTO(room, user.id, unreadCount);
    },
  });
}

export function useMatchChatMessages(roomId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.messages(roomId, user?.id ?? ''),
    enabled: !!user?.id && !!roomId,
    refetchInterval: 5_000,
    queryFn: async (): Promise<MatchChatMessageDTO[]> => {
      if (!user?.id || !roomId) {
        return [];
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const rows = await chatService.getMessages(roomId);

      return rows.map((row) => toMatchChatMessageDTO(row, user.id));
    },
  });
}
