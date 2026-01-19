'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/features/match/api/queries';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { Match } from '@/features/match/model/mock-data';
import { GuestListMatch } from '@/shared/types/match';

// Adapter: GuestListMatch -> Match (Mock Type)
// In Phase 3, we should refactor MatchDetailView to use GuestListMatch directly.
function adaptToDetailMatch(data: GuestListMatch): Match {
  // Infer rule from game format or custom rules jsonb
  const ruleData = (data as any).rule || {}; // Assume mapped in service or default
  
  // 가격 정보 (새 스키마: amount 사용, 하위 호환: final)
  const priceAmount = data.price.amount ?? data.price.final ?? 0;

  return {
    id: data.id,
    dateISO: data.dateISO,
    startTime: data.startTime,
    endTime: data.endTime,
    title: data.title,
    location: data.location.name,
    address: data.location.address,
    price: `${priceAmount.toLocaleString()}원`,
    priceNum: priceAmount,
    gender: data.gender as 'men' | 'women' | 'mixed',
    gameFormat: data.gameFormat ?? '',
    courtType: (data.courtType ?? 'indoor') as 'indoor' | 'outdoor',
    ageRange: data.ageMin && data.ageMax ? `${data.ageMin}대 ~ ${data.ageMax}대` : undefined,
    
    // Host Info (Missing in GuestListMatch, need fetch or default)
    hostName: '호스트', 
    hostImage: '', 
    teamName: data.teamName,
    teamLogo: '', // Need to fetch
    hostMessage: '즐거운 농구 해요!', // Default
    cancelPolicy: '시작 24시간 전 환불 불가',
    
    facilities: data.facilities,
    
    // Positions Adapter
    positions: {
      g: data.positions.G ? { status: data.positions.G.open > 0 ? 'open' : 'closed', max: (data.positions.G.open + data.positions.G.closed) } : undefined,
      f: data.positions.F ? { status: data.positions.F.open > 0 ? 'open' : 'closed', max: (data.positions.F.open + data.positions.F.closed) } : undefined,
      c: data.positions.C ? { status: data.positions.C.open > 0 ? 'open' : 'closed', max: (data.positions.C.open + data.positions.C.closed) } : undefined,
    },
    
    // Rules
    rule: {
        type: '2team', // Default or derive
        quarterTime: ruleData.quarterTime || 10,
        quarterCount: ruleData.quarterCount || 4,
        fullGames: ruleData.fullGames || 0,
        guaranteedQuarters: ruleData.guaranteedQuarters || 0,
        referee: ruleData.referee || 'self'
    } as any, // Cast to avoid strict check against mock type
    
    currentPlayers: 0, // Placeholder
    totalPlayers: 0, // Placeholder
  };
}

export default function GuestMatchDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const { data: matchData, isLoading, error } = useMatch(id);

  if (isLoading) {
      return <div className="flex items-center justify-center min-h-screen">로딩중...</div>;
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

  const match = adaptToDetailMatch(matchData);

  return <MatchDetailView match={match} />;
}
