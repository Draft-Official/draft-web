import type { MatchChatRole } from '@/entities/chat';

export interface MatchChatRoomListItemDTO {
  roomId: string;
  matchId: string;
  matchPublicId: string;
  matchStartTimeISO: string;
  teamName: string;
  teamLogoUrl: string | null;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  unreadCount: number;
  isMuted: boolean;
  myRole: MatchChatRole;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  otherUserInfoSummary: string | null;
}

export interface MatchChatRoomDetailDTO extends MatchChatRoomListItemDTO {
  hostId: string;
  hostName: string;
  hostAvatar: string | null;
  guestId: string;
  guestName: string;
  guestAvatar: string | null;
  hostLastReadAt: string;
  guestLastReadAt: string;
}

export interface MatchChatMessageDTO {
  id: string;
  roomId: string;
  senderId: string;
  body: string;
  createdAt: string;
  isMine: boolean;
  type: 'text' | 'announcement';
}

export interface UseMatchChatRoomsOptions {
  mode?: 'all' | 'host' | 'guest';
  matchId?: string;
}

export interface CreateOrGetMatchChatRoomInputDTO {
  matchId: string;
  hostId: string;
  guestId: string;
}
