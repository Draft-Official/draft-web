'use client';

import { DesktopDetailPanelShell } from '@/shared/ui/layout';
import { parseDesktopChatRoomRoute } from '../lib/desktop-chat-route';
import { ChatRoomView } from './chat-room-view';

interface ChatRouteDetailPanelProps {
  routePath: string | null;
  onClose?: () => void;
  emptyMessage?: string;
}

export function ChatRouteDetailPanel({
  routePath,
  onClose,
  emptyMessage = '왼쪽 목록에서 채팅을 선택해 주세요.',
}: ChatRouteDetailPanelProps) {
  const parsed = routePath ? parseDesktopChatRoomRoute(routePath) : null;

  return (
    <DesktopDetailPanelShell
      fullPageHref={parsed?.fullPageHref ?? null}
      onClose={onClose}
      emptyMessage={emptyMessage}
      showToolbar={false}
    >
      {parsed ? (
        <ChatRoomView roomId={parsed.roomId} layoutMode="split" />
      ) : null}
    </DesktopDetailPanelShell>
  );
}
