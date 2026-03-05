export const matchChatKeys = {
  all: ['match-chat'] as const,
  rooms: (userId: string, mode: 'all' | 'host' | 'guest', matchId?: string) =>
    [...matchChatKeys.all, 'rooms', userId, mode, matchId ?? 'all-matches'] as const,
  roomDetail: (roomId: string, userId: string) =>
    [...matchChatKeys.all, 'room', roomId, userId] as const,
  messages: (roomId: string, userId: string) =>
    [...matchChatKeys.roomDetail(roomId, userId), 'messages'] as const,
  hostRoomsByMatch: (userId: string, matchId: string) =>
    [...matchChatKeys.all, 'host-rooms', userId, matchId] as const,
} as const;
