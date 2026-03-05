/**
 * Chat Entity Query Keys
 */

export const chatEntityKeys = {
  all: ['chat'] as const,
  rooms: ['chat', 'rooms'] as const,
  roomDetail: (roomId: string) => [...chatEntityKeys.rooms, roomId] as const,
  roomMessages: (roomId: string) => [...chatEntityKeys.roomDetail(roomId), 'messages'] as const,
} as const;
