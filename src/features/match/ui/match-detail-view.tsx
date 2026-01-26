'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Share2, MoreVertical } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { HeroSection } from './components/detail/hero-section';
import { RecruitmentStatus } from './components/detail/recruitment-status';
import { MatchInfoSection } from './components/detail/match-info-section';
import { MatchRuleSection } from './components/detail/match-rule-section';
import { FacilitySection } from './components/detail/facility-section';
import { HostSection } from './components/detail/host-section';
import { MatchDetailBottomBar } from './components/detail/bottom-bar';
import { Match } from '@/features/match/model/types';
import { ApplyModal } from '@/features/application/ui/apply-modal';
import { useAuth } from '@/features/auth/model/auth-context';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from '@/features/application/api/application-api';
import { matchManagementKeys } from '@/features/schedule/api/keys';

interface MatchDetailViewProps {
  match: Match;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuth();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

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
      queryClient.invalidateQueries({ queryKey: ['my-application', match.id] });
      queryClient.invalidateQueries({ queryKey: matchManagementKeys.participatingMatches(user?.id ?? '') });
      router.back();
    },
    onError: (error: Error) => {
      toast.error(`취소 실패: ${error.message}`);
    },
  });

  // 이미 신청한 경기인지 (from=schedule이거나 myApplication이 있는 경우)
  const hasApplied = isFromSchedule || !!myApplication;

  // 취소 가능 여부 (REJECTED, CANCELED 상태가 아닌 경우만)
  const canCancel = !!(myApplication &&
    myApplication.status !== 'REJECTED' &&
    myApplication.status !== 'CANCELED');

  // 상태 텍스트
  const getStatusText = () => {
    if (!myApplication) return undefined;
    if (myApplication.status === 'CANCELED') return '취소 완료';
    if (myApplication.status === 'REJECTED') return '승인 거절';
    if (myApplication.status === 'CONFIRMED') return '참가 확정';
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
          <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Content Sections */}
      <main>
        <HeroSection match={match} />
        
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
      />

      {/* 4. Apply Modal */}
      <ApplyModal
        open={isApplyModalOpen}
        onOpenChange={setIsApplyModalOpen}
        matchId={match.id}
        matchTitle={match.title}
        costAmount={match.priceNum}
      />
    </div>
  );
}
