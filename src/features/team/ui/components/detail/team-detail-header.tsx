'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Clock, Settings, Share2, Link2, MessageCircle } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { cn } from '@/shared/lib/utils';
import { formatTeamRegularSchedule } from '@/features/team/lib';
import { useJoinTeam } from '@/features/team/api/membership/mutations';
import { useAuth } from '@/shared/session';
import type { TeamInfoDTO, TeamMembershipDTO } from '@/features/team/model/types';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/shared/ui/shadcn/hover-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface TeamDetailHeaderProps {
  team: TeamInfoDTO;
  membership: TeamMembershipDTO | null;
  homeGymName: string | null;
  isLoggedIn: boolean;
  currentView?: string;
}

/**
 * 팀 상세 페이지 헤더 섹션
 * - 팀 로고, 이름, 기본 정보
 * - 팀 설정 / 공유 버튼 (세그먼트 컨트롤 스타일)
 */
export function TeamDetailHeader({ team, membership, homeGymName, isLoggedIn, currentView = 'home' }: TeamDetailHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const joinTeamMutation = useJoinTeam();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // 멤버십 상태
  const isMember = membership?.status === 'ACCEPTED';
  const isPending = membership?.status === 'PENDING';

  // 팀 로고 기본값
  const logoChar = team.name.charAt(0);
  const logoColors = [
    'bg-purple-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-draft-500',
    'bg-pink-500',
  ];
  const logoColorIndex = team.name.charCodeAt(0) % logoColors.length;
  const logoBgColor = logoColors[logoColorIndex];

  // 정기운동 스케줄 포맷
  const scheduleText = formatTeamRegularSchedule(
    team.regularDay,
    team.regularStartTime,
    team.regularEndTime
  );

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/team/${team.code}`
    : '';

  const handleSettings = () => {
    router.push(`/team/${team.code}/settings`);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('초대 링크가 복사되었습니다');
      setIsShareModalOpen(false);
    } catch {
      toast.error('링크 복사에 실패했습니다');
    }
  };

  const handleKakaoShare = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: `${team.name} 팀에 초대합니다`,
          text: `${team.name} 팀에 가입하세요!`,
          url: shareUrl,
        }).then(() => {
          setIsShareModalOpen(false);
        }).catch(() => {
          // 사용자가 취소한 경우 무시
        });
      } else {
        handleCopyLink();
      }
    } catch {
      handleCopyLink();
    }
  };

  const handleJoinTeam = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await joinTeamMutation.mutateAsync({
        teamId: team.id,
        userId: user.id,
      });
      toast.success('가입 신청이 완료되었습니다');
    } catch {
      toast.error('가입 신청에 실패했습니다');
    }
  };

  const handleLoginPrompt = () => {
    router.push('/login');
  };

  return (
    <div className="px-5 py-6 bg-white">
      {/* 팀 로고 + 이름 */}
      <div className="flex items-start gap-4 mb-4">
        {/* 로고 */}
        <div className="shrink-0">
          {team.logoUrl ? (
            <Image
              src={team.logoUrl}
              alt={`${team.name} 로고`}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center',
                'text-white text-2xl font-bold',
                logoBgColor
              )}
            >
              {logoChar}
            </div>
          )}
        </div>

        {/* 팀 정보 */}
        <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-slate-900 truncate">{team.name}</h1>

            {/* 홈 구장 */}
            {homeGymName && (
              <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span className="truncate">{homeGymName}</span>
              </div>
            )}

            {/* 정기 운동 */}
            {scheduleText && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{scheduleText}</span>
              </div>
            )}
          </div>

          {/* 설정 + 공유 버튼 (멤버만 표시) - 가장 오른쪽 */}
          {isMember && (
            <div className="shrink-0 flex flex-col items-center">
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={handleSettings}
                    className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
                    aria-label="팀 설정"
                  >
                    <Settings className="w-6 h-6" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="top" align="end" className="w-auto px-3 py-1.5">
                  <p className="text-sm">팀설정</p>
                </HoverCardContent>
              </HoverCard>
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
                    aria-label="팀원 초대"
                  >
                    <Share2 className="w-6 h-6" />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent side="bottom" align="end" className="w-auto px-3 py-1.5">
                  <p className="text-sm">팀원 초대</p>
                </HoverCardContent>
              </HoverCard>
            </div>
          )}
        </div>
      </div>

      {/* 버튼 영역 - 멤버십 상태에 따라 다르게 표시 */}
      {isMember ? null : isPending ? (
        // 승인 대기 중
        <div className="flex rounded-xl bg-slate-100 p-1">
          <div className="flex-1 py-2.5 px-4 text-sm font-medium text-slate-500 text-center">
            승인 대기 중
          </div>
        </div>
      ) : isLoggedIn ? (
        // 비회원 (로그인됨): 가입 신청 버튼
        <button
          onClick={handleJoinTeam}
          disabled={joinTeamMutation.isPending}
          className={cn(
            'w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors',
            'bg-primary text-white hover:bg-primary/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {joinTeamMutation.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner className="w-4 h-4 " />
              신청 중...
            </span>
          ) : (
            '팀 가입 신청'
          )}
        </button>
      ) : (
        // 비로그인: 로그인 유도
        <button
          onClick={handleLoginPrompt}
          className={cn(
            'w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors',
            'bg-slate-100 text-slate-700 hover:bg-slate-200'
          )}
        >
          로그인하고 가입 신청하기
        </button>
      )}

      {/* 공유 모달 */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center">팀원 초대</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Button
              variant="outline"
              className="h-14 justify-start gap-4 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={handleKakaoShare}
            >
              <div className="w-10 h-10 bg-kakao rounded-lg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-kakao-foreground" />
              </div>
              <span className="text-sm font-medium text-slate-900">카카오톡으로 초대</span>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-4 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={handleCopyLink}
            >
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Link2 className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-slate-900">초대 링크 복사</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
