'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/features/match/api/queries';
import { HostMatchDetailView, TeamExerciseManageView } from '@/features/schedule/ui/detail';
import { Loader2 } from 'lucide-react';

// TODO: DB에 match_type 컬럼 추가 후 실제 타입 분기 구현
type MatchType = 'GUEST_RECRUIT' | 'TEAM_REGULAR' | 'PICKUP_GAME';

export default function MatchManagePage() {
  const params = useParams();
  const id = params.id as string;

  const { data: matchData, isLoading, error } = useMatch(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
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

  // TODO: DB에서 match_type 필드 조회 후 분기
  // 현재는 matchData에 type 필드가 없으므로 기본값 사용
  const matchType: MatchType = (matchData as { type?: MatchType }).type ?? 'GUEST_RECRUIT';

  // 타입별 관리 View 분기
  switch (matchType) {
    case 'TEAM_REGULAR':
      // 팀 정기전 관리용 뷰
      return <TeamExerciseManageView />;

    case 'GUEST_RECRUIT':
    case 'PICKUP_GAME':
    default:
      // 게스트 모집 / 픽업 게임 관리용 뷰 (호스트)
      return <HostMatchDetailView />;
  }
}
