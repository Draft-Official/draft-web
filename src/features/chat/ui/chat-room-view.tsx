'use client';

import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bell, BellOff, Flag, MoreHorizontal, Send } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { formatKSTTime, getKSTDateParts } from '@/shared/lib/datetime';
import { cn } from '@/shared/lib/utils';
import { useMatchChatMessages, useMatchChatRoom } from '../api/queries';
import {
  useLeaveMatchChatRoom,
  useMarkMatchChatRead,
  useReportMatchChatRoom,
  useSendMatchChatMessage,
  useSetMatchChatMute,
} from '../api/mutations';
import { useMatchChatRealtime } from '../lib/use-match-chat-realtime';
import type { MatchChatMessageDTO } from '../model/types';

interface ChatRoomViewProps {
  roomId: string;
  layoutMode?: 'page' | 'split';
}

const REPORT_REASONS = [
  '스팸/광고',
  '욕설/혐오 표현',
  '사기/거래 위험',
  '기타',
] as const;

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

function MessageBubble({
  message,
  showReadIndicator = false,
}: {
  message: MatchChatMessageDTO;
  showReadIndicator?: boolean;
}) {
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
        <p className={cn('mt-1 text-xs text-slate-400', message.isMine ? 'text-right' : 'text-left')}>
          {message.isMine && showReadIndicator ? '읽음 · ' : ''}
          {formatKSTTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

export function ChatRoomView({ roomId, layoutMode = 'page' }: ChatRoomViewProps) {
  const router = useRouter();
  const isSplitLayout = layoutMode === 'split';

  const { data: room, isLoading: isLoadingRoom, isError: isRoomError } = useMatchChatRoom(roomId);
  const { data: messages = [], isLoading: isLoadingMessages, isError: isMessagesError } = useMatchChatMessages(roomId);

  const sendMessageMutation = useSendMatchChatMessage();
  const markReadMutation = useMarkMatchChatRead();
  const muteRoomMutation = useSetMatchChatMute();
  const leaveRoomMutation = useLeaveMatchChatRoom();
  const reportRoomMutation = useReportMatchChatRoom();

  const [input, setInput] = useState('');
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState<(typeof REPORT_REASONS)[number]>(REPORT_REASONS[0]);
  const [reportDetails, setReportDetails] = useState('');
  const [lastMarkedIncomingMessageId, setLastMarkedIncomingMessageId] = useState<string | null>(null);
  const hasInitialReadSync = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isSubmittingMessageRef = useRef(false);

  useMatchChatRealtime({ roomId });

  useEffect(() => {
    hasInitialReadSync.current = false;
    setLastMarkedIncomingMessageId(null);
    setInput('');
    setIsLeaveDialogOpen(false);
    setIsReportDialogOpen(false);
    setReportReason(REPORT_REASONS[0]);
    setReportDetails('');
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

  const lastReadMineMessageId = useMemo(() => {
    if (!room) {
      return null;
    }

    const opponentLastReadAt =
      room.myRole === 'host' ? room.guestLastReadAt : room.hostLastReadAt;
    if (!opponentLastReadAt) {
      return null;
    }

    const opponentReadMillis = Date.parse(opponentLastReadAt);
    if (Number.isNaN(opponentReadMillis)) {
      return null;
    }

    let latestId: string | null = null;

    for (const message of messages) {
      if (!message.isMine) {
        continue;
      }

      const messageMillis = Date.parse(message.createdAt);
      if (!Number.isNaN(messageMillis) && messageMillis <= opponentReadMillis) {
        latestId = message.id;
      }
    }

    return latestId;
  }, [room, messages]);

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

  const sendMessageOnce = async () => {
    if (isSubmittingMessageRef.current) {
      return;
    }
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    if (trimmed.length > 1000) {
      toast.error('메시지는 1000자 이하로 입력해 주세요.');
      return;
    }

    try {
      isSubmittingMessageRef.current = true;
      await sendMessageMutation.mutateAsync({ roomId, body: trimmed });
      setInput('');
    } catch (error) {
      const message = error instanceof Error ? error.message : '메시지 전송에 실패했습니다.';
      toast.error(message);
    } finally {
      isSubmittingMessageRef.current = false;
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessageOnce();
  };

  const handleBack = () => {
    if (isSplitLayout) {
      return;
    }

    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.replace('/chat');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (sendMessageMutation.isPending) {
        return;
      }
      void sendMessageOnce();
    }
  };

  const handleToggleMute = async () => {
    if (!room) {
      return;
    }

    try {
      await muteRoomMutation.mutateAsync({
        roomId: room.roomId,
        role: room.myRole,
        muted: !room.isMuted,
      });
      toast.success(room.isMuted ? '채팅 알림을 켰습니다.' : '채팅 알림을 껐습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '알림 설정을 변경하지 못했습니다.';
      toast.error(message);
    }
  };

  const handleLeaveRoom = async () => {
    if (!room) {
      return;
    }

    try {
      await leaveRoomMutation.mutateAsync({
        roomId: room.roomId,
        role: room.myRole,
      });
      setIsLeaveDialogOpen(false);
      toast.success('채팅방에서 나갔습니다.');
      router.replace('/chat');
    } catch (error) {
      const message = error instanceof Error ? error.message : '채팅방 나가기에 실패했습니다.';
      toast.error(message);
    }
  };

  const handleSubmitReport = async () => {
    if (!room) {
      return;
    }

    try {
      await reportRoomMutation.mutateAsync({
        roomId: room.roomId,
        reason: reportReason,
        details: reportDetails.trim() || undefined,
      });
      setIsReportDialogOpen(false);
      setReportReason(REPORT_REASONS[0]);
      setReportDetails('');
      toast.success('신고가 접수되었습니다. 빠르게 확인하겠습니다.');
    } catch (error) {
      const message = error instanceof Error ? error.message : '신고 접수에 실패했습니다.';
      toast.error(message);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-white',
        isSplitLayout ? 'h-full min-h-0' : 'min-h-[calc(100dvh-56px)]'
      )}>
        <Spinner className="h-8 w-8 text-muted-foreground" />
      </div>
    );
  }

  if (isRoomError || !room) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center gap-3 bg-white px-6 text-center',
        isSplitLayout ? 'h-full min-h-0' : 'min-h-[calc(100dvh-56px)]'
      )}>
        <p className="text-base font-bold text-slate-900">채팅방을 찾을 수 없습니다.</p>
        <p className="text-sm text-slate-500">권한이 없거나 삭제된 채팅방입니다.</p>
        <Button variant="outline" onClick={() => router.replace('/chat')}>채팅 목록으로</Button>
      </div>
    );
  }

  const isGuestToHostInquiry = room.myRole === 'guest';
  const headerTitle = isGuestToHostInquiry ? room.teamName : room.otherUserName;
  const headerAvatar = isGuestToHostInquiry ? room.teamLogoUrl : room.otherUserAvatar;
  const headerSubtitle = isGuestToHostInquiry
    ? formatRoomMeta(room.matchStartTimeISO)
    : `${room.teamName} · ${formatRoomMeta(room.matchStartTimeISO)}`;
  const headerInitial = headerTitle.substring(0, 1) || 'T';

  return (
    <div className={cn(
      'flex flex-col bg-white',
      isSplitLayout ? 'h-full min-h-0' : 'min-h-[calc(100dvh-56px)]'
    )}>
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className={cn(
          'flex h-14 items-center px-3',
          isSplitLayout ? 'w-full' : 'app-content-container'
        )}>
          {!isSplitLayout && (
            <button
              type="button"
              onClick={handleBack}
              className="mr-2 rounded-full p-2 text-slate-700 transition-colors hover:bg-slate-100"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          <Avatar className="mr-2.5 h-9 w-9 border border-slate-200">
            <AvatarImage src={headerAvatar || undefined} />
            <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
              {headerInitial}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{headerTitle}</p>
            <p className="truncate text-xs text-slate-500">
              {headerSubtitle}
            </p>
          </div>

          {room.isMuted ? (
            <span className="ml-2 inline-flex shrink-0 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold leading-none text-slate-500">
              알림 꺼짐
            </span>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="채팅 옵션"
                className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-slate-100"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-white">
              <DropdownMenuItem
                onClick={() => {
                  void handleToggleMute();
                }}
                className="cursor-pointer py-2.5"
                disabled={muteRoomMutation.isPending}
              >
                {room.isMuted ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                <span>{room.isMuted ? '알림 켜기' : '알림 끄기'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsReportDialogOpen(true)}
                className="cursor-pointer py-2.5"
              >
                <Flag className="h-4 w-4" />
                <span>신고하기</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setIsLeaveDialogOpen(true)}
                variant="destructive"
                className="cursor-pointer py-2.5"
              >
                <span>채팅방 나가기</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main
        ref={scrollRef}
        className={cn(
          'flex-1 overflow-y-auto px-4 py-4',
          isSplitLayout ? 'w-full' : 'app-content-container'
        )}
      >
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
                  <span className="inline-flex items-center whitespace-nowrap rounded-full bg-slate-100 px-3 py-1 text-xs font-medium leading-none text-slate-500">
                    {section.dateLabel}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {section.items.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      showReadIndicator={message.id === lastReadMineMessageId}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </main>

      <footer className="sticky bottom-0 border-t border-slate-100 bg-white">
        <form
          onSubmit={handleSubmit}
          className={cn(
            'px-3 py-2.5',
            isSplitLayout ? 'w-full' : 'app-content-container'
          )}
        >
          <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={1}
              maxLength={1000}
              placeholder="메시지를 입력하세요"
              className="max-h-28 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-[16px] leading-6 text-slate-900 outline-none placeholder:text-slate-400"
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

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>채팅 신고하기</DialogTitle>
            <DialogDescription>
              신고 사유를 선택해 주세요. 접수된 신고는 운영팀에서 확인 후 처리합니다.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2">
            {REPORT_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                onClick={() => setReportReason(reason)}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                  reportReason === reason
                    ? 'border-primary bg-brand-weak text-primary'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                )}
              >
                {reason}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="chat-report-details" className="mb-1 block text-xs font-semibold text-slate-600">
              상세 내용 (선택)
            </label>
            <textarea
              id="chat-report-details"
              value={reportDetails}
              onChange={(event) => setReportDetails(event.target.value)}
              maxLength={1000}
              rows={4}
              placeholder="상황을 구체적으로 작성하면 더 빠르게 검토할 수 있어요."
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[16px] leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:border-primary"
            />
          </div>

          <DialogFooter className="bg-transparent -mx-0 -mb-0 rounded-none border-0 p-0 pt-2">
            <Button variant="outline" onClick={() => setIsReportDialogOpen(false)}>
              취소
            </Button>
            <Button
              onClick={() => {
                void handleSubmitReport();
              }}
              disabled={reportRoomMutation.isPending}
            >
              {reportRoomMutation.isPending ? '접수 중...' : '신고 접수'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>채팅방에서 나가시겠어요?</DialogTitle>
            <DialogDescription>
              나가면 목록에서 채팅방이 사라집니다. 같은 경기에서 다시 문의하면 대화를 재입장할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-transparent -mx-0 -mb-0 rounded-none border-0 p-0 pt-2">
            <Button variant="outline" onClick={() => setIsLeaveDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                void handleLeaveRoom();
              }}
              disabled={leaveRoomMutation.isPending}
            >
              {leaveRoomMutation.isPending ? '나가는 중...' : '나가기'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
