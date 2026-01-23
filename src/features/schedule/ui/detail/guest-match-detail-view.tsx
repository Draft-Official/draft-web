'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  MapPin,
  Share2,
  User,
  Trophy,
  Users,
  MessageCircle,
  Swords,
  Calendar,
  Loader2,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/base/button';
import { Badge } from '@/shared/ui/base/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/base/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/shared/ui/base/dialog';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useAuth } from '@/features/auth';
import { createApplicationService } from '@/services/application/application.service';
import { matchManagementKeys } from '../../api/keys';
import type { GuestMatchDetail } from '../../model/types';
import { MOCK_GUEST_MATCH_DETAIL } from '../../model/mock-data';

export function GuestMatchDetailView() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.id as string;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 내 신청 정보 조회
  const { data: myApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ['my-application', matchId, user?.id],
    queryFn: async () => {
      if (!user?.id || !matchId) return null;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('match_id', matchId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!matchId,
  });

  // 신청 취소 mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!myApplication?.id) throw new Error('신청 정보가 없습니다');

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(myApplication.id, '사용자 요청');
    },
    onSuccess: () => {
      toast.success('참가 신청이 취소되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['my-application', matchId] });
      queryClient.invalidateQueries({ queryKey: matchManagementKeys.participatingMatches(user?.id ?? '') });
      setIsCancelDialogOpen(false);
      router.back();
    },
    onError: (error: Error) => {
      toast.error(`취소 실패: ${error.message}`);
    },
  });

  // 신청 상태에 따른 텍스트
  const getStatusText = () => {
    if (!myApplication) return null;
    if (myApplication.status === 'CONFIRMED') return '확정';
    if (myApplication.status === 'REJECTED') return '거절됨';
    if (myApplication.status === 'CANCELED') return '취소됨';
    if (myApplication.status === 'PENDING' && myApplication.approved_at) return '입금대기';
    return '승인대기';
  };

  // 취소 가능 여부 (CONFIRMED, REJECTED, CANCELED가 아닌 경우)
  const canCancel = myApplication &&
    myApplication.status !== 'REJECTED' &&
    myApplication.status !== 'CANCELED';

  const [match] = useState<GuestMatchDetail>(MOCK_GUEST_MATCH_DETAIL);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // 기존 applied 상태 대신 myApplication 사용
  const applied = !!myApplication;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('클립보드에 복사되었습니다');
  };

  // 신청 가능한 포지션 목록
  const openPositions = match.positions.filter((p) => p.isOpen);

  return (
    <div className="bg-slate-50 min-h-screen pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center px-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
      </header>

      {/* 1. Main Header Section */}
      <section className="bg-white px-5 pt-6 pb-6 border-b border-slate-100 relative">
        {/* Main Title */}
        <h1 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">
          {match.teamName ? `${match.teamName}에서 게스트 모집합니다!` : '게스트 모집합니다!'}
        </h1>

        {/* Date/Time & Share */}
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-lg font-bold text-slate-900 leading-tight pr-4">
            {match.date} {match.time}
          </h2>
          <button
            onClick={() => copyToClipboard(window.location.href)}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors -mt-1"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Gym Name */}
        <div className="text-lg font-bold text-slate-700 mb-1 tracking-tight">
          {match.gymName}
        </div>

        {/* Address Tools */}
        <div className="flex items-center flex-wrap gap-x-2 text-[13px] mb-4">
          <span className="text-slate-500">{match.address}</span>
          <span className="text-slate-300">|</span>
          <button
            onClick={() => copyToClipboard(match.address)}
            className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
          >
            주소복사
          </button>
          <button
            onClick={() => window.open(match.locationUrl, '_blank')}
            className="text-slate-400 hover:text-slate-600 underline decoration-slate-300 underline-offset-2"
          >
            지도보기
          </button>
        </div>

        {/* Divider */}
        <hr className="border-slate-100 mb-4" />

        {/* Price (Inline) */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">참가비</span>
          <span className="text-base font-bold text-slate-900">
            {match.price.toLocaleString()}원{' '}
            <span className="text-slate-400 font-normal text-xs">/ {match.duration}</span>
          </span>
        </div>
      </section>

      {/* 2. Match Specs (Icon Grid) */}
      <section className="bg-white px-5 py-6 border-b border-slate-100">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          {/* Level */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-0.5">레벨</div>
              <div className="text-[13px] font-bold text-slate-900">{match.level}</div>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-0.5">성별</div>
              <div className="text-[13px] font-bold text-slate-900">{match.gender}</div>
            </div>
          </div>

          {/* Method */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <Swords className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-0.5">진행 방식</div>
              <div className="text-[13px] font-bold text-slate-900">{match.method}</div>
            </div>
          </div>

          {/* Age */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-0.5">나이</div>
              <div className="text-[13px] font-bold text-slate-900">{match.ageRange}</div>
            </div>
          </div>

          {/* Total Personnel */}
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-0.5">총인원</div>
              <div className="text-[13px] font-bold text-slate-900">
                {match.totalParticipants}명 (현재 {match.currentParticipants}명)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Host Info & Message */}
      <section className="bg-white px-5 py-6 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-slate-100">
              <AvatarImage src={match.hostAvatar} />
              <AvatarFallback>{match.teamName?.charAt(0) || 'T'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[13px] font-bold text-slate-900">{match.teamName}</div>
              <div className="text-xs text-slate-500">호스트 {match.hostName}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-slate-200">
            문의하기
          </Button>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed relative">
          <MessageCircle className="w-4 h-4 text-slate-300 absolute top-4 left-4" />
          <p className="pl-6">&quot;{match.hostMessage}&quot;</p>
        </div>
      </section>

      {/* 4. Positions */}
      <section className="bg-white px-5 py-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">모집 포지션</h3>

        <div className="space-y-3">
          {match.positions.map((position) => (
            <div
              key={position.position}
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border',
                position.isOpen
                  ? 'border-primary/30 bg-orange-50/30'
                  : 'border-slate-100 bg-slate-50 opacity-60'
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm',
                    position.isOpen ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'
                  )}
                >
                  {position.position}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {position.label}
                    {position.canSupportCenter && (
                      <span className="text-[10px] font-normal text-primary bg-orange-100 px-1.5 py-0.5 rounded">
                        센터 지원가능
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {position.current}/{position.max} 명
                  </div>
                </div>
              </div>
              {position.isOpen ? (
                <Button
                  size="sm"
                  className="h-8 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs px-3"
                >
                  신청가능
                </Button>
              ) : (
                <Badge variant="secondary" className="bg-slate-200 text-slate-500">
                  마감
                </Badge>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 5. Cancellation Policy */}
      <section className="bg-white px-5 py-6 border-t border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-3">취소 및 환불 규정</h3>
        <div className="bg-slate-50 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed space-y-2">
          {match.cancellationPolicy.map((policy, index) => (
            <p key={index} className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>{policy}</span>
            </p>
          ))}
        </div>
      </section>

      {/* Footer Sticky Action */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-slate-100 p-4 z-50">
        <div className="max-w-[760px] mx-auto">
          {isLoadingApplication ? (
            <Button disabled className="w-full h-12 text-lg font-bold rounded-xl">
              <Loader2 className="w-5 h-5 animate-spin" />
            </Button>
          ) : !applied ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full h-12 text-lg font-bold rounded-xl transition-all active:scale-95 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-orange-100">
                  신청하기
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%] max-w-[400px] rounded-2xl gap-6">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl font-extrabold text-slate-900">
                    게스트 신청
                  </DialogTitle>
                  <p className="text-sm text-slate-500 font-medium">
                    호스트 확인 후 확정됩니다.
                  </p>
                </DialogHeader>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">포지션 선택</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {openPositions.map((pos) => (
                        <button
                          key={pos.position}
                          onClick={() => setSelectedPosition(pos.position)}
                          className={cn(
                            'h-11 rounded-lg border-2 font-bold text-sm',
                            selectedPosition === pos.position
                              ? 'border-primary bg-orange-50 text-primary'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          )}
                        >
                          {pos.label} ({pos.position})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nickname" className="font-bold text-slate-700">
                      닉네임
                    </Label>
                    <Input
                      id="nickname"
                      placeholder="사용하실 닉네임을 입력하세요"
                      className="h-11 bg-slate-50 border-slate-200"
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">참가비</span>
                      <span className="font-bold text-slate-900">
                        {match.price.toLocaleString()}원
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">입금계좌</span>
                      <span className="font-bold text-slate-900 text-right">
                        {match.bankInfo.bank}
                        <br />
                        {match.bankInfo.account} ({match.bankInfo.holder})
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      toast.success('신청이 완료되었습니다.');
                    }}
                    className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 rounded-xl"
                  >
                    신청 완료하기
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : canCancel ? (
            <div className="space-y-2">
              {/* 현재 상태 표시 */}
              <div className="text-center text-sm text-slate-500">
                현재 상태: <span className="font-bold text-slate-900">{getStatusText()}</span>
              </div>
              <Button
                onClick={() => setIsCancelDialogOpen(true)}
                className="w-full h-12 text-lg font-bold rounded-xl transition-all active:scale-95 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200"
              >
                취소하기
              </Button>
            </div>
          ) : (
            <div className="text-center py-3">
              <span className="text-slate-500">상태: </span>
              <span className="font-bold text-slate-900">{getStatusText()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>참가 취소</DialogTitle>
            <p className="text-slate-600 pt-2 text-sm">
              취소 시 참가비 환불이 불가합니다. 정말 취소하시겠습니까?
            </p>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsCancelDialogOpen(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
              disabled={cancelMutation.isPending}
            >
              돌아가기
            </Button>
            <Button
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
            >
              {cancelMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                '취소하기'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
