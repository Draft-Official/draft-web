'use client';

import {
  ChatInboxView,
  ChatRouteDetailPanel,
  parseDesktopChatRoomRoute,
} from '@/features/chat';
import { LoginRequiredBlock } from '@/features/auth';
import { useDesktopDetailRoute } from '@/shared/lib/hooks';
import { useAuth } from '@/shared/session';
import { DesktopSplitView } from '@/shared/ui/layout';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function ChatPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const {
    isDesktop,
    selectedDetailPath,
    navigateToDetail,
    closeDetail,
  } = useDesktopDetailRoute({ basePath: '/chat' });
  const activeRoomId = selectedDetailPath
    ? parseDesktopChatRoomRoute(selectedDetailPath)?.roomId ?? null
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginRequiredBlock description="로그인하고 다양한 기능을 이용해보세요." redirectTo="/chat" />;
  }

  return (
    <DesktopSplitView
      enabled={isDesktop}
      className="grid-cols-[minmax(320px,1fr)_minmax(0,2fr)]"
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
