'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MessageCircle, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { cn } from '@/shared/lib/utils';
import { formatRelativeTime } from '@/features/notification/lib/format-time';
import { formatKSTTime, getKSTDateParts } from '@/shared/lib/datetime';
import { useMatchChatRooms } from '../api/queries';
import type { MatchChatRoomListItemDTO } from '../model/types';

type ChatMode = 'all' | 'host' | 'guest';

const CHAT_MODE_TABS: Array<{ mode: ChatMode; label: string }> = [
  { mode: 'all', label: '전체' },
  { mode: 'host', label: '호스트' },
  { mode: 'guest', label: '게스트' },
];

function formatMatchSummary(iso: string): string {
  const parts = getKSTDateParts(iso);
  if (!parts) {
    return '';
  }

  return `${parts.month}월 ${parts.day}일 (${parts.weekdayLabel}) ${formatKSTTime(iso)}`;
}

function ChatRoomListItem({
  room,
  onClick,
}: {
  room: MatchChatRoomListItemDTO;
  onClick: () => void;
}) {
  const initial = room.otherUserName.substring(0, 1) || 'U';

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-100 bg-white px-4 py-3 text-left transition-colors hover:bg-slate-50"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-11 w-11 border border-slate-200">
          <AvatarImage src={room.otherUserAvatar || undefined} />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-sm font-bold">
            {initial}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{room.otherUserName}</p>
              <p className="truncate text-xs text-slate-500">
                {room.teamName} · {formatMatchSummary(room.matchStartTimeISO)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-[11px] text-slate-400">
                {room.lastMessageAt ? formatRelativeTime(room.lastMessageAt) : ''}
              </span>
              {room.unreadCount > 0 && (
                <span className="inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {room.unreadCount > 99 ? '99+' : room.unreadCount}
                </span>
              )}
            </div>
          </div>

          <div className="mt-1.5 flex items-center justify-between gap-2">
            <p className="truncate text-sm text-slate-600">
              {room.lastMessagePreview || '대화를 시작해 보세요.'}
            </p>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
          </div>
        </div>
      </div>
    </button>
  );
}

function groupRoomsByMatch(rooms: MatchChatRoomListItemDTO[]) {
  const map = new Map<string, MatchChatRoomListItemDTO[]>();

  for (const room of rooms) {
    const list = map.get(room.matchId);
    if (list) {
      list.push(room);
    } else {
      map.set(room.matchId, [room]);
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const firstA = a[0];
    const firstB = b[0];
    const timeA = firstA?.lastMessageAt || firstA?.createdAt || '';
    const timeB = firstB?.lastMessageAt || firstB?.createdAt || '';
    if (timeA === timeB) {
      return 0;
    }
    return timeA > timeB ? -1 : 1;
  });
}

export function ChatInboxView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const modeFromQuery = (() => {
    const value = searchParams?.get('mode');
    if (value === 'host' || value === 'guest') {
      return value;
    }
    return 'all';
  })();

  const [mode, setMode] = useState<ChatMode>(modeFromQuery);
  const matchId = searchParams?.get('matchId') || undefined;

  useEffect(() => {
    setMode(modeFromQuery);
  }, [modeFromQuery]);

  const {
    data: rooms = [],
    isLoading,
    isError,
  } = useMatchChatRooms({ mode, matchId });

  const groupedHostRooms = useMemo(() => {
    if (mode !== 'host') {
      return [];
    }
    return groupRoomsByMatch(rooms);
  }, [mode, rooms]);

  const openRoom = (roomId: string) => {
    router.push(`/chat/rooms/${roomId}`);
  };

  return (
    <div className="min-h-full bg-background px-(--dimension-spacing-x-global-gutter) py-(--dimension-spacing-y-component-default) pb-(--dimension-spacing-y-screen-bottom)">
      <section className="mb-4">
        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">채팅</h1>
        <p className="mt-1 text-sm text-slate-500">문의/응답을 채팅으로 빠르게 처리하세요.</p>
      </section>

      <section className="mb-4 flex items-center gap-2 overflow-x-auto">
        {CHAT_MODE_TABS.map((tab) => (
          <button
            key={tab.mode}
            type="button"
            onClick={() => setMode(tab.mode)}
            className={cn(
              'rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors',
              mode === tab.mode
                ? 'border-primary bg-brand-weak text-primary'
                : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-14">
          <Spinner className="mb-3 h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-slate-500">채팅방을 불러오는 중...</p>
        </div>
      ) : null}

      {!isLoading && isError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-5 text-sm text-red-700">
          채팅방 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </div>
      ) : null}

      {!isLoading && !isError && rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-16 text-center">
          <div className="mb-3 rounded-full bg-slate-100 p-4">
            <MessageCircle className="h-6 w-6 text-slate-500" />
          </div>
          <p className="text-sm font-semibold text-slate-800">아직 채팅이 없습니다.</p>
          <p className="mt-1 text-xs text-slate-500">매치 상세에서 문의 채팅을 시작해 보세요.</p>
        </div>
      ) : null}

      {!isLoading && !isError && rooms.length > 0 && mode !== 'host' ? (
        <div className="space-y-2.5">
          {rooms.map((room) => (
            <ChatRoomListItem key={room.roomId} room={room} onClick={() => openRoom(room.roomId)} />
          ))}
        </div>
      ) : null}

      {!isLoading && !isError && rooms.length > 0 && mode === 'host' ? (
        <div className="space-y-4">
          {groupedHostRooms.map((group) => {
            const first = group[0];
            if (!first) {
              return null;
            }

            return (
              <section key={first.matchId} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <header className="mb-2 px-1">
                  <p className="text-sm font-bold text-slate-900">{first.teamName}</p>
                  <p className="text-xs text-slate-500">{formatMatchSummary(first.matchStartTimeISO)}</p>
                </header>
                <div className="space-y-2">
                  {group.map((room) => (
                    <ChatRoomListItem
                      key={room.roomId}
                      room={room}
                      onClick={() => openRoom(room.roomId)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
