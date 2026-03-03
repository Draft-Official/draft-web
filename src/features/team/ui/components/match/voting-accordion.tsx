'use client';

import { useState } from 'react';
import { ChevronDown, Check, Clock, X, HelpCircle, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { getPositionLabel } from '@/shared/config/match-constants';
import { toast } from '@/shared/ui/shadcn/sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { useRemoveTeamVoteGuest, useUpdateMemberVote } from '@/features/team/api/match/mutations';
import type { TeamVoteDTO, VotingSummary } from '@/features/team/model/types';

interface VotingAccordionProps {
  votes: TeamVoteDTO[];
  votingSummary: VotingSummary | null | undefined;
  isAdmin: boolean;
  matchId: string;
  isVotingClosed: boolean;
}

export function VotingAccordion({
  votes,
  votingSummary,
  isAdmin,
  matchId,
  isVotingClosed,
}: VotingAccordionProps) {
  void votingSummary;
  const canManageVotes = isAdmin && !isVotingClosed;
  const { mutate: updateMemberVote, isPending: isUpdatingMemberVote } = useUpdateMemberVote();
  const { mutate: removeTeamVoteGuest, isPending: isRemovingGuest } = useRemoveTeamVoteGuest();
  const isActionPending = isUpdatingMemberVote || isRemovingGuest;

  const handleMarkNotAttending = (voter: TeamVoteDTO) => {
    if (voter.status === 'NOT_ATTENDING') return;
    if (!window.confirm(`${voter.userNickname || '해당 팀원'}님을 불참으로 변경할까요?`)) return;

    updateMemberVote(
      {
        matchId,
        memberId: voter.userId,
        status: 'NOT_ATTENDING',
      },
      {
        onSuccess: () => {
          toast.success(`${voter.userNickname || '팀원'}님의 상태를 불참으로 변경했습니다.`);
        },
        onError: (error) => {
          toast.error(`불참 변경 실패: ${error.message}`);
        },
      }
    );
  };

  const handleRemoveGuest = (voter: TeamVoteDTO, guestIndex: number) => {
    const guest = voter.guestParticipants[guestIndex];
    const guestLabel = guest?.name || '게스트';
    if (!window.confirm(`${guestLabel}님을 제외할까요?`)) return;

    removeTeamVoteGuest(
      {
        matchId,
        ownerUserId: voter.userId,
        guestIndex,
      },
      {
        onSuccess: () => {
          toast.success(`${guestLabel}님을 제외했습니다.`);
        },
        onError: (error) => {
          toast.error(`게스트 제외 실패: ${error.message}`);
        },
      }
    );
  };

  // 참석 (CONFIRMED + LATE)
  const attendingVoters = votes.filter(
    (v) => v.status === 'CONFIRMED' || v.status === 'LATE'
  );

  // 불참
  const notAttendingVoters = votes.filter((v) => v.status === 'NOT_ATTENDING');

  // 미정
  const maybeVoters = votes.filter((v) => v.status === 'MAYBE');

  // 미투표
  const pendingVoters = votes.filter((v) => v.status === 'PENDING');

  return (
    <div className="divide-y divide-slate-100">
      <Accordion type="multiple" defaultValue={['attending']}>
        {/* 참석 그룹 - 기본 펼침 */}
        <AccordionItem value="attending" className="border-0">
          <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-green-600" />
              </div>
              <span className="font-medium text-slate-900">참석</span>
              <span className="text-sm text-slate-500">
                {attendingVoters.length}명
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-5 pb-3 space-y-1">
              {attendingVoters.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">아직 참석 인원이 없습니다</p>
              ) : (
                attendingVoters.map((voter) => (
                  <VoterItem
                    key={voter.id}
                    voter={voter}
                    showLateTag={voter.status === 'LATE'}
                    showReason={!!voter.description}
                    canManageVotes={canManageVotes}
                    canMarkNotAttending={voter.status !== 'NOT_ATTENDING'}
                    actionsDisabled={isActionPending}
                    onMarkNotAttending={() => handleMarkNotAttending(voter)}
                    onRemoveGuest={(guestIndex) => handleRemoveGuest(voter, guestIndex)}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 불참 그룹 */}
        <AccordionItem value="notAttending" className="border-0">
          <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="font-medium text-slate-900">불참</span>
              <span className="text-sm text-slate-500">
                {notAttendingVoters.length}명
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-5 pb-3 space-y-1">
              {notAttendingVoters.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">불참 인원이 없습니다</p>
              ) : (
                notAttendingVoters
                  .map((voter) => (
                    <VoterItem
                      key={voter.id}
                      voter={voter}
                      showReason={!!voter.description}
                      canManageVotes={canManageVotes}
                      canMarkNotAttending={false}
                      actionsDisabled={isActionPending}
                      onRemoveGuest={(guestIndex) => handleRemoveGuest(voter, guestIndex)}
                    />
                  ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 미정 그룹 */}
        <AccordionItem value="maybe" className="border-0">
          <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                <HelpCircle className="w-3.5 h-3.5 text-yellow-600" />
              </div>
              <span className="font-medium text-slate-900">미정</span>
              <span className="text-sm text-slate-500">
                {maybeVoters.length}명
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-5 pb-3 space-y-1">
              {maybeVoters.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">미정 인원이 없습니다</p>
              ) : (
                maybeVoters.map((voter) => (
                  <VoterItem
                    key={voter.id}
                    voter={voter}
                    showMaybeTag={true}
                    showReason={!!voter.description}
                    canManageVotes={canManageVotes}
                    canMarkNotAttending={voter.status !== 'NOT_ATTENDING'}
                    actionsDisabled={isActionPending}
                    onMarkNotAttending={() => handleMarkNotAttending(voter)}
                    onRemoveGuest={(guestIndex) => handleRemoveGuest(voter, guestIndex)}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 미투표 그룹 */}
        <AccordionItem value="pending" className="border-0">
          <AccordionTrigger className="px-5 py-3 hover:no-underline hover:bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <span className="font-medium text-slate-900">미투표</span>
              <span className="text-sm text-slate-500">
                {pendingVoters.length}명
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="px-5 pb-3 space-y-1">
              {pendingVoters.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">모든 팀원이 투표했습니다</p>
              ) : (
                pendingVoters.map((voter) => (
                  <VoterItem
                    key={voter.id}
                    voter={voter}
                    canManageVotes={canManageVotes}
                    canMarkNotAttending={voter.status !== 'NOT_ATTENDING'}
                    actionsDisabled={isActionPending}
                    onMarkNotAttending={() => handleMarkNotAttending(voter)}
                    onRemoveGuest={(guestIndex) => handleRemoveGuest(voter, guestIndex)}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface VoterItemProps {
  voter: TeamVoteDTO;
  showLateTag?: boolean;
  showMaybeTag?: boolean;
  showReason?: boolean;
  canManageVotes?: boolean;
  canMarkNotAttending?: boolean;
  actionsDisabled?: boolean;
  onMarkNotAttending?: () => void;
  onRemoveGuest?: (guestIndex: number) => void;
}

function VoterItem({
  voter,
  showLateTag,
  showMaybeTag,
  showReason,
  canManageVotes = false,
  canMarkNotAttending = false,
  actionsDisabled = false,
  onMarkNotAttending,
  onRemoveGuest,
}: VoterItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullReason, setShowFullReason] = useState(false);

  const nickname = voter.userNickname || '알 수 없음';
  const avatarUrl = voter.userAvatarUrl;
  const primaryPosition = voter.userPositions?.[0] ?? null;
  const guestCount = voter.guestParticipants.length;
  const hasGuests = guestCount > 0;
  const isTwoGuests = guestCount === 2;
  const hasReason = showReason && !!voter.description;

  // 사유가 50자 이상이면 더보기 필요
  const REASON_PREVIEW_LENGTH = 50;
  const needsShowMore = hasReason && (voter.description?.length || 0) > REASON_PREVIEW_LENGTH;
  const displayReason = hasReason && voter.description
    ? (showFullReason || !needsShowMore
        ? voter.description
        : voter.description.slice(0, REASON_PREVIEW_LENGTH))
    : '';

  const handleClick = () => {
    if (hasReason) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="py-1">
      <div
        className={cn(
          "flex items-center gap-3 py-2 px-2 rounded-lg transition-colors",
          hasReason && "cursor-pointer hover:bg-slate-50"
        )}
        onClick={handleClick}
      >
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={avatarUrl || undefined} alt={nickname} />
          <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-900 truncate">
                {nickname}
              </span>
            {primaryPosition && (
              <span className="text-xs text-slate-500">
                {getPositionLabel(primaryPosition, 'combined')}
              </span>
            )}
            {showLateTag && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-brand-weak-pressed text-brand rounded">
                늦참
              </span>
            )}
            {showMaybeTag && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                미정
              </span>
            )}
            {hasGuests && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                +{guestCount}명
              </span>
            )}
          </div>
          {hasGuests && (
            <div className="mt-0 pl-3">
              <div
                className={cn(
                  'mt-0 items-start',
                  isTwoGuests ? 'flex flex-row flex-wrap gap-1.5' : 'flex flex-col gap-1'
                )}
              >
                {voter.guestParticipants.map((guest, index) => (
                  <span
                    key={`${voter.id}-guest-${index}-${guest.name}`}
                    className="inline-flex items-center gap-1 w-fit max-w-[11rem] whitespace-normal break-words rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium leading-snug text-slate-700"
                  >
                    <span>
                      {guest.name || '게스트'} {getPositionLabel(guest.position, 'combined')}
                    </span>
                    {canManageVotes && onRemoveGuest && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveGuest(index);
                        }}
                        disabled={actionsDisabled}
                        className="rounded-full p-0.5 hover:bg-red-100 disabled:opacity-40"
                        aria-label="게스트 제외"
                        title="게스트 제외"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {canManageVotes && canMarkNotAttending && onMarkNotAttending && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkNotAttending();
            }}
            disabled={actionsDisabled}
            className="rounded-lg p-1.5 hover:bg-red-50 disabled:opacity-40"
            aria-label="불참 처리"
            title="불참 처리"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        )}

        {hasReason && (
          <ChevronDown
            className={cn(
              "w-4 h-4 text-slate-400 transition-transform shrink-0",
              isExpanded && "rotate-180"
            )}
          />
        )}
      </div>

      {/* 사유 표시 영역 */}
      {hasReason && isExpanded && (
        <div className="px-2 pb-2 pl-[52px] animate-in slide-in-from-top-1 duration-200">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
              {displayReason}
              {needsShowMore && !showFullReason && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowFullReason(true);
                  }}
                  className="ml-1 text-slate-400 hover:text-primary transition-colors"
                >
                  ...
                </button>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
