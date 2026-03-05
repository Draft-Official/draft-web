import type {
  MatchChatMessageRow,
  MatchChatRoomWithRelations,
} from '@/entities/chat';
import type {
  MatchChatMessageDTO,
  MatchChatRoomDetailDTO,
  MatchChatRoomListItemDTO,
} from '../model/types';

const FALLBACK_USER_NAME = '알 수 없는 사용자';
const FALLBACK_TEAM_NAME = '팀명 미정';

function resolveRoomRole(room: MatchChatRoomWithRelations, viewerUserId: string): 'host' | 'guest' {
  return room.host_id === viewerUserId ? 'host' : 'guest';
}

function resolveTeamName(room: MatchChatRoomWithRelations): string {
  return room.match?.team?.name || room.match?.manual_team_name || FALLBACK_TEAM_NAME;
}

export function toMatchChatRoomListItemDTO(
  room: MatchChatRoomWithRelations,
  viewerUserId: string,
  unreadCount: number
): MatchChatRoomListItemDTO {
  const myRole = resolveRoomRole(room, viewerUserId);

  const otherUser = myRole === 'host' ? room.guest : room.host;

  return {
    roomId: room.id,
    matchId: room.match_id,
    matchPublicId: room.match?.short_id || room.match_id,
    matchStartTimeISO: room.match?.start_time || room.created_at,
    teamName: resolveTeamName(room),
    teamLogoUrl: room.match?.team?.logo_url || null,
    lastMessagePreview: room.last_message_preview,
    lastMessageAt: room.last_message_at,
    createdAt: room.created_at,
    unreadCount,
    myRole,
    otherUserId: otherUser?.id || (myRole === 'host' ? room.guest_id : room.host_id),
    otherUserName: otherUser?.nickname || FALLBACK_USER_NAME,
    otherUserAvatar: otherUser?.avatar_url || null,
  };
}

export function toMatchChatRoomDetailDTO(
  room: MatchChatRoomWithRelations,
  viewerUserId: string,
  unreadCount: number
): MatchChatRoomDetailDTO {
  const listItem = toMatchChatRoomListItemDTO(room, viewerUserId, unreadCount);

  return {
    ...listItem,
    hostId: room.host_id,
    hostName: room.host?.nickname || FALLBACK_USER_NAME,
    hostAvatar: room.host?.avatar_url || null,
    guestId: room.guest_id,
    guestName: room.guest?.nickname || FALLBACK_USER_NAME,
    guestAvatar: room.guest?.avatar_url || null,
    hostLastReadAt: room.host_last_read_at,
    guestLastReadAt: room.guest_last_read_at,
  };
}

export function toMatchChatMessageDTO(
  row: MatchChatMessageRow,
  viewerUserId: string
): MatchChatMessageDTO {
  return {
    id: row.id,
    roomId: row.room_id,
    senderId: row.sender_id,
    body: row.body,
    createdAt: row.created_at,
    isMine: row.sender_id === viewerUserId,
  };
}
