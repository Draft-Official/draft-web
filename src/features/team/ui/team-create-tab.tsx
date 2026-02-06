'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, Link2, ArrowRight } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';
import { Button } from '@/shared/ui/base/button';

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TEAM_BENEFITS: BenefitItem[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: '팀원 관리',
    description: '팀원들의 정기운동 참석과 회비를 관리하세요',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: '정기운동 생성',
    description:
      '주간 운동을 자동으로 생성하고 팀원들의 참석/불참 투표를 진행해요. 인원이 부족하면 게스트 모집으로 전환할 수 있습니다.',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: '초대 링크 공유',
    description:
      '팀 생성 후 카카오톡으로 초대 링크를 공유하여 팀원을 쉽게 모집할 수 있습니다.',
  },
];

/**
 * 팀 생성하기+ 탭
 * - 팀 생성 시 이점 소개
 * - 팀 생성 버튼 → /team/create
 */
export function TeamCreateTab() {
  const router = useRouter();

  const handleCreateTeam = () => {
    router.push('/team/create');
  };

  return (
    <div className="p-4 pb-20">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-1">
          팀을 만들면 이런 기능을 써요
        </h2>
        <p className="text-sm text-slate-500">
          농구 팀 운영에 필요한 모든 기능을 제공합니다
        </p>
      </div>

      {/* 기능 소개 카드 */}
      <div className="space-y-3 mb-8">
        {TEAM_BENEFITS.map((benefit, index) => (
          <Card
            key={index}
            className="p-4 border border-slate-200 rounded-xl flex gap-4"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary flex-shrink-0">
              {benefit.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* 팀 생성 버튼 */}
      <Button
        onClick={handleCreateTeam}
        className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90"
      >
        팀 만들기
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
