'use client';

import { MatchSplitDetailPanel } from '@/features/match/ui/match-split-detail-panel';
import { TeamMatchDetailPanel } from '@/features/team/ui/components/match/team-match-detail-panel';
import { DesktopDetailPanelShell } from '@/shared/ui/layout';
import { HostMatchDetailView } from './host-match-detail-view';
import { TournamentDetailView } from './tournament-detail-view';
import { TournamentManageView } from './tournament-manage-view';

interface ScheduleRouteDetailPanelProps {
  routePath: string | null;
  onClose?: () => void;
  emptyMessage?: string;
}

type ParsedScheduleRoute =
  | {
      type: 'match-view';
      matchPublicId: string;
      fromSchedule: boolean;
      fromCreate: boolean;
      fullPageHref: string;
    }
  | {
      type: 'match-manage';
      matchPublicId: string;
      fullPageHref: string;
    }
  | {
      type: 'team-match-view';
      teamCode: string;
      matchIdentifier: string;
      fullPageHref: string;
    }
  | {
      type: 'team-match-manage';
      teamCode: string;
      matchIdentifier: string;
      fullPageHref: string;
    }
  | {
      type: 'tournament-view';
      fullPageHref: string;
    }
  | {
      type: 'tournament-manage';
      fullPageHref: string;
    };

function parseScheduleRoute(routePath: string): ParsedScheduleRoute | null {
  try {
    const url = new URL(routePath, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);
    const fullPageHref = `${url.pathname}${url.search}${url.hash}`;

    if (segments.length >= 2 && segments[0] === 'matches') {
      if (segments[2] === 'manage') {
        return {
          type: 'match-manage',
          matchPublicId: segments[1],
          fullPageHref,
        };
      }

      return {
        type: 'match-view',
        matchPublicId: segments[1],
        fromSchedule: url.searchParams.get('from') === 'schedule',
        fromCreate: url.searchParams.get('from') === 'create',
        fullPageHref,
      };
    }

    if (segments.length >= 4 && segments[0] === 'team' && segments[2] === 'matches') {
      if (segments[4] === 'manage') {
        return {
          type: 'team-match-manage',
          teamCode: segments[1],
          matchIdentifier: segments[3],
          fullPageHref,
        };
      }

      return {
        type: 'team-match-view',
        teamCode: segments[1],
        matchIdentifier: segments[3],
        fullPageHref,
      };
    }

    if (segments.length >= 2 && segments[0] === 'tournaments') {
      if (segments[2] === 'manage') {
        return {
          type: 'tournament-manage',
          fullPageHref,
        };
      }

      return {
        type: 'tournament-view',
        fullPageHref,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function ScheduleRouteDetailPanel({
  routePath,
  onClose,
  emptyMessage = '왼쪽 목록에서 경기를 선택해 주세요.',
}: ScheduleRouteDetailPanelProps) {
  const parsed = routePath ? parseScheduleRoute(routePath) : null;

  return (
    <DesktopDetailPanelShell
      fullPageHref={parsed?.fullPageHref ?? null}
      onClose={onClose}
      emptyMessage={emptyMessage}
      showToolbar={false}
    >
      {parsed ? (
        (() => {
          switch (parsed.type) {
            case 'match-view':
              return (
                <MatchSplitDetailPanel
                  matchPublicId={parsed.matchPublicId}
                  onClose={onClose}
                  fullPageHref={parsed.fullPageHref}
                  fromSchedule={parsed.fromSchedule}
                  fromCreate={parsed.fromCreate}
                />
              );
            case 'match-manage':
              return (
                <HostMatchDetailView
                  matchIdentifier={parsed.matchPublicId}
                  onBack={onClose}
                  layoutMode="split"
                />
              );
            case 'team-match-view':
              return (
                <TeamMatchDetailPanel
                  teamCode={parsed.teamCode}
                  matchIdentifier={parsed.matchIdentifier}
                  mode="view"
                  onClose={onClose}
                  layoutMode="split"
                />
              );
            case 'team-match-manage':
              return (
                <TeamMatchDetailPanel
                  teamCode={parsed.teamCode}
                  matchIdentifier={parsed.matchIdentifier}
                  mode="manage"
                  onClose={onClose}
                  layoutMode="split"
                />
              );
            case 'tournament-view':
              return <TournamentDetailView onBack={onClose} layoutMode="split" />;
            case 'tournament-manage':
              return <TournamentManageView onBack={onClose} layoutMode="split" />;
            default:
              return null;
          }
        })()
      ) : null}
    </DesktopDetailPanelShell>
  );
}
