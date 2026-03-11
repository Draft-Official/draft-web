import type { InfiniteData } from '@tanstack/react-query';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import type { ScheduleMatchListItemDTO } from '../model/types';

type SchedulePageLike = {
  matches: ScheduleMatchListItemDTO[];
};

export function applyScheduleVoteOptimisticUpdate<TPage extends SchedulePageLike>(
  data: InfiniteData<TPage>,
  matchId: string,
  status: TeamVoteStatusValue,
  reason?: string
): InfiniteData<TPage> {
  const nextReason = reason || undefined;
  let hasChanged = false;

  const pages = data.pages.map((page) => {
    let pageChanged = false;

    const matches = page.matches.map((match) => {
      if (match.id !== matchId || match.managementType !== 'team_exercise') {
        return match;
      }

      if (match.myVote === status && match.myVoteReason === nextReason) {
        return match;
      }

      pageChanged = true;
      return {
        ...match,
        myVote: status,
        myVoteReason: nextReason,
      };
    });

    if (!pageChanged) {
      return page;
    }

    hasChanged = true;
    return {
      ...page,
      matches,
    };
  });

  if (!hasChanged) {
    return data;
  }

  return {
    ...data,
    pages,
  };
}
