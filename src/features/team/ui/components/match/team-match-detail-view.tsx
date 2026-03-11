'use client';

import { useState } from 'react';
import { ArrowLeft, Lock, LockOpen } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { cn } from '@/shared/lib/utils';
import { useSafeBack } from '@/shared/lib/hooks';
import { VoteDialog } from '@/shared/ui/composite/vote-dialog';
import { ConfirmDialog } from '@/shared/ui/composite/confirm-dialog';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/shadcn/hover-card';
import { TeamHeroSection } from './team-hero-section';
import { TeamVotingSection } from './team-voting-section';
import { TeamInfoSection } from './team-info-section';
import { TeamFacilitySection } from './team-facility-section';
import { useTeamVotes, useVotingSummary, useMyVote } from '@/features/team/api/match/queries';
import { useVote, useCloseVoting, useReopenVoting } from '@/features/team/api/match/mutations';
import { buildTeamVoteReminderMessage, toKakaoShareText } from '@/features/team/lib/team-vote-reminder';
import type {
  TeamInfoDTO,
  TeamMatchDetailDTO,
  TeamMembershipDTO,
} from '@/features/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';

interface KakaoShareTextPayload {
  objectType: 'text';
  text: string;
  link: {
    mobileWebUrl: string;
    webUrl: string;
  };
  buttonTitle?: string;
}

interface KakaoSdk {
  isInitialized: () => boolean;
  init: (appKey: string) => void;
  Share: {
    sendDefault: (payload: KakaoShareTextPayload) => void;
  };
}

interface WindowWithKakao extends Window {
  Kakao?: KakaoSdk;
}

const KAKAO_SDK_SRC = 'https://developers.kakao.com/sdk/js/kakao.min.js';
let kakaoSdkPromise: Promise<KakaoSdk | null> | null = null;

function initializeKakaoSdk(kakao: KakaoSdk, appKey: string): KakaoSdk | null {
  try {
    if (!kakao.isInitialized()) {
      kakao.init(appKey);
    }
    return kakao;
  } catch {
    return null;
  }
}

async function loadKakaoSdk(appKey: string): Promise<KakaoSdk | null> {
  if (!appKey || typeof window === 'undefined') return null;

  const existingKakao = (window as WindowWithKakao).Kakao;
  if (existingKakao) {
    return initializeKakaoSdk(existingKakao, appKey);
  }

  if (!kakaoSdkPromise) {
    kakaoSdkPromise = new Promise((resolve) => {
      let settled = false;
      const settle = (sdk: KakaoSdk | null) => {
        if (settled) return;
        settled = true;
        resolve(sdk);
      };

      const complete = () => {
        const loadedKakao = (window as WindowWithKakao).Kakao;
        settle(loadedKakao ? initializeKakaoSdk(loadedKakao, appKey) : null);
      };

      const handleError = () => settle(null);
      const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${KAKAO_SDK_SRC}"]`);

      if (existingScript) {
        existingScript.addEventListener('load', complete, { once: true });
        existingScript.addEventListener('error', handleError, { once: true });
        window.setTimeout(complete, 3000);
        return;
      }

      const script = document.createElement('script');
      script.src = KAKAO_SDK_SRC;
      script.async = true;
      script.defer = true;
      script.addEventListener('load', complete, { once: true });
      script.addEventListener('error', handleError, { once: true });
      document.head.appendChild(script);
    });
  }

  const sdk = await kakaoSdkPromise;
  if (!sdk) {
    kakaoSdkPromise = null;
  }
  return sdk;
}

interface TeamMatchDetailViewProps {
  match: TeamMatchDetailDTO;
  team: TeamInfoDTO;
  membership: TeamMembershipDTO;
  userId?: string;
  showVoteAction?: boolean;
  showExtraSections?: boolean;
  canQuickAddGuest?: boolean;
  onBack?: () => void;
  layoutMode?: 'page' | 'split';
}

interface TeamBottomBarContainerProps {
  layoutMode: 'page' | 'split';
  children: React.ReactNode;
}

function TeamBottomBarContainer({ layoutMode, children }: TeamBottomBarContainerProps) {
  if (layoutMode === 'split') {
    return (
      <div className="sticky bottom-0 z-30 border-t border-slate-100 bg-white/95 px-5 pt-3 pb-4 shadow-[0_-8px_16px_-12px_rgba(15,23,42,0.35)] backdrop-blur">
        {children}
      </div>
    );
  }

  return (
    <div className="app-overlay-shell app-overlay-shell--with-sidebar">
      <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {children}
      </div>
    </div>
  );
}

export function TeamMatchDetailView({
  match,
  team,
  membership,
  userId,
  showVoteAction = true,
  showExtraSections = true,
  canQuickAddGuest = false,
  onBack,
  layoutMode = 'page',
}: TeamMatchDetailViewProps) {
  type VotingAction = 'close' | 'reopen' | null;

  const safeBack = useSafeBack(`/team/${team.code}`);
  const handleBack = onBack ?? safeBack;
  const [isVoteDialogOpen, setIsVoteDialogOpen] = useState(false);
  const [pendingVotingAction, setPendingVotingAction] = useState<VotingAction>(null);

  // 투표 현황 조회
  const { data: votes = [], isLoading: isVotesLoading } = useTeamVotes(match.matchId);
  const { data: votingSummary } = useVotingSummary(match.matchId, team.id);
  const { data: myVote } = useMyVote(match.matchId, userId);

  // Mutations
  const { mutate: vote, isPending: isVoting } = useVote();
  const { mutate: closeVoting, isPending: isClosing } = useCloseVoting();
  const { mutate: reopenVoting, isPending: isReopening } = useReopenVoting();

  // 권한 체크
  const isLeader = membership.role === 'LEADER';
  const isManager = membership.role === 'MANAGER';
  const isTeamAdmin = isLeader || isManager;
  const canManageMatch = userId === match.hostId;
  const isVotingClosed = match.isVotingClosed;

  // 투표하기
  const handleVote = (status: TeamVoteStatusValue, reason: string) => {
    if (!userId) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    vote(
      {
        userId,
        input: {
          matchId: match.matchId,
          status,
          description: reason || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('투표가 완료되었습니다.');
          setIsVoteDialogOpen(false);
        },
        onError: (error) => {
          toast.error(`투표 실패: ${error.message}`);
        },
      }
    );
  };

  // 투표 마감
  const handleCloseVoting = () => {
    closeVoting(
      { matchId: match.matchId, teamId: team.id },
      {
        onSuccess: () => {
          toast.success('투표가 마감되었습니다.');
          setPendingVotingAction(null);
        },
        onError: (error) => {
          toast.error(`마감 실패: ${error.message}`);
          setPendingVotingAction(null);
        },
      }
    );
  };

  // 투표 재오픈
  const handleReopenVoting = () => {
    reopenVoting(
      { matchId: match.matchId, teamId: team.id },
      {
        onSuccess: () => {
          toast.success('투표가 재오픈되었습니다.');
          setPendingVotingAction(null);
        },
        onError: (error) => {
          toast.error(`재오픈 실패: ${error.message}`);
          setPendingVotingAction(null);
        },
      }
    );
  };

  const handleConfirmVotingAction = () => {
    if (pendingVotingAction === 'close') {
      handleCloseVoting();
      return;
    }

    if (pendingVotingAction === 'reopen') {
      handleReopenVoting();
    }
  };

  const handleShareVoteReminder = async () => {
    if (typeof window === 'undefined') return;

    const pendingCount = votes.filter((voteItem) => voteItem.status === 'PENDING').length;

    const fallbackAttendingCount = votes.filter(
      (voteItem) => voteItem.status === 'CONFIRMED' || voteItem.status === 'LATE'
    ).length;
    const fallbackNotAttendingCount = votes.filter((voteItem) => voteItem.status === 'NOT_ATTENDING').length;
    const fallbackMaybeCount = votes.filter((voteItem) => voteItem.status === 'MAYBE').length;

    const voteUrl = `${window.location.origin}/team/${team.code ?? team.id}/matches/${match.publicId}`;

    const reminderMessage = buildTeamVoteReminderMessage({
      teamName: team.name,
      matchDateTime: `${match.dateDisplay} ${match.timeDisplay}`,
      pendingCount,
      voteUrl,
      attendingCount: votingSummary ? votingSummary.attending + votingSummary.late : fallbackAttendingCount,
      notAttendingCount: votingSummary ? votingSummary.notAttending : fallbackNotAttendingCount,
      maybeCount: votingSummary ? votingSummary.maybe : fallbackMaybeCount,
    });

    const kakaoJavaScriptKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY ?? '';

    try {
      const kakaoSdk = await loadKakaoSdk(kakaoJavaScriptKey);

      if (kakaoSdk) {
        kakaoSdk.Share.sendDefault({
          objectType: 'text',
          text: toKakaoShareText(reminderMessage),
          link: {
            mobileWebUrl: voteUrl,
            webUrl: voteUrl,
          },
          buttonTitle: '투표하러 가기',
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: `[${team.name}] ${match.dateDisplay} ${match.timeDisplay}`,
          text: reminderMessage,
          url: voteUrl,
        });
        return;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(reminderMessage);
      toast.success('카카오 공유를 사용할 수 없어 리마인더 문구를 복사했습니다.');
    } catch {
      toast.error('리마인더 공유에 실패했습니다.');
    }
  };

  // 내 투표 상태
  const myVoteStatus = myVote?.status as TeamVoteStatusValue | undefined;
  const hasVoted = myVoteStatus && myVoteStatus !== 'PENDING';
  const isVotingActionDialogOpen = pendingVotingAction !== null;
  const isVotingActionLoading =
    pendingVotingAction === 'close' ? isClosing : pendingVotingAction === 'reopen' ? isReopening : false;
  const votingActionTitle =
    pendingVotingAction === 'close' ? '투표를 마감하시겠습니까?' : '투표를 재오픈 하시겠습니까?';
  const votingActionConfirmLabel = pendingVotingAction === 'close' ? '마감하기' : '재오픈하기';
  const VotingActionIcon = pendingVotingAction === 'close' ? Lock : LockOpen;

  return (
    <div
      className={cn(
        'bg-background relative',
        layoutMode === 'split' ? 'min-h-full pb-24' : 'min-h-screen pb-[100px] app-content-container'
      )}
    >

      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[52px] flex items-center justify-between px-2">
        <button
          onClick={handleBack}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1">
          {canManageMatch && !isVotingClosed && (
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <button
                  onClick={() => setPendingVotingAction('close')}
                  disabled={isClosing}
                  aria-label="투표 마감하기"
                  className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Lock className="w-5 h-5" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" align="end" className="w-auto px-3 py-1.5">
                <p className="text-sm">투표 마감하기</p>
              </HoverCardContent>
            </HoverCard>
          )}
          {canManageMatch && isVotingClosed && isLeader && (
            <HoverCard openDelay={200}>
              <HoverCardTrigger asChild>
                <button
                  onClick={() => setPendingVotingAction('reopen')}
                  disabled={isReopening}
                  aria-label="투표 재오픈하기"
                  className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <LockOpen className="w-5 h-5" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent side="bottom" align="end" className="w-auto px-3 py-1.5">
                <p className="text-sm">투표 재오픈하기</p>
              </HoverCardContent>
            </HoverCard>
          )}
        </div>
      </header>

      {/* 2. Content Sections */}
      <main>
        <TeamHeroSection match={match} teamName={team.name} />

        {/* 투표 마감 배지 */}
        {isVotingClosed && (
          <div className="px-5 pb-4">
            <div className="px-3 py-2 bg-slate-100 rounded-lg">
              <p className="text-sm font-medium text-slate-600">투표가 마감되었습니다</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />

        <TeamVotingSection
          votes={votes}
          votingSummary={votingSummary ?? undefined}
          isAdmin={isTeamAdmin}
          matchId={match.matchId}
          isVotingClosed={isVotingClosed}
          isLoading={isVotesLoading}
          canQuickAddGuest={canQuickAddGuest}
          canShareReminder={isLeader}
          onShareReminder={handleShareVoteReminder}
          isShareReminderDisabled={isVotesLoading}
        />

        {showExtraSections && (
          <>
            <div className="h-px bg-slate-100 mx-5" />

            <TeamInfoSection team={team} />

            <div className="h-px bg-slate-100 mx-5" />

            <TeamFacilitySection match={match} id="facility-section" />
          </>
        )}
      </main>

      {showVoteAction && (
        <TeamBottomBarContainer layoutMode={layoutMode}>
          <button
            onClick={() => setIsVoteDialogOpen(true)}
            disabled={isVotingClosed}
            className={cn(
              'w-full h-12 rounded-xl font-bold text-lg transition-all',
              isVotingClosed
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary/90'
            )}
          >
            {isVotingClosed
              ? '투표가 마감되었습니다.'
              : hasVoted
              ? '투표 변경하기'
              : '투표하기'}
          </button>
        </TeamBottomBarContainer>
      )}

      {showVoteAction && (
        <VoteDialog
          open={isVoteDialogOpen}
          onOpenChange={setIsVoteDialogOpen}
          currentVote={myVoteStatus}
          currentReason={myVote?.description || ''}
          onSubmit={handleVote}
          isSubmitting={isVoting}
        />
      )}

      <ConfirmDialog
        open={isVotingActionDialogOpen}
        onOpenChange={(open) => {
          if (!open && !isVotingActionLoading) {
            setPendingVotingAction(null);
          }
        }}
        icon={VotingActionIcon}
        title={votingActionTitle}
        confirmLabel={votingActionConfirmLabel}
        cancelLabel="취소"
        onConfirm={handleConfirmVotingAction}
        loading={isVotingActionLoading}
      />
    </div>
  );
}
