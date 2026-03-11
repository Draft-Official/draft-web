import { useQuery } from '@tanstack/react-query';
import { createChatService } from '@/entities/chat';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { getPositionLabel } from '@/shared/config/match-constants';
import { SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';
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

type UserProfileSnapshot = {
  id: string;
  metadata: unknown;
  positions: string[] | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toOtherUserInfoSummary(profile: UserProfileSnapshot): string | null {
  const segments: string[] = [];
  const position = profile.positions?.[0];

  if (position) {
    segments.push(getPositionLabel(position, 'combined'));
  }

  if (isRecord(profile.metadata)) {
    const skillLevel = profile.metadata.skill_level;
    const age = profile.metadata.age;
    const height = profile.metadata.height;

    if (typeof skillLevel === 'number') {
      const levelName = SKILL_LEVEL_NAMES[skillLevel] || `Lv.${skillLevel}`;
      segments.push(levelName);
    }

    if (typeof age === 'number') {
      segments.push(`${age}세`);
    }

    if (typeof height === 'number') {
      segments.push(`${height}cm`);
    }
  }

  return segments.length > 0 ? segments.join(' · ') : null;
}

async function loadUserInfoSummaryMap(userIds: string[]): Promise<Map<string, string | null>> {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  const summaryMap = new Map<string, string | null>();

  if (uniqueUserIds.length === 0) {
    return summaryMap;
  }

  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('users')
    .select('id, metadata, positions')
    .in('id', uniqueUserIds);

  if (error || !data) {
    return summaryMap;
  }

  for (const row of data as UserProfileSnapshot[]) {
    summaryMap.set(row.id, toOtherUserInfoSummary(row));
  }

  return summaryMap;
}

async function attachOtherUserInfoSummary<T extends MatchChatRoomListItemDTO>(rooms: T[]): Promise<T[]> {
  if (rooms.length === 0) {
    return rooms;
  }

  const summaryMap = await loadUserInfoSummaryMap(rooms.map((room) => room.otherUserId));
  if (summaryMap.size === 0) {
    return rooms;
  }

  return rooms.map((room) => ({
    ...room,
    otherUserInfoSummary: summaryMap.get(room.otherUserId) ?? null,
  }));
}

async function mapRoomsWithUnread(
  rooms: MatchChatRoomWithRelations[],
  viewerUserId: string
): Promise<MatchChatRoomListItemDTO[]> {
  const chatService = createChatService(getSupabaseBrowserClient());
  const unreadInputs = rooms.map((room) => ({
    roomId: room.id,
    sinceISO: getUnreadSince(room, viewerUserId),
  }));

  try {
    const unreadCountMap = await chatService.countUnreadMessagesBulk(unreadInputs, viewerUserId);
    return rooms.map((room) =>
      toMatchChatRoomListItemDTO(room, viewerUserId, unreadCountMap.get(room.id) ?? 0)
    );
  } catch {
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
}

export function useMatchChatRooms(options: UseMatchChatRoomsOptions = {}) {
  const { user } = useAuth();
  const mode = options.mode ?? 'all';
  const matchId = options.matchId;

  return useQuery({
    queryKey: matchChatKeys.rooms(user?.id ?? '', mode, matchId),
    enabled: !!user?.id,
    queryFn: async (): Promise<MatchChatRoomListItemDTO[]> => {
      if (!user?.id) {
        return [];
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const rooms = await chatService.listMyRooms(user.id, {
        mode,
        matchId,
      });

      const mapped = await mapRoomsWithUnread(rooms, user.id);
      return attachOtherUserInfoSummary(mapped);
    },
  });
}

export function useHostMatchChatRooms(matchId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.hostRoomsByMatch(user?.id ?? '', matchId),
    enabled: !!user?.id && !!matchId,
    queryFn: async (): Promise<MatchChatRoomListItemDTO[]> => {
      if (!user?.id || !matchId) {
        return [];
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const rooms = await chatService.listHostRoomsByMatch(user.id, matchId);

      const mapped = await mapRoomsWithUnread(rooms, user.id);
      return attachOtherUserInfoSummary(mapped);
    },
  });
}

export function useMatchChatRoom(roomId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.roomDetail(roomId, user?.id ?? ''),
    enabled: !!user?.id && !!roomId,
    queryFn: async (): Promise<MatchChatRoomDetailDTO | null> => {
      if (!user?.id || !roomId) {
        return null;
      }

      const chatService = createChatService(getSupabaseBrowserClient());
      const room = await chatService.getRoom(roomId, user.id);
      const unreadCount = await chatService.countUnreadMessages(
        room.id,
        user.id,
        getUnreadSince(room, user.id)
      );

      const mapped = toMatchChatRoomDetailDTO(room, user.id, unreadCount);
      const [withSummary] = await attachOtherUserInfoSummary([mapped]);
      return withSummary ?? mapped;
    },
  });
}

export function useMatchChatMessages(roomId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchChatKeys.messages(roomId, user?.id ?? ''),
    enabled: !!user?.id && !!roomId,
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
