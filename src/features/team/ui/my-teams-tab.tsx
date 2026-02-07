'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import { ScrollArea, ScrollBar } from '@/shared/ui/base/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/shadcn/alert';
import { useAuth } from '@/features/auth/model/auth-context';
import { useMyTeams } from '../api/core/queries';
import { TeamProfileCard } from './components/team-profile-card';

/**
 * 나의 팀 탭
 * - 소속 팀 카드 (가로 스크롤)
 * - 미투표 경기 목록
 * - 팀 없음 Empty State
 */
export function MyTeamsTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: teams, isLoading } = useMyTeams(user?.id);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // 팀이 없는 경우 Empty State
  if (!teams || teams.length === 0) {
    return (
      <div className="p-4">
        <Alert className="bg-white border-slate-200">
          <Users className="h-5 w-5 text-slate-400" />
          <AlertTitle className="font-bold text-slate-900">
            소속 팀이 없습니다
          </AlertTitle>
          <AlertDescription className="text-slate-500 mt-1">
            팀을 만들어 정기운동을 관리하고 팀원들과 함께 농구를 즐겨보세요.
            <br />
            <Button
              variant="link"
              className="p-0 h-auto text-primary font-bold"
              onClick={() => {
                // 팀 생성하기+ 탭으로 이동 (탭 전환)
                const trigger = document.querySelector(
                  '[data-state="inactive"][value="create-team"]'
                ) as HTMLButtonElement;
                trigger?.click();
              }}
            >
              팀 생성하기+ 탭에서 시작하기 →
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* 나의 팀 카드 섹션 */}
      <section className="py-4">
        <ScrollArea className="w-full">
          <div className="flex gap-3 px-4">
            {teams.map((team) => (
              <TeamProfileCard
                key={team.id}
                id={team.id}
                code={team.code}
                name={team.name}
                logoUrl={team.logoUrl}
                role={team.role}
                regularDay={team.regularDay}
                regularTime={team.regularTime}
                homeGymName={team.homeGymName}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* 미투표 경기 섹션 */}
      <section className="px-4">
        <h2 className="font-bold text-slate-900 text-lg mb-3">미투표 경기</h2>
        <PendingVoteMatches teamIds={teams.map((t) => t.id)} />
      </section>
    </div>
  );
}

/**
 * 미투표 경기 목록 컴포넌트
 * TODO: useMyPendingVoteMatches 쿼리 구현 후 연동
 */
function PendingVoteMatches({ teamIds }: { teamIds: string[] }) {
  // TODO: 실제 API 연동
  // const { data: matches } = useMyPendingVoteMatches(teamIds);

  // 임시 mock 데이터 (API 연동 전)
  const mockMatches = [
    {
      id: '1',
      teamName: 'PoK',
      date: '2026. 02. 07 (토)',
      time: '13:00',
      gymName: '서초종합체육관',
      attending: 7,
      notAttending: 2,
      pending: 3,
    },
    {
      id: '2',
      teamName: 'PoK',
      date: '2026. 02. 14 (토)',
      time: '13:00',
      gymName: '서초종합체육관',
      attending: 0,
      notAttending: 0,
      pending: 12,
    },
  ];

  if (mockMatches.length === 0) {
    return (
      <p className="text-sm text-slate-400 py-4 text-center">
        투표할 경기가 없습니다
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {mockMatches.map((match) => (
        <Card
          key={match.id}
          className="p-4 border border-slate-200 rounded-xl cursor-pointer hover:shadow-sm transition-shadow"
        >
          {/* 투표중 뱃지 */}
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0 mb-3 text-xs font-bold">
            투표중
          </Badge>

          {/* 경기 정보 */}
          <div className="space-y-1.5 mb-3">
            <div className="flex items-center gap-2 text-sm text-slate-900">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="font-medium">
                {match.date} {match.time}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{match.gymName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center text-[10px]">
                {match.teamName.charAt(0)}
              </div>
              <span>{match.teamName}</span>
            </div>
          </div>

          {/* 투표 현황 */}
          <div className="flex items-center gap-4 pt-3 border-t border-slate-100 text-sm">
            <span>
              참석 <strong className="text-green-600">{match.attending}명</strong>
            </span>
            <span>
              불참 <strong className="text-red-500">{match.notAttending}명</strong>
            </span>
            <span>
              미투표 <strong className="text-slate-600">{match.pending}명</strong>
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
