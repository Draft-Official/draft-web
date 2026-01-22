'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useMatch } from '@/features/match/api/queries';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { Match } from '@/features/match/model/mock-data';
import { GuestListMatch, CostType } from '@/shared/types/match';
import { useAuth } from '@/features/auth';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createApplicationService } from '@/services/application/application.service';
import { matchManagementKeys } from '@/features/match-management/api/keys';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// Adapter: GuestListMatch -> Match (Mock Type)
function adaptToDetailMatch(data: GuestListMatch): Match {
  const priceAmount = data.price.amount ?? data.price.final ?? 0;

  const getPriceDisplay = () => {
    if (data.price.type === CostType.FREE) return '무료';
    if (data.price.type === CostType.BEVERAGE) return `음료수 ${priceAmount}병`;
    return `${priceAmount.toLocaleString()}원`;
  };

  const matchOptions = data.matchOptions;
  const playStyleToRuleType: Record<string, '2team' | '3team' | 'exchange' | 'lesson'> = {
    INTERNAL_2WAY: '2team',
    INTERNAL_3WAY: '3team',
    EXCHANGE: 'exchange',
    PRACTICE: 'lesson',
  };
  const refereeTypeMap: Record<string, 'self' | 'guest' | 'pro'> = {
    SELF: 'self',
    STAFF: 'guest',
    PRO: 'pro',
  };

  return {
    id: data.id,
    dateISO: data.dateISO,
    startTime: data.startTime,
    endTime: data.endTime,
    title: data.title,
    location: data.location.name,
    address: data.location.fullAddress || data.location.address,
    price: getPriceDisplay(),
    priceNum: priceAmount,
    gender: data.gender as 'men' | 'women' | 'mixed',
    gameFormat: data.gameFormat ?? '',
    courtType: (data.courtType ?? 'indoor') as 'indoor' | 'outdoor',
    ageRange: data.ageMin && data.ageMax ? `${data.ageMin}대 ~ ${data.ageMax}대` : undefined,
    level: data.level,
    hostName: data.hostName || '호스트',
    hostImage: '',
    teamName: data.teamName,
    teamLogo: data.teamLogo || '',
    hostMessage: data.hostNotice,
    cancelPolicy: '시작 24시간 전 환불 불가',
    facilities: {
      ...data.facilities,
      providesBeverage: data.price.providesBeverage,
    },
    requirements: data.requirements,
    positions: {
      g: data.positions.G ? { status: data.positions.G.open > 0 ? 'open' : 'closed', max: (data.positions.G.open + data.positions.G.closed) } : undefined,
      f: data.positions.F ? { status: data.positions.F.open > 0 ? 'open' : 'closed', max: (data.positions.F.open + data.positions.F.closed) } : undefined,
      c: data.positions.C ? { status: data.positions.C.open > 0 ? 'open' : 'closed', max: (data.positions.C.open + data.positions.C.closed) } : undefined,
      bigman: data.positions.B ? { status: data.positions.B.open > 0 ? 'open' : 'closed', max: (data.positions.B.open + data.positions.B.closed) } : undefined,
    },
    rule: matchOptions ? {
      type: matchOptions.playStyle ? playStyleToRuleType[matchOptions.playStyle] : '2team',
      quarterTime: matchOptions.quarterRule?.minutesPerQuarter ?? 0,
      quarterCount: matchOptions.quarterRule?.quarterCount ?? 0,
      fullGames: matchOptions.quarterRule?.gameCount ?? 0,
      guaranteedQuarters: matchOptions.guaranteedQuarters ?? 0,
      referee: matchOptions.refereeType ? refereeTypeMap[matchOptions.refereeType] : 'self',
    } : undefined,
    currentPlayers: 0,
    totalPlayers: 0,
  };
}

export default function MatchManagementGuestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;
  const queryClient = useQueryClient();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  const { data: matchData, isLoading: isLoadingMatch, error } = useMatch(matchId);

  // 내 신청 정보 조회 (인증 로드 완료 후 쿼리)
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

      if (error) {
        console.error('Application query error:', error);
        throw error;
      }
      console.log('My application:', data);
      return data;
    },
    enabled: !isAuthLoading && !!user?.id && !!matchId,
  });

  // 신청 취소 mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!myApplication?.id) throw new Error('신청 정보가 없습니다');

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(myApplication.id);
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

  // 신청 상태 텍스트
  const getStatusText = () => {
    if (!myApplication) return null;
    if (myApplication.status === 'CONFIRMED') return '확정';
    if (myApplication.status === 'REJECTED') return '거절됨';
    if (myApplication.status === 'CANCELED') return '취소됨';
    if (myApplication.status === 'PENDING' && myApplication.approved_at) return '입금대기';
    return '승인대기';
  };

  // 취소 가능 여부
  const canCancel = myApplication &&
    myApplication.status !== 'REJECTED' &&
    myApplication.status !== 'CANCELED';

  // 인증 로딩, 매치 로딩, 신청 정보 로딩 모두 완료될 때까지 대기
  const isLoading = isAuthLoading || isLoadingMatch || (!!user?.id && isLoadingApplication);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">매치를 찾을 수 없습니다</p>
          <p className="text-sm text-slate-500">요청하신 경기가 존재하지 않습니다</p>
        </div>
      </div>
    );
  }

  const match = adaptToDetailMatch(matchData);

  // 신청이 있으면 커스텀 하단바 표시 (기존 하단바 위에 덮어씌움)
  if (myApplication) {
    return (
      <>
        <MatchDetailView match={match} />

        {/* 커스텀 하단바: 취소하기 (z-index를 높여서 기존 하단바 위에 표시) */}
        <div className="fixed bottom-0 left-0 right-0 z-[60] pointer-events-none md:pl-[240px]">
          <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="space-y-2">
              <div className="text-center text-sm text-slate-500">
                현재 상태: <span className="font-bold text-slate-900">{getStatusText()}</span>
              </div>
              {canCancel ? (
                <Button
                  onClick={() => setIsCancelDialogOpen(true)}
                  className="w-full h-12 text-lg font-bold rounded-xl bg-red-500 hover:bg-red-600 text-white"
                >
                  취소하기
                </Button>
              ) : (
                <div className="text-center py-2 text-slate-400 text-sm">
                  취소할 수 없는 상태입니다
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 취소 확인 다이얼로그 */}
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
                className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold"
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
      </>
    );
  }

  // 신청이 없으면 기본 상세페이지
  return <MatchDetailView match={match} />;
}

