'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Megaphone,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import type { CancelTypeValue } from "@/src/shared/config/application-constants";
import type { MatchApplicantDTO, GuestStatus } from '../../model/types';
import {
  useHostMatchDetail,
  useMatchApplicants,
  useApproveApplication,
  useConfirmPaymentByHost,
  useRejectApplication,
  useCancelParticipation,
  useUpdateMatchStatus,
  useUpdateRecruitmentSetup,
  useCreateAnnouncement,
  useCancelMatchFlow,
} from '@/features/schedule';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { GuestProfileDialog } from './guest-profile-dialog';
import { EditQuotaDialog } from './edit-quota-dialog';
import { CancelConfirmDialog } from './cancel-confirm-dialog';
import { AnnouncementDialog } from './announcement-dialog';
import { MatchCancelDialog } from './match-cancel-dialog';
import { RecruitmentStatusSection } from './recruitment-status-section';
import { GuestListSection } from './guest-list-section';
import { MatchActionButton } from './match-action-button';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { useHostMatchChatRooms } from '@/features/chat';
import { formatRelativeTime } from '@/features/notification/lib/format-time';

interface HostMatchDetailViewProps {
  matchIdentifier?: string;
  onBack?: () => void;
  layoutMode?: 'page' | 'split';
}

export function HostMatchDetailView({
  matchIdentifier: matchIdentifierProp,
  onBack,
  layoutMode = 'page',
}: HostMatchDetailViewProps = {}) {
  const router = useRouter();
  const params = useParams();
  const idParam = params?.id;
  const routeIdentifier = Array.isArray(idParam) ? (idParam[0] ?? '') : (idParam ?? '');
  const matchIdentifier = matchIdentifierProp ?? routeIdentifier;

  // React Query hooks
  const { data: match, isLoading: isLoadingMatch } = useHostMatchDetail(matchIdentifier);
  const internalMatchId = match?.id ?? '';
  const { data: guests = [], isLoading: isLoadingGuests } = useMatchApplicants(internalMatchId);
  const { data: chatRooms = [], isLoading: isLoadingChatRooms } = useHostMatchChatRooms(internalMatchId);

  // Mutations
  const approveMutation = useApproveApplication();
  const confirmMutation = useConfirmPaymentByHost();
  const rejectMutation = useRejectApplication();
  const cancelMutation = useCancelParticipation();
  const statusMutation = useUpdateMatchStatus();
  const recruitmentMutation = useUpdateRecruitmentSetup();
  const announcementMutation = useCreateAnnouncement();
  const cancelMatchFlowMutation = useCancelMatchFlow();

  // Local state
  const [selectedTab, setSelectedTab] = useState<GuestStatus>('pending');
  const [selectedGuest, setSelectedGuest] = useState<MatchApplicantDTO | null>(null);
  const [isGuestProfileOpen, setIsGuestProfileOpen] = useState(false);
  const [isEditQuotaOpen, setIsEditQuotaOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [guestToCancel, setGuestToCancel] = useState<MatchApplicantDTO | null>(null);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [guestToReject, setGuestToReject] = useState<MatchApplicantDTO | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isMatchCancelOpen, setIsMatchCancelOpen] = useState(false);
  const [overQuotaGuest, setOverQuotaGuest] = useState<MatchApplicantDTO | null>(null);

  const isLoading = isLoadingMatch || (!!internalMatchId && isLoadingGuests);

  // Match status helpers (DB status + 시간 기반 파생)
  const matchStatus = match?.status;
  const isMatchFinished = !!(match?.endTimeISO && new Date() >= new Date(match.endTimeISO));
  const isMatchCanceled = matchStatus === 'CANCELED';
  const isEnded = isMatchFinished || isMatchCanceled;
  const isRecruiting = !isEnded && matchStatus === 'RECRUITING';
  const isClosed = !isEnded && matchStatus === 'CLOSED';
  const isConfirmed = !isEnded && (matchStatus === 'CONFIRMED' || matchStatus === 'ONGOING');

  // 확정자 수 계산 (포지션별, 동반인 포함)
  const confirmedCountByPosition = guests
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, guest) => {
      const posMatch = guest.position.match(/\(([A-Z]+)\)/);
      const posCode = posMatch ? posMatch[1] : 'G';
      acc[posCode] = (acc[posCode] || 0) + 1;

      if (guest.companions) {
        guest.companions.forEach((c) => {
          const cPosMatch = c.position.match(/\(([A-Z]+)\)/);
          const cPosCode = cPosMatch ? cPosMatch[1] : 'G';
          acc[cPosCode] = (acc[cPosCode] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

  // 전체 확정자 수 (동반인 포함)
  const totalConfirmedCount = guests
    .filter((g) => g.status === 'confirmed')
    .reduce((sum, g) => sum + 1 + (g.companions?.length || 0), 0);

  // 포지션/전체 모집 인원이 찼는지 확인
  const isPositionFull = (guest: MatchApplicantDTO): boolean => {
    if (!match) return false;
    if (match.recruitmentMode === 'position' && match.positionQuotas) {
      const posCode = guest.position.match(/\(([A-Z]+)\)/)?.[1] ?? 'G';
      const quota = match.positionQuotas.find((q) => q.position === posCode);
      return !!quota && quota.current >= quota.max;
    }
    if (match.recruitmentMode === 'total' && match.totalQuota) {
      return totalConfirmedCount >= match.totalQuota.max;
    }
    return false;
  };

  const doApprove = (guest: MatchApplicantDTO) => {
    approveMutation.mutate(
      { applicationId: guest.id, matchId: internalMatchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  // Handlers
  const handleApprove = (guest: MatchApplicantDTO) => {
    if (!internalMatchId) return;
    if (isPositionFull(guest)) {
      setOverQuotaGuest(guest);
      return;
    }
    doApprove(guest);
  };

  const handleConfirmPayment = (guest: MatchApplicantDTO) => {
    if (!internalMatchId) return;
    confirmMutation.mutate(
      { applicationId: guest.id, matchId: internalMatchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleReject = (guest: MatchApplicantDTO) => {
    if (!internalMatchId) return;
    rejectMutation.mutate(
      { applicationId: guest.id, matchId: internalMatchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleCancel = (guest: MatchApplicantDTO, cancelType?: CancelTypeValue) => {
    if (!internalMatchId) return;
    cancelMutation.mutate(
      {
        applicationId: guest.id,
        matchId: internalMatchId,
        cancelOptions: cancelType ? { cancelType } : undefined,
      },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const openGuestProfile = (guest: MatchApplicantDTO) => {
    setSelectedGuest(guest);
    setIsGuestProfileOpen(true);
  };

  const openCancelConfirm = (guest: MatchApplicantDTO) => {
    setGuestToCancel(guest);
    setIsCancelConfirmOpen(true);
  };

  const openRejectConfirm = (guest: MatchApplicantDTO) => {
    setGuestToReject(guest);
    setIsRejectConfirmOpen(true);
  };

  const handleCloseRecruiting = () => {
    if (!internalMatchId) return;
    statusMutation.mutate({ matchId: internalMatchId, status: 'CLOSED' });
  };

  const handleResumeRecruiting = () => {
    if (!internalMatchId) return;
    statusMutation.mutate({ matchId: internalMatchId, status: 'RECRUITING' });
  };

  const openChatRoom = (roomId: string) => {
    router.push(`/chat/rooms/${roomId}`);
  };

  // Loading state
  if (isLoading || !match) {
    return (
      <div className={layoutMode === 'split'
        ? 'bg-slate-50 min-h-full flex items-center justify-center'
        : 'bg-slate-50 min-h-screen flex items-center justify-center'}
      >
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-8 h-8 text-muted-foreground " />
          <p className="text-slate-500">경기 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={layoutMode === 'split' ? 'bg-slate-50 min-h-full pb-24' : 'bg-slate-50 min-h-screen pb-40'}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => {
            if (onBack) {
              onBack();
              return;
            }
            router.back();
          }}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        <h1 className="font-bold text-lg text-slate-900">경기 상세</h1>

        <div className="flex items-center gap-1">
          {!isEnded && (
            <button
              onClick={() => setIsAnnouncementOpen(true)}
              className="p-2 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Megaphone className="w-5 h-5 text-slate-700" />
            </button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 -mr-2 hover:bg-slate-50 rounded-lg transition-colors">
                <MoreVertical className="w-6 h-6 text-slate-700" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => router.push(`/matches/${match.publicId}`)}>
                상세페이지 보기
              </DropdownMenuItem>
              {!isEnded && (isClosed || isConfirmed) && (
                <DropdownMenuItem onClick={handleResumeRecruiting}>
                  추가 모집하기
                </DropdownMenuItem>
              )}
              {!isEnded && (
                <DropdownMenuItem onClick={() => router.push(`/matches/create?edit=${match.id}`)}>
                  경기 수정
                </DropdownMenuItem>
              )}
              {!isEnded && (
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => setIsMatchCancelOpen(true)}
                >
                  경기 취소
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="app-content-container p-4 space-y-4">
        {/* 경기 기본 정보 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CalendarIcon className="w-5 h-5 text-muted-foreground" />
            <span>{match.date}</span>
            <Clock className="w-5 h-5 text-muted-foreground ml-2" />
            <span>{match.time}</span>
          </div>

          <a
            href={match.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-muted-foreground transition-colors"
          >
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{match.location}</span>
          </a>

          <div className="flex items-center gap-2 text-slate-700">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-medium">{match.teamName}</span>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">문의 채팅</h2>
              <p className="mt-0.5 text-xs text-slate-500">이 경기에 대한 문의 채팅을 빠르게 확인하세요.</p>
            </div>
            <div className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {chatRooms.length}개
            </div>
          </div>

          {isLoadingChatRooms ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="h-5 w-5 text-muted-foreground" />
            </div>
          ) : null}

          {!isLoadingChatRooms && chatRooms.length === 0 ? (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-center">
              <MessageCircle className="mx-auto mb-2 h-5 w-5 text-slate-400" />
              <p className="text-sm text-slate-500">아직 문의 채팅이 없습니다.</p>
            </div>
          ) : null}

          {!isLoadingChatRooms && chatRooms.length > 0 ? (
            <div className="space-y-2.5">
              {chatRooms.map((room) => (
                <button
                  key={room.roomId}
                  type="button"
                  onClick={() => openChatRoom(room.roomId)}
                  className="w-full rounded-xl border border-slate-100 bg-white px-3.5 py-3 text-left transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{room.otherUserName}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {room.lastMessagePreview || '대화를 시작해 보세요.'}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-[11px] text-slate-400">
                        {room.lastMessageAt ? formatRelativeTime(room.lastMessageAt) : ''}
                      </span>
                      {room.unreadCount > 0 ? (
                        <span className="inline-flex min-w-5 justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                          {room.unreadCount > 99 ? '99+' : room.unreadCount}
                        </span>
                      ) : null}
                      <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : null}
        </section>

        {/* 모집 현황 */}
        <RecruitmentStatusSection
          match={match}
          confirmedCountByPosition={confirmedCountByPosition}
          totalConfirmedCount={totalConfirmedCount}
          isEnded={isEnded}
          onEditClick={() => setIsEditQuotaOpen(true)}
        />

        {/* 게스트 목록 */}
        <GuestListSection
          guests={guests}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          isEnded={isEnded}
          onGuestClick={openGuestProfile}
          onApprove={handleApprove}
          onReject={openRejectConfirm}
          onConfirmPayment={handleConfirmPayment}
          onCancelClick={openCancelConfirm}
        />
      </div>

      {/* Dialogs */}
      <GuestProfileDialog
        guest={selectedGuest}
        open={isGuestProfileOpen}
        onOpenChange={setIsGuestProfileOpen}
        onApprove={handleApprove}
        onReject={(guest) => {
          setIsGuestProfileOpen(false);
          openRejectConfirm(guest);
        }}
        onConfirmPayment={handleConfirmPayment}
        onCancel={(guest) => {
          setIsGuestProfileOpen(false);
          openCancelConfirm(guest);
        }}
        isEnded={isEnded}
      />

      <EditQuotaDialog
        open={isEditQuotaOpen}
        onOpenChange={setIsEditQuotaOpen}
        match={match}
        onSave={(recruitmentSetup) => {
          if (!internalMatchId) return;
          recruitmentMutation.mutate(
            { matchId: internalMatchId, recruitmentSetup },
            { onSuccess: () => setIsEditQuotaOpen(false) }
          );
        }}
      />

      <AnnouncementDialog
        open={isAnnouncementOpen}
        onOpenChange={setIsAnnouncementOpen}
        onSubmit={(message) => {
          if (!internalMatchId) return;
          announcementMutation.mutate({ matchId: internalMatchId, message });
        }}
      />

      <Dialog open={isRejectConfirmOpen} onOpenChange={setIsRejectConfirmOpen}>
        <DialogContent size="base" className="rounded-2xl p-6" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>신청 거절</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              {guestToReject?.name}님의 신청을 거절하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              onClick={() => setIsRejectConfirmOpen(false)}
            >
              닫기
            </Button>
            <Button
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
              onClick={() => {
                if (guestToReject) handleReject(guestToReject);
                setIsRejectConfirmOpen(false);
              }}
            >
              거절
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <CancelConfirmDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        guestName={guestToCancel?.name}
        guestAccountInfo={guestToCancel?.accountInfo}
        onConfirm={(cancelType) => {
          if (guestToCancel) {
            handleCancel(guestToCancel, cancelType);
          }
        }}
      />

      <MatchCancelDialog
        open={isMatchCancelOpen}
        onOpenChange={setIsMatchCancelOpen}
        settlementGuests={guests.filter(
          (g) => g.status === 'confirmed' || g.status === 'payment_waiting'
        )}
        onConfirm={(message) => {
          if (!internalMatchId) return;
          const hasSettlementTarget = guests.some(
            (g) => g.status === 'confirmed' || g.status === 'payment_waiting'
          );
          if (hasSettlementTarget) {
            cancelMatchFlowMutation.mutate(
              { matchId: internalMatchId, message },
              { onSuccess: () => router.back() }
            );
          } else {
            statusMutation.mutate(
              { matchId: internalMatchId, status: 'CANCELED' },
              { onSuccess: () => router.back() }
            );
          }
        }}
      />

      {/* 포지션 초과 승인 경고 */}
      <Dialog open={!!overQuotaGuest} onOpenChange={(open) => { if (!open) setOverQuotaGuest(null); }}>
        <DialogContent size="base" className="rounded-2xl p-6" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>모집 인원이 찼습니다</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              {overQuotaGuest && (() => {
                if (match?.recruitmentMode === 'position') {
                  const posCode = overQuotaGuest.position.match(/\(([A-Z]+)\)/)?.[1] ?? 'G';
                  const quota = match.positionQuotas?.find((q) => q.position === posCode);
                  return `${quota?.label ?? overQuotaGuest.position} 모집 인원이 찼습니다 (${quota?.current}/${quota?.max}). 초과 승인하시겠습니까?`;
                }
                return `모집 인원이 찼습니다 (${totalConfirmedCount}/${match?.totalQuota?.max}). 초과 승인하시겠습니까?`;
              })()}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setOverQuotaGuest(null)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (overQuotaGuest) doApprove(overQuotaGuest);
                setOverQuotaGuest(null);
              }}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              초과 승인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 하단 고정 버튼 */}
      <MatchActionButton
        isRecruiting={isRecruiting}
        isClosed={isClosed}
        isEnded={isEnded}
        isMatchCanceled={isMatchCanceled}
        isPending={statusMutation.isPending}
        onCloseRecruiting={handleCloseRecruiting}
        layoutMode={layoutMode}
      />
    </div>
  );
}
