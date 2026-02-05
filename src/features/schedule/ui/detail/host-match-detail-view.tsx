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
  Loader2,
  Megaphone,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/base/dropdown-menu';
import type { CancelTypeValue } from '@/shared/config/constants';
import type { Guest, GuestStatus } from '../../model/types';
import {
  useHostMatchDetail,
  useMatchApplicants,
  useApproveApplication,
  useConfirmPaymentByHost,
  useVerifyPayment,
  useRejectApplication,
  useCancelParticipation,
  useUpdateMatchStatus,
  useUpdateRecruitmentSetup,
  useCreateAnnouncement,
  useCancelMatchFlow,
} from '../../api';
import { GuestProfileDialog } from './guest-profile-dialog';
import { EditQuotaDialog } from './edit-quota-dialog';
import { CancelConfirmDialog } from './cancel-confirm-dialog';
import { AnnouncementDialog } from './announcement-dialog';
import { MatchCancelDialog } from './match-cancel-dialog';
import { RecruitmentStatusSection } from './recruitment-status-section';
import { GuestListSection } from './guest-list-section';
import { MatchActionButton } from './match-action-button';

export function HostMatchDetailView() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  // React Query hooks
  const { data: match, isLoading: isLoadingMatch } = useHostMatchDetail(matchId);
  const { data: guests = [], isLoading: isLoadingGuests } = useMatchApplicants(matchId);

  // Mutations
  const approveMutation = useApproveApplication();
  const confirmMutation = useConfirmPaymentByHost();
  const verifyPaymentMutation = useVerifyPayment();
  const rejectMutation = useRejectApplication();
  const cancelMutation = useCancelParticipation();
  const statusMutation = useUpdateMatchStatus();
  const recruitmentMutation = useUpdateRecruitmentSetup();
  const announcementMutation = useCreateAnnouncement();
  const cancelMatchFlowMutation = useCancelMatchFlow();

  // Local state
  const [selectedTab, setSelectedTab] = useState<GuestStatus>('pending');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestProfileOpen, setIsGuestProfileOpen] = useState(false);
  const [isEditQuotaOpen, setIsEditQuotaOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [guestToCancel, setGuestToCancel] = useState<Guest | null>(null);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isMatchCancelOpen, setIsMatchCancelOpen] = useState(false);

  const isLoading = isLoadingMatch || isLoadingGuests;

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

  // Handlers
  const handleApprove = (guest: Guest) => {
    approveMutation.mutate(
      { applicationId: guest.id, matchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleConfirmPayment = (guest: Guest) => {
    confirmMutation.mutate(
      { applicationId: guest.id, matchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleReject = (guest: Guest) => {
    rejectMutation.mutate(
      { applicationId: guest.id, matchId },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleCancel = (guest: Guest, cancelType?: CancelTypeValue) => {
    cancelMutation.mutate(
      {
        applicationId: guest.id,
        matchId,
        cancelOptions: cancelType ? { cancelType } : undefined,
      },
      { onSuccess: () => setIsGuestProfileOpen(false) }
    );
  };

  const handleVerifyPayment = (guest: Guest) => {
    verifyPaymentMutation.mutate({ applicationId: guest.id, matchId });
  };

  const openGuestProfile = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsGuestProfileOpen(true);
  };

  const openCancelConfirm = (guest: Guest) => {
    setGuestToCancel(guest);
    setIsCancelConfirmOpen(true);
  };

  const handleCloseRecruiting = () => {
    statusMutation.mutate({ matchId, status: 'CLOSED' });
  };

  const handleConfirmMatch = () => {
    statusMutation.mutate({ matchId, status: 'CONFIRMED' });
  };

  const handleResumeRecruiting = () => {
    statusMutation.mutate({ matchId, status: 'RECRUITING' });
  };

  // Loading state
  if (isLoading || !match) {
    return (
      <div className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          <p className="text-slate-500">경기 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
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
              <DropdownMenuItem onClick={() => router.push(`/matches/${match.id}`)}>
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
                  onClick={() => {
                    const confirmedCount = guests.filter((g) => g.status === 'confirmed').length;
                    if (confirmedCount === 0) {
                      if (confirm('경기를 취소하시겠습니까?')) {
                        statusMutation.mutate(
                          { matchId, status: 'CANCELED' },
                          { onSuccess: () => router.back() }
                        );
                      }
                    } else {
                      setIsMatchCancelOpen(true);
                    }
                  }}
                >
                  경기 취소
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="max-w-[760px] mx-auto p-4 space-y-4">
        {/* 경기 기본 정보 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <span>{match.date}</span>
            <Clock className="w-5 h-5 text-slate-400 ml-2" />
            <span>{match.time}</span>
          </div>

          <a
            href={match.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors"
          >
            <MapPin className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{match.location}</span>
          </a>

          <div className="flex items-center gap-2 text-slate-700">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{match.teamName}</span>
          </div>
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
          onReject={handleReject}
          onConfirmPayment={handleConfirmPayment}
          onVerifyPayment={handleVerifyPayment}
          onCancelClick={openCancelConfirm}
        />
      </div>

      {/* Dialogs */}
      <GuestProfileDialog
        guest={selectedGuest}
        open={isGuestProfileOpen}
        onOpenChange={setIsGuestProfileOpen}
        onApprove={handleApprove}
        onReject={handleReject}
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
          recruitmentMutation.mutate(
            { matchId, recruitmentSetup },
            { onSuccess: () => setIsEditQuotaOpen(false) }
          );
        }}
      />

      <AnnouncementDialog
        open={isAnnouncementOpen}
        onOpenChange={setIsAnnouncementOpen}
        onSubmit={(message) => {
          announcementMutation.mutate({ matchId, message });
        }}
      />

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
        confirmedGuests={guests.filter((g) => g.status === 'confirmed')}
        onConfirm={(message) => {
          cancelMatchFlowMutation.mutate(
            { matchId, message },
            { onSuccess: () => router.back() }
          );
        }}
      />

      {/* 하단 고정 버튼 */}
      <MatchActionButton
        isRecruiting={isRecruiting}
        isClosed={isClosed}
        isConfirmed={isConfirmed}
        isEnded={isEnded}
        isMatchCanceled={isMatchCanceled}
        isPending={statusMutation.isPending}
        onCloseRecruiting={handleCloseRecruiting}
        onConfirmMatch={handleConfirmMatch}
      />
    </div>
  );
}
