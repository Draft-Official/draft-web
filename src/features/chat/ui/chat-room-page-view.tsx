'use client';

import { ChatRoomView } from './chat-room-view';

interface ChatRoomPageViewProps {
  roomId: string;
}

export function ChatRoomPageView({ roomId }: ChatRoomPageViewProps) {
  return <ChatRoomView roomId={roomId} />;
}
