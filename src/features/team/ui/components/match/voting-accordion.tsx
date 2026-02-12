'use client';

import { useState } from 'react';
import { ChevronDown, Check, Clock, X, HelpCircle, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/base/avatar';
import { VoteChangeDialog } from './vote-change-dialog';
import type { Application } from '@/shared/types/database.types';
import type { VotingSummary } from '@/features/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import { TEAM_VOTE_STATUS_LABELS } from '@/shared/config/team-constants';

interface VotingAccordionProps {
  votes: Application[];
  votingSummary: VotingSummary | null | undefined;
  isAdmin: boolean;
  matchId: string;
  isVotingClosed: boolean;
}

interface VoterWithUser extends Application {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  } | null;
}

export function VotingAccordion({
  votes,
  votingSummary,
  isAdmin,
  matchId,
  isVotingClosed,
}: VotingAccordionProps) {
  const [selectedMember, setSelectedMember] = useState<VoterWithUser | null>(null);

  // 투표를 상태별로 분류
  const votersWithUser = votes as VoterWithUser[];

  // 참석 (CONFIRMED + LATE)
  const attendingVoters = votersWithUser.filter(
    (v) => v.status === 'CONFIRMED' || v.status === 'LATE'
  );
  const confirmedVoters = attendingVoters.filter((v) => v.status === 'CONFIRMED');
  const lateVoters = attendingVoters.filter((v) => v.status === 'LATE');

  // 불참
  const notAttendingVoters = votersWithUser.filter((v) => v.status === 'NOT_ATTENDING');

  // 미정
  const maybeVoters = votersWithUser.filter((v) => v.status === 'MAYBE');

  // 미투표
  const pendingVoters = votersWithUser.filter((v) => v.status === 'PENDING');

  const handleMemberClick = (voter: VoterWithUser) => {
    // 투표 마감 시 클릭 불가
    if (isAdmin && !isVotingClosed) {
      setSelectedMember(voter);
    }
  };

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
                    isAdmin={false}
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
                // 사유가 있는 사람만 표시
                notAttendingVoters
                  .filter((voter) => !!voter.description)
                  .map((voter) => (
                    <VoterItem
                      key={voter.id}
                      voter={voter}
                      showReason={!!voter.description}
                      isAdmin={false}
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
                    isAdmin={false}
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
                    isAdmin={false}
                  />
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* 관리자 투표 변경 다이얼로그 */}
      {isAdmin && selectedMember && (
        <VoteChangeDialog
          open={!!selectedMember}
          onOpenChange={(open) => !open && setSelectedMember(null)}
          matchId={matchId}
          memberId={selectedMember.user_id}
          memberName={selectedMember.users?.nickname || '알 수 없음'}
          currentVote={selectedMember.status as TeamVoteStatusValue}
        />
      )}
    </div>
  );
}

interface VoterItemProps {
  voter: VoterWithUser;
  showLateTag?: boolean;
  showMaybeTag?: boolean;
  showReason?: boolean;
  isAdmin?: boolean;
  onClick?: () => void;
}

function VoterItem({
  voter,
  showLateTag,
  showMaybeTag,
  showReason,
  isAdmin,
  onClick,
}: VoterItemProps) {
  const user = voter.users;
  const nickname = user?.nickname || '알 수 없음';
  const avatarUrl = user?.avatar_url;

  return (
    <div
      className="flex items-center gap-3 py-2 px-2 rounded-lg"
    >
      <Avatar className="w-8 h-8">
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
          {showLateTag && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-orange-100 text-orange-600 rounded">
              늦참
            </span>
          )}
          {showMaybeTag && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded">
              미정
            </span>
          )}
        </div>
        {showReason && voter.description && (
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {voter.description}
          </p>
        )}
      </div>
    </div>
  );
}
