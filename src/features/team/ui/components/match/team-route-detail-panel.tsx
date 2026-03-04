'use client';

import { DesktopDetailPanelShell } from '@/shared/ui/layout';
import { TeamMatchDetailPanel } from './team-match-detail-panel';

interface TeamRouteDetailPanelProps {
  routePath: string | null;
  onClose?: () => void;
  emptyMessage?: string;
}

interface ParsedTeamMatchRoute {
  teamCode: string;
  matchIdentifier: string;
  mode: 'view' | 'manage';
  fullPageHref: string;
}

function parseTeamMatchRoute(routePath: string): ParsedTeamMatchRoute | null {
  try {
    const url = new URL(routePath, 'http://localhost');
    const segments = url.pathname.split('/').filter(Boolean);

    if (segments.length < 4) return null;
    if (segments[0] !== 'team' || segments[2] !== 'matches') return null;

    const mode: 'view' | 'manage' = segments[4] === 'manage' ? 'manage' : 'view';
    const fullPageHref = `${url.pathname}${url.search}${url.hash}`;

    return {
      teamCode: segments[1],
      matchIdentifier: segments[3],
      mode,
      fullPageHref,
    };
  } catch {
    return null;
  }
}

export function TeamRouteDetailPanel({
  routePath,
  onClose,
  emptyMessage = '왼쪽 목록에서 경기를 선택해 주세요.',
}: TeamRouteDetailPanelProps) {
  const parsed = routePath ? parseTeamMatchRoute(routePath) : null;

  return (
    <DesktopDetailPanelShell
      fullPageHref={parsed?.fullPageHref ?? null}
      onClose={onClose}
      emptyMessage={emptyMessage}
      showToolbar={false}
    >
      {parsed ? (
        <TeamMatchDetailPanel
          teamCode={parsed.teamCode}
          matchIdentifier={parsed.matchIdentifier}
          mode={parsed.mode}
          onClose={onClose}
          layoutMode="split"
        />
      ) : null}
    </DesktopDetailPanelShell>
  );
}
