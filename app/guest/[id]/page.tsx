'use client';

import { useParams } from 'next/navigation';
import { useMatches } from '../../../src/entities/match/model/match-context';
import { MatchDetailView } from '../../../src/features/match/ui/match-detail-view';

export default function GuestMatchDetailPage() {
  const params = useParams();
  const { matches } = useMatches();
  const id = params.id as string;
  const match = matches.find((m) => m.id === id);

  if (!match) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900 mb-2">매치를 찾을 수 없습니다</p>
          <p className="text-sm text-slate-500">요청하신 경기가 존재하지 않습니다</p>
        </div>
      </div>
    );
  }

  return <MatchDetailView match={match} />;
}
