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
  Users,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/base/dropdown-menu';
import type { CancelTypeValue } from '@/shared/config/constants';
import type {
  Guest,
  GuestStatus,
} from '../../model/types';
import {
  useHostMatchDetail,
  useMatchApplicants,
  useApproveApplication,
  useConfirmPaymentByGuest,
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

// 탭 설정
const GUEST_TABS: { status: GuestStatus; label: string }[] = [
  { status: 'pending', label: '신청자' },
  { status: 'payment_waiting', label: '입금대기' },
  { status: 'confirmed', label: '확정' },
  { status: 'rejected', label: '거절' },
  { status: 'canceled', label: '취소' },
];

export function HostMatchDetailView() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;

  // React Query hooks
  const { data: match, isLoading: isLoadingMatch } = useHostMatchDetail(matchId);
  const { data: guests = [], isLoading: isLoadingGuests } = useMatchApplicants(matchId);

  // Mutations
  const approveMutation = useApproveApplication();
  const confirmMutation = useConfirmPaymentByGuest();
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
      // 본인 포지션 카운트
      const posMatch = guest.position.match(/\(([A-Z]+)\)/);
      const posCode = posMatch ? posMatch[1] : 'G';
      acc[posCode] = (acc[posCode] || 0) + 1;

      // 동반인 포지션 카운트
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

  // 탭별 게스트 수
  const getTabCount = (status: GuestStatus) => {
    return guests.filter((g) => g.status === status).length;
  };

  // 필터링된 게스트
  const filteredGuests = guests.filter((g) => g.status === selectedTab);

  // 승인 처리
  const handleApprove = (guest: Guest) => {
    approveMutation.mutate(
      { applicationId: guest.id, matchId },
      {
        onSuccess: () => {
          setIsGuestProfileOpen(false);
        },
      }
    );
  };

  // 입금 확인 처리
  const handleConfirmPayment = (guest: Guest) => {
    confirmMutation.mutate(
      { applicationId: guest.id, matchId },
      {
        onSuccess: () => {
          setIsGuestProfileOpen(false);
        },
      }
    );
  };

  // 거절 처리
  const handleReject = (guest: Guest) => {
    rejectMutation.mutate(
      { applicationId: guest.id, matchId },
      {
        onSuccess: () => {
          setIsGuestProfileOpen(false);
        },
      }
    );
  };

  // 취소 처리
  const handleCancel = (guest: Guest, cancelType?: CancelTypeValue) => {
    cancelMutation.mutate(
      {
        applicationId: guest.id,
        matchId,
        cancelOptions: cancelType ? { cancelType } : undefined,
      },
      {
        onSuccess: () => {
          setIsGuestProfileOpen(false);
        },
      }
    );
  };

  // 게스트 프로필 열기
  const openGuestProfile = (guest: Guest) => {
    setSelectedGuest(guest);
    setIsGuestProfileOpen(true);
  };

  // 모집 마감 처리 (RECRUITING → CLOSED)
  const handleCloseRecruiting = () => {
    statusMutation.mutate({ matchId, status: 'CLOSED' });
  };

  // 경기 확정 처리 (CLOSED → CONFIRMED)
  const handleConfirmMatch = () => {
    statusMutation.mutate({ matchId, status: 'CONFIRMED' });
  };

  // 추가 모집 처리 (CLOSED → RECRUITING)
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
            {(isClosed || isConfirmed) && (
              <DropdownMenuItem onClick={handleResumeRecruiting}>
                추가 모집하기
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => setIsAnnouncementOpen(true)}>
              공지하기
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/matches/create?edit=${match.id}`)}>
              경기 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                const confirmedCount = guests.filter(
                  (g) => g.status === 'confirmed'
                ).length;
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
          </DropdownMenuContent>
        </DropdownMenu>
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
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-slate-900">모집 현황</h2>
            </div>
            <button
              onClick={() => setIsEditQuotaOpen(true)}
              className="text-primary font-medium text-sm hover:underline"
            >
              수정
            </button>
          </div>

          {/* 포지션별 모집 */}
          {match.recruitmentMode === 'position' && match.positionQuotas && (
            <div className="space-y-3">
              {match.positionQuotas.map((quota, index) => {
                // 해당 포지션의 확정자 수
                const currentCount = confirmedCountByPosition[quota.position] || 0;
                const isOverQuota = currentCount > quota.max;
                const progressPercent = Math.min((currentCount / quota.max) * 100, 100);

                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        {quota.label} ({quota.position})
                      </span>
                      <span
                        className={cn(
                          'font-bold',
                          isOverQuota ? 'text-primary' : 'text-slate-900'
                        )}
                      >
                        {currentCount}/{quota.max}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all bg-primary"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 전체 모집 */}
          {match.recruitmentMode === 'total' && match.totalQuota && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">포지션 무관</span>
                <span
                  className={cn(
                    'font-bold',
                    totalConfirmedCount > match.totalQuota.max
                      ? 'text-primary'
                      : 'text-slate-900'
                  )}
                >
                  {totalConfirmedCount}/{match.totalQuota.max}명
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-primary"
                  style={{
                    width: `${Math.min(
                      (totalConfirmedCount / match.totalQuota.max) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* 게스트 목록 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* 탭 */}
          <div className="flex gap-2 p-4 border-b border-slate-100 overflow-x-auto">
            {GUEST_TABS.map((tab) => {
              const count = getTabCount(tab.status);
              return (
                <button
                  key={tab.status}
                  onClick={() => setSelectedTab(tab.status)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                    selectedTab === tab.status
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/* 게스트 리스트 */}
          <div className="divide-y divide-slate-100">
            {filteredGuests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="w-12 h-12 mb-3" />
                <p className="text-sm">
                  {selectedTab === 'pending' && '신청자가 없습니다.'}
                  {selectedTab === 'payment_waiting' && '입금대기 중인 게스트가 없습니다.'}
                  {selectedTab === 'confirmed' && '확정된 게스트가 없습니다.'}
                  {selectedTab === 'rejected' && '거절된 게스트가 없습니다.'}
                  {selectedTab === 'canceled' && '취소된 게스트가 없습니다.'}
                </p>
              </div>
            ) : (
              filteredGuests.map((guest) => (
                <div
                  key={guest.id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    openGuestProfile(guest);
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <span className="text-slate-600 font-bold text-lg">
                        {guest.name.charAt(0)}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-900">{guest.name}</p>
                        {guest.companions && guest.companions.length > 0 && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200"
                          >
                            +{guest.companions.length}명
                          </Badge>
                        )}
                        {guest.status === 'confirmed' && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-[10px] px-2 py-0.5',
                              guest.paymentVerified
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                            )}
                          >
                            {guest.paymentVerified ? '입금확인' : '입금미확인'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-500">
                        {guest.position} · {guest.level} · {guest.ageGroup}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      {guest.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(guest);
                            }}
                            variant="outline"
                            className="h-8 px-3 text-xs border-slate-200"
                          >
                            승인
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(guest);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                          >
                            거절
                          </Button>
                        </>
                      )}

                      {guest.status === 'payment_waiting' && (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirmPayment(guest);
                            }}
                            variant="outline"
                            className="h-8 px-3 text-xs border-slate-200"
                          >
                            입금확인
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuestToCancel(guest);
                              setIsCancelConfirmOpen(true);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                          >
                            취소
                          </Button>
                        </>
                      )}

                      {guest.status === 'confirmed' && (
                        <>
                          {!guest.paymentVerified && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                verifyPaymentMutation.mutate({ applicationId: guest.id, matchId });
                              }}
                              variant="outline"
                              className="h-8 px-3 text-xs border-slate-200"
                            >
                              입금확인
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setGuestToCancel(guest);
                              setIsCancelConfirmOpen(true);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                          >
                            취소
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 동반인 서브리스트 */}
                  {guest.companions && guest.companions.length > 0 && (
                    <div className="mt-2 ml-14 pl-3 border-l-2 border-blue-200 space-y-1">
                      {guest.companions.map((companion, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1">
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-[10px]">
                              {companion.name.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm text-slate-700">{companion.name}</span>
                          <span className="text-xs text-slate-400">{companion.position}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 게스트 프로필 Dialog */}
      <GuestProfileDialog
        guest={selectedGuest}
        open={isGuestProfileOpen}
        onOpenChange={setIsGuestProfileOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        onConfirmPayment={handleConfirmPayment}
        onCancel={(guest) => {
          setIsGuestProfileOpen(false);
          setGuestToCancel(guest);
          setIsCancelConfirmOpen(true);
        }}
      />

      {/* 모집 인원 수정 Dialog */}
      <EditQuotaDialog
        open={isEditQuotaOpen}
        onOpenChange={setIsEditQuotaOpen}
        match={match}
        onSave={(recruitmentSetup) => {
          recruitmentMutation.mutate(
            { matchId, recruitmentSetup },
            {
              onSuccess: () => {
                setIsEditQuotaOpen(false);
              },
            }
          );
        }}
      />

      {/* 공지하기 Dialog */}
      <AnnouncementDialog
        open={isAnnouncementOpen}
        onOpenChange={setIsAnnouncementOpen}
        onSubmit={(message) => {
          announcementMutation.mutate({ matchId, message });
        }}
      />

      {/* 취소 확인 Dialog */}
      <CancelConfirmDialog
        open={isCancelConfirmOpen}
        onOpenChange={setIsCancelConfirmOpen}
        onConfirm={(cancelType) => {
          if (guestToCancel) {
            handleCancel(guestToCancel, cancelType);
          }
        }}
      />

      {/* 경기 취소 Dialog (확정자 있는 경우) */}
      <MatchCancelDialog
        open={isMatchCancelOpen}
        onOpenChange={setIsMatchCancelOpen}
        confirmedCount={guests.filter((g) => g.status === 'confirmed').length}
        onConfirm={(message) => {
          cancelMatchFlowMutation.mutate(
            { matchId, message },
            { onSuccess: () => router.back() }
          );
        }}
      />

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:pl-[240px]">
        <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          {/* 모집 중: 모집 마감하기 */}
          {isRecruiting && (
            <Button
              onClick={handleCloseRecruiting}
              disabled={statusMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
            >
              {statusMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '모집 마감하기'
              )}
            </Button>
          )}

          {/* 모집 마감: 경기 확정하기 */}
          {isClosed && (
            <Button
              onClick={handleConfirmMatch}
              disabled={statusMutation.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
            >
              {statusMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '경기 확정하기'
              )}
            </Button>
          )}

          {/* 경기 확정 이후: 확정 완료 (비활성화) */}
          {isConfirmed && (
            <Button
              disabled
              className="w-full bg-slate-200 text-slate-500 h-12 rounded-xl font-bold text-lg cursor-not-allowed"
            >
              확정 완료
            </Button>
          )}

          {/* 종료/취소 */}
          {isEnded && (
            <Button
              disabled
              className="w-full bg-slate-200 text-slate-500 h-12 rounded-xl font-bold text-lg cursor-not-allowed"
            >
              {isMatchCanceled ? '취소된 경기입니다' : '종료된 경기입니다'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
