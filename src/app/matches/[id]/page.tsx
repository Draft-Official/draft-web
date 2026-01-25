'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/features/match/api/queries';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { TeamExerciseDetailView } from '@/features/schedule/ui/detail';
import { Match } from '@/features/match/model/types';
import { GuestListMatch } from '@/features/match/model/types';
import { CostType } from '@/shared/config/constants';
import { Loader2 } from 'lucide-react';

// Adapter: GuestListMatch -> Match (Mock Type)
function adaptToDetailMatch(data: GuestListMatch): Match {
  const priceAmount = data.price.amount ?? data.price.final ?? 0;

  const getPriceDisplay = () => {
    if (data.price.type === CostType.FREE) return '무료';
    if (data.price.type === CostType.BEVERAGE) return `음료수 ${priceAmount}병`;
    return `${priceAmount.toLocaleString()}원`;
  };

  const matchOptions = data.matchOptions;
  const playStyleToRuleType: Record<string, '2team' | '3team' | 'exchange' | 'lesson'> = {
    INTERNAL_2WAY: '2team',
    INTERNAL_3WAY: '3team',
    EXCHANGE: 'exchange',
    PRACTICE: 'lesson',
  };
  const refereeTypeMap: Record<string, 'self' | 'guest' | 'pro'> = {
    SELF: 'self',
    STAFF: 'guest',
    PRO: 'pro',
  };

  return {
    id: data.id,
    dateISO: data.dateISO,
    startTime: data.startTime,
    endTime: data.endTime,
    title: data.title,
    location: data.location.name,
    address: data.location.fullAddress || data.location.address,
    price: getPriceDisplay(),
    priceNum: priceAmount,
    gender: data.gender as 'MALE' | 'FEMALE' | 'MIXED',
    gameFormat: data.gameFormat ?? '',
    courtType: (data.courtType ?? 'indoor') as 'indoor' | 'outdoor',
    ageRange: data.ageMin && data.ageMax ? `${data.ageMin}대 ~ ${data.ageMax}대` : undefined,
    level: data.level,
    hostName: data.hostName || '호스트',
    hostImage: '',
    teamName: data.teamName,
    teamLogo: data.teamLogo || '',
    hostMessage: data.hostNotice,
    cancelPolicy: '시작 24시간 전 환불 불가',
    facilities: {
      ...data.facilities,
      providesBeverage: data.price.providesBeverage,
    },
    requirements: data.requirements,
    positions: {
      g: data.positions.G ? { status: data.positions.G.open > 0 ? 'open' : 'closed', max: (data.positions.G.open + data.positions.G.closed) } : undefined,
      f: data.positions.F ? { status: data.positions.F.open > 0 ? 'open' : 'closed', max: (data.positions.F.open + data.positions.F.closed) } : undefined,
      c: data.positions.C ? { status: data.positions.C.open > 0 ? 'open' : 'closed', max: (data.positions.C.open + data.positions.C.closed) } : undefined,
      bigman: data.positions.B ? { status: data.positions.B.open > 0 ? 'open' : 'closed', max: (data.positions.B.open + data.positions.B.closed) } : undefined,
    },
    rule: matchOptions ? {
      type: matchOptions.playStyle ? playStyleToRuleType[matchOptions.playStyle] : '2team',
      quarterTime: matchOptions.quarterRule?.minutesPerQuarter ?? 0,
      quarterCount: matchOptions.quarterRule?.quarterCount ?? 0,
      fullGames: matchOptions.quarterRule?.gameCount ?? 0,
      guaranteedQuarters: matchOptions.guaranteedQuarters ?? 0,
      referee: matchOptions.refereeType ? refereeTypeMap[matchOptions.refereeType] : 'self',
    } : undefined,
    currentPlayers: 0,
    totalPlayers: 0,
  };
}

// TODO: DB에 match_type 컬럼 추가 후 실제 타입 분기 구현
type MatchType = 'GUEST_RECRUIT' | 'TEAM_REGULAR' | 'PICKUP_GAME';

export default function MatchDetailPage() {
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

  // 타입별 View 분기
  switch (matchType) {
    case 'TEAM_REGULAR':
      // 팀 정기전용 뷰
      return <TeamExerciseDetailView />;

    case 'GUEST_RECRUIT':
    case 'PICKUP_GAME':
    default:
      // 게스트 모집 / 픽업 게임용 뷰
      const match = adaptToDetailMatch(matchData);
      return <MatchDetailView match={match} />;
  }
}
