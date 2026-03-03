'use client';

import { useParams } from 'next/navigation';
import { useMatch, MatchDetailView } from '@/features/match';
import { TeamExerciseDetailView } from '@/features/schedule';
import { Spinner } from '@/shared/ui/shadcn/spinner';

type MatchType =
  | 'GUEST_RECRUIT'
  | 'TEAM_MATCH'
  | 'PICKUP'
  | 'TOURNAMENT'
  | 'TOURNAMENT_MATCH';

export default function MatchDetailPage() {
  const params = useParams();
  const idParam = params?.id;
  const identifier = Array.isArray(idParam) ? (idParam[0] ?? '') : (idParam ?? '');

  const { data: matchData, isLoading, error } = useMatch(identifier);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Spinner className="w-8 h-8 text-muted-foreground " />
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">매치를 찾을 수 없습니다</p>
          <p className="text-sm text-slate-500">요청하신 경기가 존재하지 않습니다</p>
        </div>
      </div>
    );
  }

  const matchType: MatchType = (matchData as { matchType?: MatchType }).matchType ?? 'GUEST_RECRUIT';

  // 타입별 View 분기
  switch (matchType) {
    case 'TEAM_MATCH':
      // 팀 정기전용 뷰
      return <TeamExerciseDetailView />;

    case 'GUEST_RECRUIT':
    case 'PICKUP':
    case 'TOURNAMENT':
    case 'TOURNAMENT_MATCH':
    default:
      // 게스트 모집 / 픽업 게임용 뷰
      return <MatchDetailView match={matchData} />;
  }
}
