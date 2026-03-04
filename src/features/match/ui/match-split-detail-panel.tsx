'use client';

import { useRouter } from 'next/navigation';
import { useMatch } from '@/features/match/api/queries';
import { MatchDetailView } from './match-detail-view';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface MatchSplitDetailPanelProps {
  matchPublicId: string;
  onClose?: () => void;
  fullPageHref: string;
  fromSchedule?: boolean;
  fromCreate?: boolean;
}

export function MatchSplitDetailPanel({
  matchPublicId,
  onClose,
  fullPageHref,
  fromSchedule,
  fromCreate,
}: MatchSplitDetailPanelProps) {
  const router = useRouter();
  const {
    data: selectedMatch,
    isLoading,
    error,
  } = useMatch(matchPublicId);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (error || !selectedMatch) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
        <p className="text-slate-700 font-semibold">상세 정보를 불러오지 못했습니다.</p>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          닫기
        </button>
      </div>
    );
  }

  return (
    <MatchDetailView
      match={selectedMatch}
      layoutMode="split"
      onClose={onClose}
      onOpenFullPage={() => router.push(fullPageHref)}
      fromSchedule={fromSchedule}
      fromCreate={fromCreate}
    />
  );
}
