'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Button } from '@/shared/ui/shadcn/button';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { formatKSTTime, getKSTDateParts } from '@/shared/lib/datetime';
import { cn } from '@/shared/lib/utils';
import { useMatchChatMessages, useMatchChatRoom } from '../api/queries';
import { useMarkMatchChatRead, useSendMatchChatMessage } from '../api/mutations';
import { matchChatKeys } from '../api/keys';
import type { MatchChatMessageDTO } from '../model/types';

interface ChatRoomViewProps {
  roomId: string;
}

function formatRoomMeta(iso: string): string {
  const parts = getKSTDateParts(iso);
  if (!parts) {
    return '';
  }

  return `${parts.month}월 ${parts.day}일 (${parts.weekdayLabel}) ${formatKSTTime(iso)}`;
}

function formatDateDivider(date: string): string {
  const parts = getKSTDateParts(date);
  if (!parts) {
    return date;
  }

  return `${parts.year}년 ${parts.month}월 ${parts.day}일 (${parts.weekdayLabel})`;
}

function formatDayKey(date: string): string {
  const parts = getKSTDateParts(date);
  if (!parts) {
    return date;
  }

  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function MessageBubble({ message }: { message: MatchChatMessageDTO }) {
  return (
    <div className={cn('flex', message.isMine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%]', message.isMine ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'break-words rounded-2xl px-3.5 py-2 text-sm leading-relaxed',
            message.isMine
              ? 'rounded-br-sm bg-primary text-white'
              : 'rounded-bl-sm bg-slate-100 text-slate-800'
          )}
        >
          {message.body}
        </div>
        <p className={cn('mt-1 text-[11px] text-slate-400', message.isMine ? 'text-right' : 'text-left')}>
          {formatKSTTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function ChatRoomView({ roomId }: ChatRoomViewProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: room, isLoading: isLoadingRoom, isError: isRoomError } = useMatchChatRoom(roomId);
  const { data: messages = [], isLoading: isLoadingMessages, isError: isMessagesError } = useMatchChatMessages(roomId);

  const sendMessageMutation = useSendMatchChatMessage();
  const markReadMutation = useMarkMatchChatRead();

  const [input, setInput] = useState('');
  const [lastMarkedIncomingMessageId, setLastMarkedIncomingMessageId] = useState<string | null>(null);
  const hasInitialReadSync = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    hasInitialReadSync.current = false;
    setLastMarkedIncomingMessageId(null);
    setInput('');
  }, [roomId]);

  const groupedMessages = useMemo(() => {
    const sections: Array<{ dayKey: string; dateLabel: string; items: MatchChatMessageDTO[] }> = [];

    for (const message of messages) {
      const dayKey = formatDayKey(message.createdAt);
      const lastSection = sections[sections.length - 1];

      if (!lastSection || lastSection.dayKey !== dayKey) {
        sections.push({
          dayKey,
          dateLabel: formatDateDivider(message.createdAt),
          items: [message],
        });
      } else {
        lastSection.items.push(message);
      }
    }

    return sections;
  }, [messages]);

  useEffect(() => {
    if (!scrollRef.current) {
      return;
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages.length]);

  useEffect(() => {
    if (!room) {
      return;
    }

    if (room.unreadCount > 0 && !hasInitialReadSync.current) {
      hasInitialReadSync.current = true;
      markReadMutation.mutate({ roomId: room.roomId, role: room.myRole });
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.isMine) {
      return;
    }

    if (lastMessage.id === lastMarkedIncomingMessageId) {
      return;
    }

    setLastMarkedIncomingMessageId(lastMessage.id);
    markReadMutation.mutate({ roomId: room.roomId, role: room.myRole });
  }, [room, messages, lastMarkedIncomingMessageId, markReadMutation]);

  useEffect(() => {
    if (!roomId) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`match-chat-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: matchChatKeys.all });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.length > 1000) {
      toast.error('메시지는 1000자 이하로 입력해 주세요.');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({ roomId, body: trimmed });
      setInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace('/chat');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || sendMessageMutation.isPending) {
        return;
      }

      if (trimmed.length > 1000) {
        toast.error('메시지는 1000자 이하로 입력해 주세요.');
        return;
      }

      void sendMessageMutation.mutateAsync({ roomId, body: trimmed })
        .then(() => setInput(''))
        .catch((error) => {
          const message = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.';
          toast.error(message);
        });
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="flex min-h-[calc(100dvh-56px)] items-center justify-center bg-white">
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className="flex min-h-[calc(100dvh-56px)] flex-col items-center justify-center gap-3 bg-white px-6 text-center">
        <p className="text-base font-bold text-slate-900">채팅방을 찾을 수 없습니다.</p>
        <p className="text-sm text-slate-500">권한이 없거나 삭제된 채팅방입니다.</p>
        <Button variant="outline" onClick={() => router.replace('/chat')}>채팅 목록으로</Button>
      </div>
    );
  }

  const otherInitial = room.otherUserName.substring(0, 1) || 'U';

  return (
    <div className="flex min-h-[calc(100dvh-56px)] flex-col bg-white">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="app-content-container flex h-14 items-center px-3">
          <button
            type="button"
            onClick={handleBack}
            className="mr-2 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100"
            aria-label="뒤로가기"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <Avatar className="mr-2.5 h-9 w-9 border border-slate-200">
            <AvatarImage src={room.otherUserAvatar || undefined} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
              {otherInitial}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{room.otherUserName}</p>
            <p className="truncate text-xs text-slate-500">
              {room.teamName} · {formatRoomMeta(room.matchStartTimeISO)}
            </p>
          </div>
        </div>
      </header>

      <main ref={scrollRef} className="app-content-container flex-1 overflow-y-auto px-4 py-4">
        {isLoadingMessages ? (
          <div className="flex h-full items-center justify-center">
            <Spinner className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : null}

        {!isLoadingMessages && isMessagesError ? (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            메시지를 불러오지 못했습니다.
          </div>
        ) : null}

        {!isLoadingMessages && !isMessagesError && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-slate-800">아직 대화가 없습니다.</p>
            <p className="mt-1 text-xs text-slate-500">첫 메시지를 보내 문의를 시작해 보세요.</p>
          </div>
        ) : null}

        {!isLoadingMessages && !isMessagesError && messages.length > 0 ? (
          <div className="space-y-4 pb-20">
            {groupedMessages.map((section) => (
              <section key={section.dayKey}>
                <div className="mb-3 flex justify-center">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                    {section.dateLabel}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {section.items.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </main>

      <footer className="sticky bottom-0 border-t border-slate-100 bg-white">
        <form onSubmit={handleSubmit} className="app-content-container px-3 py-2.5">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="메시지를 입력하세요"
              className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <Button
              type="submit"
              size="icon"
              className="h-9 w-9 rounded-full"
              disabled={!input.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
