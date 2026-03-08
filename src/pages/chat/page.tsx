'use client';

import {
  ChatInboxView,
  ChatRouteDetailPanel,
  parseDesktopChatRoomRoute,
} from '@/features/chat';
import { useDesktopDetailRoute } from '@/shared/lib/hooks';
import { DesktopSplitView } from '@/shared/ui/layout';

export default function ChatPage() {
  const {
    isDesktop,
    selectedDetailPath,
    navigateToDetail,
    closeDetail,
  } = useDesktopDetailRoute({ basePath: '/chat' });
  const activeRoomId = selectedDetailPath
    ? parseDesktopChatRoomRoute(selectedDetailPath)?.roomId ?? null
    : null;

  return (
    <DesktopSplitView
      enabled={isDesktop}
      listContent={
        <ChatInboxView
          onRoomSelect={(roomId) => navigateToDetail(`/chat/rooms/${roomId}`)}
          activeRoomId={activeRoomId}
          isSplitLayout={isDesktop}
        />
      }
      detailContent={
        <ChatRouteDetailPanel
          routePath={selectedDetailPath}
          onClose={closeDetail}
          emptyMessage="왼쪽 목록에서 채팅을 선택해 주세요."
        />
      }
    />
  );
}
