'use client';

import { useParams } from 'next/navigation';
import { useMatch } from '@/features/match/api/queries';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { Match } from '@/features/match/model/mock-data';
import { GuestListMatch, CostType } from '@/shared/types/match';

// Adapter: GuestListMatch -> Match (Mock Type)
function adaptToDetailMatch(data: GuestListMatch): Match {
  // 가격 정보
  const priceAmount = data.price.amount ?? data.price.final ?? 0;

  // 가격 표시 문자열
  const getPriceDisplay = () => {
    if (data.price.type === CostType.FREE) return '무료';
    if (data.price.type === CostType.BEVERAGE) return `음료수 ${priceAmount}병`;
    return `${priceAmount.toLocaleString()}원`;
  };

  // matchOptions -> rule 변환
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
    address: data.location.fullAddress || data.location.address, // 전체 주소 사용
    price: getPriceDisplay(),
    priceNum: priceAmount,
    gender: data.gender as 'men' | 'women' | 'mixed',
    gameFormat: data.gameFormat ?? '',
    courtType: (data.courtType ?? 'indoor') as 'indoor' | 'outdoor',
    ageRange: data.ageMin && data.ageMax ? `${data.ageMin}대 ~ ${data.ageMax}대` : undefined,
    level: data.level, // 서버에서 받은 레벨 사용

    // Host Info
    hostName: data.hostName || '호스트',
    hostImage: '',
    teamName: data.teamName,
    teamLogo: data.teamLogo || '',
    hostMessage: data.hostNotice, // 서버에서 받은 호스트 메시지
    cancelPolicy: '시작 24시간 전 환불 불가',

    facilities: {
      ...data.facilities,
      providesBeverage: data.price.providesBeverage, // 음료 제공 여부
    },

    // 준비물 (새 필드)
    requirements: data.requirements,

    // Positions Adapter
    positions: {
      g: data.positions.G ? { status: data.positions.G.open > 0 ? 'open' : 'closed', max: (data.positions.G.open + data.positions.G.closed) } : undefined,
      f: data.positions.F ? { status: data.positions.F.open > 0 ? 'open' : 'closed', max: (data.positions.F.open + data.positions.F.closed) } : undefined,
      c: data.positions.C ? { status: data.positions.C.open > 0 ? 'open' : 'closed', max: (data.positions.C.open + data.positions.C.closed) } : undefined,
      bigman: data.positions.B ? { status: data.positions.B.open > 0 ? 'open' : 'closed', max: (data.positions.B.open + data.positions.B.closed) } : undefined,
    },

    // Rules (matchOptions에서 변환) - 값이 있을 때만 설정
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
