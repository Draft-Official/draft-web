'use client';

import { VotingAccordion } from './voting-accordion';
import type { VotingSummary } from '@/features/team/model/types';
import type { Application } from '@/shared/types/database.types';

interface TeamVotingSectionProps {
  votes: Application[];
  votingSummary?: VotingSummary;
  isAdmin: boolean;
  matchId: string;
  isVotingClosed: boolean;
  isLoading: boolean;
}

export function TeamVotingSection({
  votes,
  votingSummary,
  isAdmin,
  matchId,
  isVotingClosed,
  isLoading,
}: TeamVotingSectionProps) {
  return (
    <section className="bg-white px-5 py-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          투표 현황
          {votingSummary && (
            <span className="text-sm font-normal text-slate-500">
              ({votingSummary.attending + votingSummary.late}명 참석 / {votingSummary.totalMembers}명)
            </span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (
        <VotingAccordion
          votes={votes}
          votingSummary={votingSummary}
          isAdmin={isAdmin}
          matchId={matchId}
          isVotingClosed={isVotingClosed}
        />
      )}
    </section>
  );
}
