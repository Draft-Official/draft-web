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
  Minus,
  Plus,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import type {
  Guest,
  GuestStatus,
  RecruitmentMode,
} from '../../model/types';
import {
  useHostMatchDetail,
  useMatchApplicants,
  useApproveApplication,
  useConfirmPayment,
  useRejectApplication,
  useCancelParticipation,
  useUpdateMatchStatus,
  useUpdateRecruitmentSetup,
} from '../../api';
import type { RecruitmentSetup } from '@/shared/types/database.types';

// 탭 설정
const GUEST_TABS: { status: GuestStatus; label: string }[] = [
  { status: 'pending', label: '신청자' },
  { status: 'payment_waiting', label: '입금대기' },
  { status: 'confirmed', label: '확정' },
  { status: 'rejected', label: '거절' },
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
  const confirmMutation = useConfirmPayment();
  const rejectMutation = useRejectApplication();
  const cancelMutation = useCancelParticipation();
  const statusMutation = useUpdateMatchStatus();
  const recruitmentMutation = useUpdateRecruitmentSetup();

  // Local state
  const [selectedTab, setSelectedTab] = useState<GuestStatus>('pending');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [isGuestProfileOpen, setIsGuestProfileOpen] = useState(false);
  const [isEditQuotaOpen, setIsEditQuotaOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [guestToCancel, setGuestToCancel] = useState<Guest | null>(null);
  const [editMode, setEditMode] = useState<RecruitmentMode>('position');
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [editPositions, setEditPositions] = useState({
    guard: 2,
    forward: 2,
    center: 1,
    bigman: 3,
    total: 5,
  });

  const isLoading = isLoadingMatch || isLoadingGuests;

  // Determine if recruiting from match status
  const isRecruiting = match?.status === 'RECRUITING';

  // 확정자 수 계산 (포지션별)
  const confirmedCountByPosition = guests
    .filter((g) => g.status === 'confirmed')
    .reduce((acc, guest) => {
      // 포지션에서 괄호 안의 코드 추출 (예: "가드 (G)" -> "G")
      const posMatch = guest.position.match(/\(([A-Z]+)\)/);
      const posCode = posMatch ? posMatch[1] : 'G';
      acc[posCode] = (acc[posCode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  // 전체 확정자 수
  const totalConfirmedCount = guests.filter((g) => g.status === 'confirmed').length;

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
  const handleCancel = (guest: Guest) => {
    cancelMutation.mutate(
      { applicationId: guest.id, matchId },
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

  // 포지션 인원 수정
  const updatePosition = (
    pos: 'guard' | 'forward' | 'center' | 'bigman' | 'total',
    delta: number
  ) => {
    setEditPositions((prev) => ({
      ...prev,
      [pos]: Math.max(0, prev[pos] + delta),
    }));
  };

  // 인원 저장
  const handleSaveQuota = () => {
    const recruitmentSetup: RecruitmentSetup =
      editMode === 'total'
        ? {
            type: 'ANY',
            max_count: editPositions.total,
          }
        : {
            type: 'POSITION',
            positions: isFlexBigman
              ? {
                  G: { max: editPositions.guard, current: 0 },
                  B: { max: editPositions.bigman, current: 0 },
                }
              : {
                  G: { max: editPositions.guard, current: 0 },
                  F: { max: editPositions.forward, current: 0 },
                  C: { max: editPositions.center, current: 0 },
                },
          };

    recruitmentMutation.mutate(
      { matchId, recruitmentSetup },
      {
        onSuccess: () => {
          setIsEditQuotaOpen(false);
        },
      }
    );
  };

  // 모집 상태 변경
  const handleToggleRecruiting = () => {
    const newStatus = isRecruiting ? 'CLOSED' : 'RECRUITING';
    statusMutation.mutate({ matchId, status: newStatus as 'RECRUITING' | 'CLOSED' });
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
            <DropdownMenuItem onClick={() => router.push(`/matches/create?edit=${match.id}`)}>
              경기 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('경기를 취소하시겠습니까?')) {
                  toast.error('경기가 취소되었습니다.');
                  router.back();
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
            <Shield className="w-5 h-5 text-primary" />
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
                <span className="font-medium text-slate-700">전체</span>
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
                      <p className="font-bold text-slate-900">{guest.name}</p>
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
                            className="h-8 px-3 text-xs"
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
                            className="h-8 px-3 text-xs"
                          >
                            입금확인
                          </Button>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancel(guest);
                            }}
                            className="bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-8 px-3 text-xs"
                          >
                            취소
                          </Button>
                        </>
                      )}

                      {guest.status === 'confirmed' && (
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
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* 게스트 프로필 Dialog */}
      <Dialog open={isGuestProfileOpen} onOpenChange={setIsGuestProfileOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          {selectedGuest && (
            <div className="flex flex-col items-center space-y-6 pt-2">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-600 font-bold text-3xl">
                  {selectedGuest.name.charAt(0)}
                </span>
              </div>

              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                  {selectedGuest.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  게스트의 상세 정보를 확인하고 승인 또는 거절할 수 있습니다.
                </DialogDescription>
              </DialogHeader>

              <div className="w-full space-y-3 border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">포지션</span>
                  <span className="font-medium text-slate-900">{selectedGuest.position}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">실력</span>
                  <span className="font-medium text-slate-900">{selectedGuest.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">나이대</span>
                  <span className="font-medium text-slate-900">{selectedGuest.ageGroup}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">키</span>
                  <span className="font-medium text-slate-900">{selectedGuest.height}</span>
                </div>
              </div>

              <div className="w-full space-y-3">
                <p className="text-sm font-medium text-slate-700">이 팀과의 경기 이력</p>

                {selectedGuest.matchHistory ? (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-900 font-medium">
                      참여 {selectedGuest.matchHistory.count}회
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      마지막 참여: {selectedGuest.matchHistory.lastDate}
                    </p>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-900 font-medium">첫 참여입니다</p>
                  </div>
                )}
              </div>

              <div className="w-full flex gap-2 pt-2">
                {selectedGuest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => handleApprove(selectedGuest)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => handleReject(selectedGuest)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                    >
                      거절
                    </Button>
                  </>
                )}

                {selectedGuest.status === 'payment_waiting' && (
                  <>
                    <Button
                      onClick={() => handleConfirmPayment(selectedGuest)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      입금확인
                    </Button>
                    <Button
                      onClick={() => handleCancel(selectedGuest)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                    >
                      취소
                    </Button>
                  </>
                )}

                {selectedGuest.status === 'confirmed' && (
                  <Button
                    onClick={() => handleCancel(selectedGuest)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                  >
                    취소
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 모집 인원 수정 Dialog */}
      <Dialog open={isEditQuotaOpen} onOpenChange={setIsEditQuotaOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>모집 인원 수정</DialogTitle>
            <DialogDescription>경기의 모집 인원을 수정할 수 있습니다.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 모드 토글 */}
            <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <button
                onClick={() => setEditMode('total')}
                className={cn(
                  'text-sm font-medium transition-colors',
                  editMode === 'total' ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                포지션 무관
              </button>
              <div
                className="relative w-12 h-6 bg-slate-200 rounded-full cursor-pointer"
                onClick={() => setEditMode(editMode === 'total' ? 'position' : 'total')}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-slate-900 rounded-full transition-transform',
                    editMode === 'position' ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
              <button
                onClick={() => setEditMode('position')}
                className={cn(
                  'text-sm font-medium transition-colors',
                  editMode === 'position' ? 'text-slate-900' : 'text-slate-400'
                )}
              >
                포지션별
              </button>
            </div>

            {/* 포지션별 모드 */}
            {editMode === 'position' && (
              <div className="space-y-4">
                <div className="flex items-center justify-end space-x-2">
                  <Checkbox
                    id="flex-bigman"
                    checked={isFlexBigman}
                    onCheckedChange={(c) => setIsFlexBigman(!!c)}
                  />
                  <label
                    htmlFor="flex-bigman"
                    className="text-sm font-medium text-slate-600"
                  >
                    빅맨 통합 (F/C)
                  </label>
                </div>

                <div className="space-y-3">
                  {/* 가드 */}
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">가드 (G)</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updatePosition('guard', -1)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="w-4 text-center font-bold text-lg">
                        {editPositions.guard}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePosition('guard', 1)}
                        className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isFlexBigman ? (
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">빅맨 (F/C)</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updatePosition('bigman', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="w-4 text-center font-bold text-lg">
                          {editPositions.bigman}
                        </span>
                        <button
                          type="button"
                          onClick={() => updatePosition('bigman', 1)}
                          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700">포워드 (F)</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updatePosition('forward', -1)}
                            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                          >
                            <Minus className="w-4 h-4 text-slate-600" />
                          </button>
                          <span className="w-4 text-center font-bold text-lg">
                            {editPositions.forward}
                          </span>
                          <button
                            type="button"
                            onClick={() => updatePosition('forward', 1)}
                            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="font-bold text-slate-700">센터 (C)</span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updatePosition('center', -1)}
                            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                          >
                            <Minus className="w-4 h-4 text-slate-600" />
                          </button>
                          <span className="w-4 text-center font-bold text-lg">
                            {editPositions.center}
                          </span>
                          <button
                            type="button"
                            onClick={() => updatePosition('center', 1)}
                            className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 전체 모드 */}
            {editMode === 'total' && (
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-700">전체 인원</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updatePosition('total', -1)}
                    className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">
                    {editPositions.total}명
                  </span>
                  <button
                    type="button"
                    onClick={() => updatePosition('total', 1)}
                    className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <Button
              onClick={handleSaveQuota}
              className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold"
            >
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 취소 확인 Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>참가 취소 확인</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              참가자의 동의 없는 일방적인 취소는 법적 불이익을 당할 수 있습니다. 정말
              취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsCancelConfirmOpen(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (guestToCancel) {
                  handleCancel(guestToCancel);
                }
                setIsCancelConfirmOpen(false);
              }}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:pl-[240px]">
        <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            onClick={handleToggleRecruiting}
            disabled={statusMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
          >
            {statusMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRecruiting ? (
              '마감하기'
            ) : (
              '추가 모집'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
