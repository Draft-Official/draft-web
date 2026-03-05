'use client';

import { useParams } from 'next/navigation';
import { ChatRoomPageView } from '@/features/chat';

export default function ChatRoomPage() {
  const params = useParams();
  const idParam = params?.roomId;
  const roomId = Array.isArray(idParam) ? (idParam[0] ?? '') : (idParam ?? '');

  return <ChatRoomPageView roomId={roomId} />;
}
