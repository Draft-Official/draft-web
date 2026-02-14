'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Share2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HeroSection } from './components/detail/hero-section';
import { AnnouncementSection } from './components/detail/announcement-section';
import { RecruitmentStatus } from './components/detail/recruitment-status';
import { MatchInfoSection } from './components/detail/match-info-section';
import { MatchRuleSection } from './components/detail/match-rule-section';
import { FacilitySection } from './components/detail/facility-section';
import { HostSection } from './components/detail/host-section';
import { PolicySection } from './components/detail/policy-section';
import { MatchDetailBottomBar } from './components/detail/bottom-bar';
import { ShareModal } from './components/detail/share-modal';
import { KebabMenu } from './components/detail/kebab-menu';
import { MatchDetailUI } from '@/features/match/model/types';
import { ApplyModal } from '@/features/application/ui/apply-modal';
import { useAuth } from '@/features/auth/model/auth-context';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/entities/application';
import { matchManagementKeys } from '@/features/schedule/api/keys';

interface MatchDetailViewProps {
  match: MatchDetailUI;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 경기관리 > 참여에서 들어온 경우
  const isFromSchedule = searchParams.get('from') === 'schedule';

  // 내 신청 정보 조회
  const { data: myApplication, isLoading: isLoadingApplication } = useQuery({
    queryKey: ['my-application', match.id, user?.id],
    queryFn: async () => {
      if (!user?.id || !match.id) return null;

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!match.id,
  });

  // 확정된 게스트 수 조회 (호스트 메뉴용)
  const { data: confirmedCount = 0 } = useQuery({
    queryKey: ['confirmed-guests', match.id],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .eq('match_id', match.id)
        .eq('status', 'CONFIRMED');

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!match.id && match.hostId === user?.id,
  });

  // 공지 조회
  // announcements 테이블은 아직 generated types에 미반영 — 타입 우회
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', match.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = getSupabaseBrowserClient() as any;
      const { data, error } = await supabase
        .from('announcements')
        .select('id, message, created_at')
        .eq('target_type', 'MATCH')
        .eq('target_id', match.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data ?? []).map((row: { id: string; message: string; created_at: string }) => ({
        id: row.id,
        message: row.message,
        createdAt: row.created_at,
      }));
    },
    enabled: !!match.id,
  });

  // 호스트 여부
  const isHost = match.hostId === user?.id;

  // 신청 취소 mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!myApplication?.id) throw new Error('신청 정보가 없습니다');

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);
      return applicationService.cancelApplication(myApplication.id, {
        cancelType: 'USER_REQUEST',
        canceledBy: 'GUEST',
      });
    },
    onSuccess: () => {
      toast.success('참가 신청이 취소되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['my-application', match.id] });
      queryClient.invalidateQueries({ queryKey: matchManagementKeys.participatingMatches(user?.id ?? '') });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(`취소 실패: ${error.message}`);
    },
  });

  // 경기 종료 여부 (시간 기반)
  const isMatchEnded = !!(match.dateISO && match.endTime &&
    new Date() >= new Date(`${match.dateISO}T${match.endTime}`));

  // 이미 신청한 경기인지 (from=schedule이거나 myApplication이 있는 경우)
  const hasApplied = isFromSchedule || !!myApplication;

  // 취소 가능 여부 (종료/확정/거절/취소 상태가 아닌 경우만)
  const canCancel = !isMatchEnded && !!(myApplication &&
    myApplication.status !== 'CONFIRMED' &&
    myApplication.status !== 'REJECTED' &&
    myApplication.status !== 'CANCELED');

  // 상태 텍스트
  const getStatusText = () => {
    if (!myApplication) return undefined;
    if (myApplication.status === 'CANCELED') return '취소 완료';
    if (myApplication.status === 'REJECTED') return '승인 거절';
    if (myApplication.status === 'CONFIRMED') return '확정된 경기입니다';
    return undefined;
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleCancelClick = () => {
    if (!myApplication?.id) {
      toast.error('신청 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    cancelMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-white relative pb-[100px] max-w-[760px] mx-auto shadow-2xl shadow-slate-200">
      
      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[52px] flex items-center justify-between px-2">
        <button
          onClick={() => router.back()}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <KebabMenu
            matchId={match.id}
            isHost={isHost}
            hasConfirmedGuests={confirmedCount > 0}
            onCancelMatch={() => {
              toast.success('경기가 취소되었습니다.');
              router.back();
            }}
          />
        </div>
      </header>

      {/* 2. Content Sections */}
      <main>
        <HeroSection match={match} />

        {/* Announcement Section */}
        <AnnouncementSection announcements={announcements} />

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        <RecruitmentStatus match={match} />
        
        <div className="h-px bg-slate-100 mx-5" />

        <MatchInfoSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <MatchRuleSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <HostSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <FacilitySection match={match} id="facility-section" />

        <div className="h-px bg-slate-100 mx-5" />

        <PolicySection />
      </main>

      {/* 3. Bottom Bar */}
      <MatchDetailBottomBar
        match={match}
        onApply={handleApplyClick}
        hasApplied={hasApplied}
        canCancel={canCancel ?? undefined}
        onCancel={handleCancelClick}
        isLoading={isLoadingApplication && isFromSchedule}
        isCanceling={cancelMutation.isPending}
        statusText={getStatusText()}
        isMatchEnded={isMatchEnded}
        isHost={isHost}
        onManage={() => router.push(`/matches/${match.id}/manage`)}
      />

      {/* 4. Apply Modal */}
      <ApplyModal
        open={isApplyModalOpen}
        onOpenChange={setIsApplyModalOpen}
        matchId={match.id}
        matchTitle={match.title}
        costAmount={match.priceNum}
      />

      {/* 5. Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        matchId={match.id}
        matchTitle={match.title}
        matchDate={(() => {
          const d = new Date(match.dateISO);
          const month = d.getMonth() + 1;
          const date = d.getDate();
          const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
          return `${month}월 ${date}일 (${day}) ${match.startTime}`;
        })()}
        location={match.location}
      />
    </div>
  );
}
